import { Module }             from '@nestjs/common';
import { ReservasService }    from './reservas.service.js';
import { ReservasController } from './reservas.controller.js';
import { PrismaModule }       from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ReservasController],
  providers: [ReservasService],
})

export class ReservasModule {}
