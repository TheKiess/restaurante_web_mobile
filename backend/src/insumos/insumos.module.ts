import { Module }            from '@nestjs/common';
import { InsumosService }    from './insumos.service.js';
import { InsumosController } from './insumos.controller.js';
import { PrismaModule }      from '../prisma/prisma.module.js';

@Module({
  imports:     [PrismaModule],
  controllers: [InsumosController],
  providers:   [InsumosService]
})

export class InsumosModule {}
