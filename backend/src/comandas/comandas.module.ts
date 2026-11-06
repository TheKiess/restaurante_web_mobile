import { Module }                  from '@nestjs/common';
import { ComandasService }         from './comandas.service.js';
import { ComandasController }      from './comandas.controller.js';
import { PrismaModule }            from '../prisma/prisma.module.js';
import { MovimentosEstoqueModule } from '../movimentos-estoque/movimentos-estoque.module.js';

@Module({
  imports: [PrismaModule, MovimentosEstoqueModule],
  controllers: [ComandasController],
  providers: [ComandasService]
})

export class ComandasModule {}
