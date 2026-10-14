import { Module } from '@nestjs/common';
import { ConsultController } from './consult.controller';
import { ConsultService } from './consult.service';
import { RagModule } from '../rag/rag.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [RagModule, LlmModule],
  controllers: [ConsultController],
  providers: [ConsultService],
  exports: [ConsultService],
})
export class ConsultModule {}
