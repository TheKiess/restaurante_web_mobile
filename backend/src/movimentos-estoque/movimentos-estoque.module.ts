import { Module }                      from '@nestjs/common';
import { MovimentosEstoqueService }    from './movimentos-estoque.service.js';
import { MovimentosEstoqueController } from './movimentos-estoque.controller.js';
import { PrismaModule }                from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [MovimentosEstoqueController],
  providers: [MovimentosEstoqueService],
  exports: [MovimentosEstoqueService],
})

export class MovimentosEstoqueModule {}
