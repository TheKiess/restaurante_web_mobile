import { Module } from '@nestjs/common';
import { PagamentosService } from './pagamentos.service.js';
import { PagamentosController } from './pagamentos.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PagamentosController],
  providers: [PagamentosService],
})

export class PagamentosModule {}