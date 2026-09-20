import { Module } from '@nestjs/common';
import { ItensCardapioService } from './itens-cardapio.service.js';
import { ItensCardapioController } from './itens-cardapio.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ItensCardapioController],
  providers: [ItensCardapioService]
})

export class ItensCardapioModule {}