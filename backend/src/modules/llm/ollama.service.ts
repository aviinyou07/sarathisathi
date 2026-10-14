import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  private readonly modelName = process.env.OLLAMA_MODEL || 'llama3.2:3b';

  async streamChat(messages: OllamaChatMessage[], res: Response): Promise<void> {
    try {
      this.logger.log(`Forwarding query to Ollama model (${this.modelName}) at ${this.ollamaUrl}...`);
      
      const response = await fetch(`${this.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          stream: true,
          options: {
            temperature: 0.35,
            num_ctx: 2048,
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Ollama responded with status: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(Boolean);

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.content) {
                res.write(`data: ${JSON.stringify({ text: parsed.message.content })}\n\n`);
              }
              if (parsed.done) {
                res.write('data: [DONE]\n\n');
                res.end();
                return;
              }
            } catch {
              // Ignore partial chunk split parse errors
            }
          }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      this.logger.error(`Ollama streaming error: ${error.message}`);
      res.write(
        `data: ${JSON.stringify({
          error: 'Connection to divine counsel disrupted. Please ensure Ollama is running (`systemctl status ollama`).',
        })}\n\n`,
      );
      res.end();
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.ollamaUrl}/api/tags`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }
}
