import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LocalEmbedderService } from './local-embedder.service';

export interface SpiritualSnippet {
  source_type: string;
  id: number;
  reference: string;
  content: string;
  similarity: number;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly localEmbedder: LocalEmbedderService,
  ) {}

  async retrieveWisdom(query: string, limit = 3): Promise<SpiritualSnippet[]> {
    try {
      // 1. Generate local 384-dim vector with zero API cost
      const vector = await this.localEmbedder.generateEmbedding(query);
      const vectorString = `[${vector.join(',')}]`;

      // 2. Query PostgreSQL similarity search RPC
      const results: SpiritualSnippet[] = await this.dataSource.query(
        `SELECT * FROM search_spiritual_wisdom($1::vector, $2, $3)`,
        [vectorString, 0.35, limit],
      );

      return results;
    } catch (error) {
      this.logger.error(`Vector retrieval failed: ${error.message}`);
      // Fallback: If vector extension is warming up, query top classic verses
      const fallback = await this.dataSource.query(
        `SELECT 'gita' AS source_type, id, ('Chapter ' || chapter || ', Verse ' || verse) AS reference,
                (sanskrit || E'\n\n' || english_translation || E'\n\nCommentary: ' || commentary) AS content,
                0.5 AS similarity
         FROM gita_verses
         ORDER BY id ASC LIMIT $1`,
        [limit],
      );
      return fallback;
    }
  }
}
