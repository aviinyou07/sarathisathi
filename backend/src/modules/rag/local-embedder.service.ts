import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

@Injectable()
export class LocalEmbedderService implements OnModuleInit {
  private readonly logger = new Logger(LocalEmbedderService.name);
  private pipe: any;

  async onModuleInit() {
    this.logger.log('Initializing local embedding model (Xenova/all-MiniLM-L6-v2, 384-dim)...');
    try {
      const { pipeline } = await import('@xenova/transformers');
      this.pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
      this.logger.log('Local embedding model loaded successfully in-process.');
    } catch (err) {
      this.logger.error('Failed to load local embedding model:', err);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.pipe) {
      const { pipeline } = await import('@xenova/transformers');
      this.pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
    }

    const clean = text.replace(/\n+/g, ' ').slice(0, 512);
    const output = await this.pipe(clean, {
      pooling: 'mean',
      normalize: true,
    });
    return Array.from(output.data);
  }
}
