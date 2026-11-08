import { Injectable, NotFoundException }                        from '@nestjs/common';
import { PrismaService }                                        from '../prisma/prisma.service.js';
import { SituacaoComanda, SituacaoItemPedido, SituacaoReserva } from '../generated/prisma/enums.js';
import { calcularTotais }                                       from '../comandas/calcular-totais.js';
import { expirarReservasVencidas, somarMinutos }                from '../reservas/regras-reserva.js';
import { NR_MINUTOS_CHECKIN_ANTECIPADO }                        from '../reservas/reservas.constantes.js';
import { CreateMesaDto }                                        from './dto/create-mesa.dto.js';
import { UpdateMesaDto }                                        from './dto/update-mesa.dto.js';

@Injectable()
export class MesasService
{
  constructor(private readonly prisma: PrismaService) {}

  criarMesa(createMesaDto: CreateMesaDto)
  {
    return this.prisma.mesa.create({ data: createMesaDto });
  }

  listarMesas()
  {
    return this.prisma.mesa.findMany();
  }

  // Visão do salão: cada mesa com a situação (livre, ocupada ou reservada), a comanda aberta e a próxima reserva.
  async painelDoSalao()
  {
    await expirarReservasVencidas(this.prisma);

    const dtAgora       = new Date();
    const dsNomeUsuario = {
      select: {
        pessoa: {
          select: {
            nm_pessoa: true
          }
        }
      }
    };
    const [arrMesas, arrComandas, arrReservas, nrComandasSemMesa] = await Promise.all([
      this.prisma.mesa.findMany({ orderBy: { nr_mesa: 'asc' } }),
      this.prisma.comanda.findMany({
        where: { id_situacao: SituacaoComanda.ABERTA, id_mesa: { not: null } },
        include: { itens: true, pagamentos: true, usuario: dsNomeUsuario },
      }),
      this.prisma.reserva.findMany({
        where: { id_situacao: SituacaoReserva.CONFIRMADA, dt_limite_checkin: { gte: dtAgora } },
        include: { usuario: dsNomeUsuario },
        orderBy: { dt_reserva: 'asc' },
      }),
      this.prisma.comanda.count({ where: { id_situacao: SituacaoComanda.ABERTA, id_mesa: null } }),
    ]);

    const dtFimJanelaCheckin = somarMinutos(dtAgora, NR_MINUTOS_CHECKIN_ANTECIPADO);
    const arrPainel          = arrMesas.map((mesa) => {
      const comanda         = arrComandas.find((comandaAberta) => comandaAberta.id_mesa === mesa.id_mesa);
      const reserva         = arrReservas.find((reservaConfirmada) => reservaConfirmada.id_mesa === mesa.id_mesa);
      const flReservada     = !comanda && !!reserva && reserva.dt_reserva <= dtFimJanelaCheckin;
      const situacao        = comanda ? 'OCUPADA' : flReservada ? 'RESERVADA' : 'LIVRE';
      const totais          = comanda ? calcularTotais(comanda.itens, comanda.pagamentos) : null;
      const arrItensValidos = comanda ? comanda.itens.filter((item) => item.id_situacao !== SituacaoItemPedido.CANCELADO) : [];

      return {
        id_mesa: mesa.id_mesa,
        nr_mesa: mesa.nr_mesa,
        qt_lugares: mesa.qt_lugares,
        situacao,
        comanda: comanda && totais ? {
          id_comanda: comanda.id_comanda,
          dt_abertura: comanda.dt_abertura,
          nm_responsavel: comanda.usuario?.pessoa.nm_pessoa ?? null,
          vl_total: totais.vlTotal.toFixed(2),
          vl_restante: totais.vlRestante.toFixed(2),
          qt_itens: arrItensValidos.length,
          qt_itens_pendentes: arrItensValidos.filter((item) => item.id_situacao !== SituacaoItemPedido.ENTREGUE).length
        } : null,
        proxima_reserva: reserva ? {
          id_reserva: reserva.id_reserva,
          dt_reserva: reserva.dt_reserva,
          dt_limite_checkin: reserva.dt_limite_checkin,
          qt_pessoas: reserva.qt_pessoas,
          nm_cliente: reserva.usuario.pessoa.nm_pessoa
        } : null
      };
    });

    return {
      resumo: {
        livres:     arrPainel.filter((mesa) => mesa.situacao === 'LIVRE').length,
        ocupadas:   arrPainel.filter((mesa) => mesa.situacao === 'OCUPADA').length,
        reservadas: arrPainel.filter((mesa) => mesa.situacao === 'RESERVADA').length,
        comandas_sem_mesa: nrComandasSemMesa
      },
      mesas: arrPainel
    };
  }

  async buscarMesaPorId(nrId: number)
  {
    const mesa = await this.prisma.mesa.findUnique({ where: { id_mesa: nrId }});

    if (!mesa)
      throw new NotFoundException(`Mesa ${nrId} não encontrada!`);

    return mesa;
  }

  async atualizarMesa(nrId: number, updateMesaDto: UpdateMesaDto)
  {
    await this.buscarMesaPorId(nrId);
    return this.prisma.mesa.update({ where: { id_mesa: nrId }, data: updateMesaDto });
  }

  async removerMesa(nrId: number)
  {
    await this.buscarMesaPorId(nrId);
    return this.prisma.mesa.delete({ where: { id_mesa: nrId }});
  }
}
