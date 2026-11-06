import { BadRequestException, ConflictException, Injectable, NotFoundException }           from '@nestjs/common';
import { PrismaService }                                                                   from '../prisma/prisma.service.js';
import { travarMesa }                                                                      from '../prisma/travas.js';
import { Prisma }                                                                          from '../generated/prisma/client.js';
import { Perfil, SituacaoComanda, SituacaoReserva }                                        from '../generated/prisma/enums.js';
import type { PayloadToken }                                                               from '../auth/auth.types.js';
import { CreateReservaDto }                                                                from './dto/create-reserva.dto.js';
import { ListarReservasQueryDto }                                                          from './dto/listar-reservas-query.dto.js';
import { buscarReservaEmConflito, expirarReservasVencidas, formatarHorario, somarMinutos } from './regras-reserva.js';
import {
  NR_DIAS_MAXIMOS_ANTECEDENCIA,
  NR_MINUTOS_CHECKIN_ANTECIPADO,
  NR_MINUTOS_TOLERANCIA_CHECKIN,
}                                                                                          from './reservas.constantes.js';

const INCLUIR_DETALHES = {
  mesa: true,
  usuario: {
    select: {
      id_usuario: true,
      ds_apelido: true,
      pessoa: { select: { nm_pessoa: true }}
    }
  }
} satisfies Prisma.ReservaInclude;

@Injectable()
export class ReservasService
{
  constructor(private readonly prisma: PrismaService) {}

  async criarReserva(createReservaDto: CreateReservaDto, usuarioLogado: PayloadToken)
  {
    const { id_mesa, qt_pessoas } = createReservaDto;
    const nrIdUsuario             = this.descobrirDonoDaReserva(createReservaDto, usuarioLogado);
    const dtReserva               = new Date(createReservaDto.dt_reserva);

    this.validarDataDaReserva(dtReserva);
    await this.validarUsuario(nrIdUsuario);

    const reserva = await this.prisma.$transaction(async (transacao) => {
      await expirarReservasVencidas(transacao);

      const nrIdMesa = id_mesa
        ? await this.reservarMesaInformada(transacao, id_mesa, qt_pessoas, dtReserva)
        : await this.escolherMesaLivre(transacao, qt_pessoas, dtReserva);

      return transacao.reserva.create({
        data: {
          id_usuario: nrIdUsuario,
          id_mesa: nrIdMesa,
          qt_pessoas,
          dt_reserva: dtReserva,
          dt_limite_checkin: somarMinutos(dtReserva, NR_MINUTOS_TOLERANCIA_CHECKIN)
        },
        include: INCLUIR_DETALHES
      });
    });

    return reserva;
  }

  async listarReservas(listarReservasQueryDto: ListarReservasQueryDto, usuarioLogado: PayloadToken)
  {
    await expirarReservasVencidas(this.prisma);

    const { id_situacao, id_mesa, id_usuario, dt_de, dt_ate } = listarReservasQueryDto;
    const ehCliente                                          = usuarioLogado.perfil === Perfil.CLIENTE;

    return this.prisma.reserva.findMany({
      where: {
        id_situacao,
        id_mesa,
        id_usuario: ehCliente ? usuarioLogado.sub : id_usuario,
        dt_reserva: {
          gte: dt_de  ? new Date(dt_de)  : undefined,
          lte: dt_ate ? new Date(dt_ate) : undefined,
        }
      },
      include: INCLUIR_DETALHES,
      orderBy: { dt_reserva: 'asc' }
    });
  }

  async buscarReservaPorId(nrId: number, usuarioLogado: PayloadToken)
  {
    await expirarReservasVencidas(this.prisma);

    const reserva = await this.prisma.reserva.findUnique({ where: { id_reserva: nrId }, include: INCLUIR_DETALHES });

    if (!reserva || !this.podeVerReserva(reserva.id_usuario, usuarioLogado))
      throw new NotFoundException(`Reserva ${nrId} não encontrada!`);

    return reserva;
  }

  async cancelarReserva(nrId: number, usuarioLogado: PayloadToken)
  {
    await this.buscarReservaPorId(nrId, usuarioLogado);

    const { count } = await this.prisma.reserva.updateMany({
      where: { id_reserva: nrId, id_situacao: SituacaoReserva.CONFIRMADA },
      data: { id_situacao: SituacaoReserva.CANCELADA }
    });

    if (count === 0)
      throw new ConflictException('Só é possível cancelar uma reserva confirmada!');

    return this.buscarReservaPorId(nrId, usuarioLogado);
  }

  async fazerCheckin(nrId: number)
  {
    return this.prisma.$transaction(async (transacao) => {
      await expirarReservasVencidas(transacao);

      const reservaInicial = await transacao.reserva.findUnique({ where: { id_reserva: nrId } });

      if (!reservaInicial)
        throw new NotFoundException(`Reserva ${nrId} não encontrada!`);

      await travarMesa(transacao, reservaInicial.id_mesa);

      const reserva = await transacao.reserva.findUnique({ where: { id_reserva: nrId }, include: { mesa: true } });

      if (!reserva)
        throw new NotFoundException(`Reserva ${nrId} não encontrada!`);

      if (reserva.id_situacao !== SituacaoReserva.CONFIRMADA)
        throw new ConflictException(`Só é possível fazer check-in de uma reserva confirmada (situação atual: ${reserva.id_situacao})!`);

      const dtAgora         = new Date();
      const dtInicioCheckin = somarMinutos(reserva.dt_reserva, -NR_MINUTOS_CHECKIN_ANTECIPADO);

      if (dtAgora < dtInicioCheckin)
        throw new ConflictException(`O check-in só abre às ${formatarHorario(dtInicioCheckin)}!`);

      const comandaAberta = await transacao.comanda.findFirst({
        where: { id_mesa: reserva.id_mesa, id_situacao: SituacaoComanda.ABERTA },
      });

      if (comandaAberta)
        throw new ConflictException(`Mesa ${reserva.mesa.nr_mesa} ainda tem uma comanda aberta!`);

      const comanda = await transacao.comanda.create({
        data: { id_usuario: reserva.id_usuario, id_mesa: reserva.id_mesa, id_reserva: reserva.id_reserva }
      });

      await transacao.reserva.update({
        where: { id_reserva: nrId },
        data: { id_situacao: SituacaoReserva.CHECKIN, dt_checkin: dtAgora }
      });

      return comanda;
    });
  }

  private descobrirDonoDaReserva(createReservaDto: CreateReservaDto, usuarioLogado: PayloadToken): number
  {
    if (usuarioLogado.perfil === Perfil.CLIENTE)
      return usuarioLogado.sub;

    if (!createReservaDto.id_usuario)
      throw new BadRequestException('Informe o cliente da reserva (id_usuario)!');

    return createReservaDto.id_usuario;
  }

  private podeVerReserva(nrIdDono: number, usuarioLogado: PayloadToken): boolean
  {
    return usuarioLogado.perfil !== Perfil.CLIENTE || usuarioLogado.sub === nrIdDono;
  }

  private validarDataDaReserva(dtReserva: Date): void
  {
    const dtAgora = new Date();

    if (dtReserva <= dtAgora)
      throw new BadRequestException('A data da reserva precisa ser no futuro!');

    if (dtReserva > somarMinutos(dtAgora, NR_DIAS_MAXIMOS_ANTECEDENCIA * 24 * 60))
      throw new BadRequestException(`Só é possível reservar com até ${NR_DIAS_MAXIMOS_ANTECEDENCIA} dias de antecedência!`);
  }

  private async validarUsuario(nrIdUsuario: number)
  {
    const usuario = await this.prisma.usuario.findUnique({ where: { id_usuario: nrIdUsuario } });

    if (!usuario)
      throw new NotFoundException(`Usuário ${nrIdUsuario} não encontrado!`);
  }

  private async reservarMesaInformada(transacao: Prisma.TransactionClient, nrIdMesa: number, qtPessoas: number, dtReserva: Date)
  {
    await travarMesa(transacao, nrIdMesa);

    const mesa = await transacao.mesa.findUnique({ where: { id_mesa: nrIdMesa } });

    if (!mesa)
      throw new NotFoundException(`Mesa ${nrIdMesa} não encontrada!`);

    if (qtPessoas > mesa.qt_lugares)
      throw new ConflictException(`A mesa ${mesa.nr_mesa} comporta no máximo ${mesa.qt_lugares} pessoas!`);

    if (await buscarReservaEmConflito(transacao, nrIdMesa, dtReserva))
      throw new ConflictException(`A mesa ${mesa.nr_mesa} já está reservada perto deste horário!`);

    return nrIdMesa;
  }

  private async escolherMesaLivre(transacao: Prisma.TransactionClient, qtPessoas: number, dtReserva: Date)
  {
    const arrMesas = await transacao.mesa.findMany({
      where: { qt_lugares: { gte: qtPessoas } },
      orderBy: [{ qt_lugares: 'asc' }, { nr_mesa: 'asc' }]
    });

    if (arrMesas.length === 0)
      throw new ConflictException(`Nenhuma mesa comporta ${qtPessoas} pessoas!`);

    for (const mesa of arrMesas)
    {
      await travarMesa(transacao, mesa.id_mesa);

      if (!(await buscarReservaEmConflito(transacao, mesa.id_mesa, dtReserva)))
        return mesa.id_mesa;
    }

    throw new ConflictException('Não há mesa disponível neste horário!');
  }
}
