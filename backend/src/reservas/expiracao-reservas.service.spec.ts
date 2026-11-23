import { SituacaoReserva }            from '../generated/prisma/enums.js';
import type { PrismaService }         from '../prisma/prisma.service.js';
import { ExpiracaoReservasService }   from './expiracao-reservas.service.js';

describe('ExpiracaoReservasService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-20T18:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('marca como expiradas as reservas confirmadas que passaram do limite de check-in', async () => {
    const updateMany = vi.fn();
    const servico    = new ExpiracaoReservasService({ reserva: { updateMany } } as unknown as PrismaService);

    await servico.expirarReservas();

    expect(updateMany).toHaveBeenCalledWith({
      where: { id_situacao: SituacaoReserva.CONFIRMADA, dt_limite_checkin: { lt: new Date('2026-11-20T18:00:00.000Z') } },
      data: { id_situacao: SituacaoReserva.EXPIRADA }
    });
  });
});
