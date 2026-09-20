import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service.js';
import { CategoriasController } from './categorias.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriasController],
  providers: [CategoriasService],
})
export class CategoriasModule {}
