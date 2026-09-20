import { Module } from '@nestjs/common';
import { ComandasService } from './comandas.service.js';
import { ComandasController } from './comandas.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ComandasController],
  providers: [ComandasService],
})

export class ComandasModule {}
