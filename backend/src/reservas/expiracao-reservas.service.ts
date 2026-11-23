import { Injectable }              from '@nestjs/common';
import { Cron, CronExpression }    from '@nestjs/schedule';
import { PrismaService }           from '../prisma/prisma.service.js';
import { expirarReservasVencidas } from './regras-reserva.js';

@Injectable()
export class ExpiracaoReservasService
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * As consultas não alteram mais o banco:
   * esta tarefa marca como expiradas as reservas que passaram do limite de check-in.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async expirarReservas()
  {
    await expirarReservasVencidas(this.prisma);
  }
}
