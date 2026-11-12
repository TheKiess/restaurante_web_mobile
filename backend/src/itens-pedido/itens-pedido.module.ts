import { Module }                  from '@nestjs/common';
import { ItensPedidoService }      from './itens-pedido.service.js';
import { ItensPedidoController }   from './itens-pedido.controller.js';
import { PrismaModule }            from '../prisma/prisma.module.js';
import { MovimentosEstoqueModule } from '../movimentos-estoque/movimentos-estoque.module.js';

@Module({
  imports: [PrismaModule, MovimentosEstoqueModule],
  controllers: [ItensPedidoController],
  providers: [ItensPedidoService],
})

export class ItensPedidoModule {}
