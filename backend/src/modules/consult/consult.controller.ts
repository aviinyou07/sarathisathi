import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ConsultService } from './consult.service';
import { ConsultQueryDto } from './dto/consult-query.dto';

@Controller('consult')
export class ConsultController {
  constructor(private readonly consultService: ConsultService) {}

  @Post('stream')
  @HttpCode(HttpStatus.OK)
  async streamCounsel(
    @Body() dto: ConsultQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    await this.consultService.generateStream(dto.userId || dto.deviceId, dto.message, res);
  }
}
