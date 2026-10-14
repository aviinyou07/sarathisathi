import { Controller, Get } from '@nestjs/common';
import { OllamaService } from './modules/llm/ollama.service';

@Controller()
export class AppController {
  constructor(private readonly ollamaService: OllamaService) {}

  @Get('health')
  async healthCheck() {
    const ollamaOk = await this.ollamaService.isAvailable();
    return {
      status: 'ok',
      service: 'Sarathi Sakha Backend',
      ollama_available: ollamaOk,
      timestamp: new Date().toISOString(),
    };
  }
}
