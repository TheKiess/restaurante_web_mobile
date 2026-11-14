import { Prisma }                           from '../generated/prisma/client.js';
import { SituacaoComanda, SituacaoReserva } from '../generated/prisma/enums.js';
import {
  DS_FUSO_HORARIO,
  NR_MINUTOS_CHECKIN_ANTECIPADO,
  NR_MINUTOS_DURACAO_RESERVA,
}                                           from './reservas.constantes.js';

const NR_MS_POR_MINUTO = 60_000;

export function somarMinutos(dtBase: Date, qtMinutos: number): Date
{
  return new Date(dtBase.getTime() + qtMinutos * NR_MS_POR_MINUTO);
}

export function formatarHorario(dtHorario: Date): string
{
  return dtHorario.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: DS_FUSO_HORARIO });
}

export async function expirarReservasVencidas(database: Prisma.TransactionClient): Promise<void>
{
  await database.reserva.updateMany({
    where: { id_situacao: SituacaoReserva.CONFIRMADA, dt_limite_checkin: { lt: new Date() } },
    data: { id_situacao: SituacaoReserva.EXPIRADA },
  });
}

// Reserva confirmada que está segurando a mesa agora: do começo da janela de check-in até o limite.
export function buscarReservaSegurandoMesa(database: Prisma.TransactionClient, nrIdMesa: number)
{
  const dtAgora = new Date();

  return database.reserva.findFirst({
    where: {
      id_mesa: nrIdMesa,
      id_situacao: SituacaoReserva.CONFIRMADA,
      dt_limite_checkin: { gte: dtAgora },
      dt_reserva: { lte: somarMinutos(dtAgora, NR_MINUTOS_CHECKIN_ANTECIPADO) },
    },
  });
}

// Outra reserva da mesma mesa dentro da duração de uma reserva (antes ou depois do horário pedido).
export function buscarReservaEmConflito(database: Prisma.TransactionClient, nrIdMesa: number, dtReserva: Date, nrIdReservaIgnorada?: number)
{
  return database.reserva.findFirst({
    where: {
      id_mesa: nrIdMesa,
      id_reserva: { not: nrIdReservaIgnorada },
      OR: [
        { id_situacao: SituacaoReserva.CONFIRMADA },
        { id_situacao: SituacaoReserva.CHECKIN,
          comanda: {
            is: {
              id_situacao: SituacaoComanda.ABERTA
            }
          }
        }
      ],
      dt_reserva: {
        gt: somarMinutos(dtReserva, -NR_MINUTOS_DURACAO_RESERVA),
        lt: somarMinutos(dtReserva, NR_MINUTOS_DURACAO_RESERVA)
      }
    }
  });
}
