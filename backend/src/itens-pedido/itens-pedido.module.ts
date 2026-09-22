import { Module } from '@nestjs/common';
import { ItensPedidoService } from './itens-pedido.service.js';
import { ItensPedidoController } from './itens-pedido.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ItensPedidoController],
  providers: [ItensPedidoService],
})

export class ItensPedidoModule {}
