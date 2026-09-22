import { Module } from '@nestjs/common';
import { MesasService } from './mesas.service.js';
import { MesasController } from './mesas.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [MesasController],
  providers: [MesasService],
})

export class MesasModule {}
