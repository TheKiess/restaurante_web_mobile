import { Prisma }                           from '../generated/prisma/client.js';
import { SituacaoComanda, SituacaoReserva } from '../generated/prisma/enums.js';
import {
  buscarReservaEmConflito,
  buscarReservaSegurandoMesa,
  expirarReservasVencidas,
  formatarHorario,
  somarMinutos
}                                           from './regras-reserva.js';

const DT_AGORA = new Date('2026-11-20T18:00:00.000Z');

function criarBancoFalso()
{
  const reserva = { findFirst: vi.fn(), updateMany: vi.fn() };

  return { reserva, database: { reserva } as unknown as Prisma.TransactionClient };
}

describe('somarMinutos', () => {
  it('soma minutos sem alterar a data original', () => {
    const dtBase = new Date('2026-11-20T18:00:00.000Z');

    expect(somarMinutos(dtBase, 15).toISOString()).toBe('2026-11-20T18:15:00.000Z');
    expect(dtBase.toISOString()).toBe('2026-11-20T18:00:00.000Z');
  });

  it('aceita minutos negativos', () => {
    expect(somarMinutos(DT_AGORA, -120).toISOString()).toBe('2026-11-20T16:00:00.000Z');
  });
});

describe('formatarHorario', () => {
  it('mostra o horário no fuso de São Paulo', () => {
    expect(formatarHorario(new Date('2026-11-20T17:30:00.000Z'))).toBe('14:30');
  });

  it('vira o dia certo ao converter do UTC', () => {
    expect(formatarHorario(new Date('2026-11-21T02:05:00.000Z'))).toBe('23:05');
  });
});

describe('regras que consultam o banco', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(DT_AGORA);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('expira só reservas confirmadas com o limite de check-in já vencido', async () => {
    const { reserva, database } = criarBancoFalso();

    await expirarReservasVencidas(database);

    expect(reserva.updateMany).toHaveBeenCalledWith({
      where: { id_situacao: SituacaoReserva.CONFIRMADA, dt_limite_checkin: { lt: DT_AGORA } },
      data: { id_situacao: SituacaoReserva.EXPIRADA }
    });
  });

  it('considera que a reserva segura a mesa desde 15 minutos antes até o limite do check-in', async () => {
    const { reserva, database } = criarBancoFalso();

    await buscarReservaSegurandoMesa(database, 7);

    expect(reserva.findFirst).toHaveBeenCalledWith({
      where: {
        id_mesa: 7,
        id_situacao: SituacaoReserva.CONFIRMADA,
        dt_limite_checkin: { gte: DT_AGORA },
        dt_reserva: { lte: new Date('2026-11-20T18:15:00.000Z') }
      }
    });
  });

  it('procura conflito 120 minutos antes e depois do horário pedido', async () => {
    const { reserva, database } = criarBancoFalso();
    const dtReserva = new Date('2026-11-21T22:00:00.000Z');

    await buscarReservaEmConflito(database, 3, dtReserva);

    const { where } = reserva.findFirst.mock.calls[0][0];

    expect(where.id_mesa).toBe(3);
    expect(where.dt_reserva).toEqual({
      gt: new Date('2026-11-21T20:00:00.000Z'),
      lt: new Date('2026-11-22T00:00:00.000Z')
    });
  });

  it('só conta como conflito reserva confirmada ou check-in com comanda ainda aberta', async () => {
    const { reserva, database } = criarBancoFalso();

    await buscarReservaEmConflito(database, 3, DT_AGORA);

    const { where } = reserva.findFirst.mock.calls[0][0];

    expect(where.OR).toEqual([
      { id_situacao: SituacaoReserva.CONFIRMADA },
      { id_situacao: SituacaoReserva.CHECKIN, comanda: { is: { id_situacao: SituacaoComanda.ABERTA } } }
    ]);
  });

  it('ignora a própria reserva ao editar', async () => {
    const { reserva, database } = criarBancoFalso();

    await buscarReservaEmConflito(database, 3, DT_AGORA, 42);

    expect(reserva.findFirst.mock.calls[0][0].where.id_reserva).toEqual({ not: 42 });
  });
});
