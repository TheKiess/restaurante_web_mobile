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
  const arrOrigensFrontend = (process.env.FRONTEND_URL ?? 'http://localhost:3001')
    .split(',')
    .map((origem) => origem.trim())
    .filter(Boolean);
  app.enableCors({ origin: arrOrigensFrontend });
  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();