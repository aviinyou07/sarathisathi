import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { LocalEmbedderService } from './local-embedder.service';

@Module({
  providers: [LocalEmbedderService, RagService],
  exports: [RagService, LocalEmbedderService],
})
export class RagModule {}
