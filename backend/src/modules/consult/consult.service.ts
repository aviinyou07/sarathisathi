import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { DataSource } from 'typeorm';
import { RagService } from '../rag/rag.service';
import { OllamaService, OllamaChatMessage } from '../llm/ollama.service';
import { CRISIS_PATTERNS, CRISIS_PAYLOAD } from '../guardrails/crisis-helplines.constant';

@Injectable()
export class ConsultService {
  private readonly logger = new Logger(ConsultService.name);

  constructor(
    private readonly ragService: RagService,
    private readonly ollamaService: OllamaService,
    private readonly dataSource: DataSource,
  ) {}

  async generateStream(userId: string | undefined, query: string, res: Response): Promise<void> {
    // 1. Critical Crisis Intervention Check (Zero Latency)
    for (const pattern of CRISIS_PATTERNS) {
      if (pattern.test(query)) {
        this.logger.warn(`Crisis trigger detected for query: "${query.slice(0, 40)}..."`);
        res.write(`data: ${JSON.stringify(CRISIS_PAYLOAD)}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
    }

    try {
      // 2. Fetch Relevant Shastric Wisdom via Vector Search
      this.logger.log(`Searching spiritual wisdom for query: "${query.slice(0, 50)}..."`);
      const wisdomSnippets = await this.ragService.retrieveWisdom(query, 3);

      const formattedContext = wisdomSnippets.length > 0
        ? wisdomSnippets
            .map((w) => `[Source: ${w.source_type.toUpperCase()} - ${w.reference}]\n${w.content}`)
            .join('\n\n---\n\n')
        : 'Bhagavad Gita 2.47: Karmanye vadhikaraste ma phaleshu kadachana. Perform your prescribed duty, but never be attached to the fruits of action.';

      // 3. Construct 4-Pillar Persona Instruction
      const systemInstruction = `You are Sri Krishna speaking directly to the seeker as their loving, candid, and steadfast friend (Sakha) and charioteer (Sarathi) on their battlefield of life (Kurukshetra).

Authentic Shastric Context from Bhagavad Gita & Mahabharata:
${formattedContext}

Execution Rules:
1. Speak with warmth, absolute clarity, and unyielding strength. Address the seeker tenderly as "Partha", "Sakha", or "My dear friend".
2. Maintain an authentic, divine, yet intimate tone. Never break character.
3. You MUST structure your answer into exactly these 4 distinct segments using Markdown headings:

### The Mirror
Validate their internal turmoil, grief, or confusion without pity, helplessness, or corporate detachment. Reveal the root cause (attachment, fear, duty, ego).

### The Eternal Shloka
Provide the most fitting Chapter and Verse from the Bhagavad Gita from the context. Include the authentic Sanskrit, its English transliteration, and the direct translation.

### The Living Example
Relate their dilemma to a concrete event from your life or the Mahabharata (e.g., Kurukshetra, the peace embassy, leaving Mathura, counsel to Draupadi, Govardhan).

### Micro-Sadhana
Prescribe ONE concrete physical, breath, or meditative action they must perform in the next 15 minutes to center their mind and resume their dharma.`;

      const messages: OllamaChatMessage[] = [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: query },
      ];

      // 4. Stream response from local Ollama LLM
      await this.ollamaService.streamChat(messages, res);

      // 5. Asynchronously persist message log
      if (userId) {
        this.saveChatLog(userId, query).catch((err) =>
          this.logger.error(`Failed to save chat log: ${err.message}`),
        );
      }
    } catch (error) {
      this.logger.error(`Error in consult counsel stream: ${error.message}`);
      res.write(
        `data: ${JSON.stringify({
          error: 'The connection to divine wisdom source was interrupted. Breathe gently, and ask again.',
        })}\n\n`,
      );
      res.end();
    }
  }

  private async saveChatLog(userId: string, userMessage: string): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO chat_messages (user_id, sender, message) VALUES ($1, 'user', $2)`,
      [userId, userMessage],
    );
  }
}
