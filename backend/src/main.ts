import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('SarathiSakhaBootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for mobile app & local network testing
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🕉️ Sarathi Sakha Backend running at http://localhost:${port}`);
  logger.log(`🌊 SSE Stream endpoint: POST http://localhost:${port}/consult/stream`);
}

bootstrap();
