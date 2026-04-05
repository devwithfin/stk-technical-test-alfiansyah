import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  const conf = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API Documentation Menu Tree System')
    .addTag('menu')
    .build();

  const doc = SwaggerModule.createDocument(app, conf);

  SwaggerModule.setup('api', app, doc);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
