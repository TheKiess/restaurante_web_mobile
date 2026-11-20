import { ValidationPipe }              from '@nestjs/common';
import { NestFactory }                 from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule }                   from './app.module.js';
import { DS_DIRETORIO_UPLOADS }        from './itens-cardapio/imagem-cardapio.js';

async function bootstrap()
{
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useStaticAssets(DS_DIRETORIO_UPLOADS, {
    prefix: '/uploads/',
    index: false,
    setHeaders: (resposta) => resposta.setHeader('X-Content-Type-Options', 'nosniff'),
  });
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3001' });
  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();