import { ConflictException, Injectable, NotFoundException }                         from '@nestjs/common';
import { PrismaService }                                                            from '../prisma/prisma.service.js';
import { MovimentosEstoqueService }                                                 from '../movimentos-estoque/movimentos-estoque.service.js';
import { travarComanda, travarMesa }                                                from '../prisma/travas.js';
import { Prisma }                                                                   from '../generated/prisma/client.js';
import { buscarReservaSegurandoMesa, formatarHorario }                              from '../reservas/regras-reserva.js';
import { Perfil, SituacaoComanda, SituacaoItemPedido, SituacaoPagamento, TipoItem } from '../generated/prisma/enums.js';
import { calcularTotais }                                                           from './calcular-totais.js';
import { CreateComandaDto }                                                         from './dto/create-comanda.dto.js';
import { UpdateComandaDto }                                                         from './dto/update-comanda.dto.js';
import { VincularClienteDto }                                                       from './dto/vincular-cliente.dto.js';
import { ListarComandasQueryDto }                                                   from './dto/listar-comandas-query.dto.js';

const SELECIONAR_CLIENTE = {
  select: {
    id_usuario: true,
    ds_apelido: true,
    pessoa: {
      select: { nm_pessoa: true }
    }
  }
} satisfies Prisma.UsuarioDefaultArgs;

@Injectable()
export class ComandasService
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly movimentosEstoqueService: MovimentosEstoqueService
  ) {}

  async abrirComanda(createComandaDto: CreateComandaDto, nrIdUsuario: number)
  {
    const { id_mesa, id_cliente } = createComandaDto;

    if (id_cliente)
      await this.validarCliente(id_cliente);

    return this.prisma.$transaction(async (transacao) => {
      if (id_mesa)
      {
        await travarMesa(transacao, id_mesa);
        await this.validarMesaLivre(id_mesa, undefined, transacao);
      }

      return transacao.comanda.create({ data: { id_usuario: nrIdUsuario, id_cliente, id_mesa } });
    });
  }
  async criarComandaRetirada(nrIdCliente: number)
  {
    await this.validarCliente(nrIdCliente);
    return this.prisma.comanda.create({
      data: {
        id_usuario: nrIdCliente,
        id_cliente: nrIdCliente,
        id_mesa: null
      }
    });
  }

  listarComandas(listarComandasQueryDto: ListarComandasQueryDto)
  {
    return this.prisma.comanda.findMany({
      where: { id_situacao: listarComandasQueryDto.id_situacao },
      include: { mesa: true, cliente: SELECIONAR_CLIENTE },
      orderBy: { dt_abertura: 'desc' },
    });
  }

  listarMinhasComandas(nrIdCliente: number, listarComandasQueryDto: ListarComandasQueryDto)
  {
    return this.prisma.comanda.findMany({
      where: {
        id_cliente: nrIdCliente,
        id_situacao: listarComandasQueryDto.id_situacao
      },
      include: { mesa: true },
      orderBy: { dt_abertura: 'desc' }
    });
  }

  async buscarMinhaComanda(nrId: number, nrIdCliente: number)
  {
    const nrComandas = await this.prisma.comanda.count({ where: { id_comanda: nrId, id_cliente: nrIdCliente } });

    if (nrComandas === 0)
      throw new NotFoundException(`Comanda ${nrId} não encontrada!`);

    return this.buscarComandaPorId(nrId);
  }

  async buscarComandaPorId(nrId: number)
  {
    const comanda = await this.prisma.comanda.findUnique({
      where: { id_comanda: nrId },
      include: {
        mesa: true,
        cliente: SELECIONAR_CLIENTE,
        usuario: {
          select: {
            id_usuario: true,
            ds_apelido: true,
            pessoa: {
              select: { nm_pessoa: true }
            }
          }
        },
        itens: {
          include: {
            item_cardapio: {
              select: { nm_item: true }
            }
          },
          orderBy: { dt_pedido: 'asc' }
        },
        pagamentos: true
      }
    });
    if (!comanda)
      throw new NotFoundException(`Comanda ${nrId} não encontrada`);

    const { vlTotal, vlPago, vlRestante } = calcularTotais(comanda.itens, comanda.pagamentos);

    return {
      ...comanda,
      vl_total: vlTotal.toFixed(2),
      vl_pago: vlPago.toFixed(2),
      vl_restante: vlRestante.toFixed(2),
    };
  }

  async atualizarComanda(nrId: number, updateComandaDto: UpdateComandaDto)
  {
    await this.prisma.$transaction(async (transacao) => {
      await travarComanda(transacao, nrId);
      await this.validarComandaAberta(nrId, transacao);
      await travarMesa(transacao, updateComandaDto.id_mesa);
      await this.validarMesaLivre(updateComandaDto.id_mesa, nrId, transacao);
      await transacao.comanda.update({ where: { id_comanda: nrId }, data: { id_mesa: updateComandaDto.id_mesa } });
    });

    return this.buscarComandaPorId(nrId);
  }

  async vincularCliente(nrId: number, vincularClienteDto: VincularClienteDto)
  {
    const { id_cliente } = vincularClienteDto;

    if (id_cliente !== null)
      await this.validarCliente(id_cliente);

    await this.prisma.$transaction(async (transacao) => {
      await travarComanda(transacao, nrId);
      await this.validarComandaAberta(nrId, transacao);
      await transacao.comanda.update({ where: { id_comanda: nrId }, data: { id_cliente } });
    });

    return this.buscarComandaPorId(nrId);
  }

  async fecharComanda(nrId: number)
  {
    await this.prisma.$transaction(async (transacao) => {
      await travarComanda(transacao, nrId);

      const comanda = await transacao.comanda.findUnique({ where: { id_comanda: nrId }, include: { itens: true, pagamentos: true } });

      if (!comanda)
        throw new NotFoundException(`Comanda ${nrId} não encontrada!`);

      if (comanda.id_situacao !== SituacaoComanda.ABERTA)
        throw new ConflictException('Só é possível fechar uma comanda aberta!');

      const situacoesNaoEntregues: SituacaoItemPedido[] = [
        SituacaoItemPedido.AGUARDANDO,
        SituacaoItemPedido.EM_PREPARO,
        SituacaoItemPedido.PRONTO
      ];
      const nrItensNaoEntregues = comanda.itens.filter((item) => situacoesNaoEntregues.includes(item.id_situacao)).length;

      if (nrItensNaoEntregues > 0)
        throw new ConflictException(`Ainda há ${nrItensNaoEntregues} item(ns) não entregue(s)!`);

      const { vlTotal, vlPendente, vlRestante } = calcularTotais(comanda.itens, comanda.pagamentos);

      if (vlTotal.isZero())
        throw new ConflictException('Comanda sem itens, cancele em vez de fechar!');
      if (vlPendente.gt(0))
        throw new ConflictException('Há pagamento pendente de confirmação!');
      if (vlRestante.gt(0))
        throw new ConflictException(`Falta pagar ${vlRestante.toFixed(2)}!`);
      if (vlRestante.lt(0))
        throw new ConflictException('Os pagamentos são maiores que o total da comanda!');

      const { count } = await transacao.comanda.updateMany({
        where: { id_comanda: nrId, id_situacao: SituacaoComanda.ABERTA },
        data: { id_situacao: SituacaoComanda.FECHADA, dt_fechamento: new Date() },
      });

      if (count === 0)
        throw new ConflictException('Esta comanda acabou de ser alterada por outra pessoa, atualize e tente de novo!');
    });

    return this.buscarComandaPorId(nrId);
  }

  async cancelarComanda(nrId: number)
  {
    await this.prisma.$transaction(async (transacao) => {
      await travarComanda(transacao, nrId);
      await this.validarComandaAberta(nrId, transacao);

      const nrItensEntregues = await transacao.itemPedido.count({
        where: {
          id_comanda: nrId,
          id_situacao: SituacaoItemPedido.ENTREGUE
        },
      });

      if (nrItensEntregues > 0)
        throw new ConflictException('Comanda com itens entregues não pode ser cancelada, feche a comanda!');

      const nrPagamentosConfirmados = await transacao.pagamento.count({
        where: { id_comanda: nrId, id_situacao: SituacaoPagamento.CONFIRMADO },
      });

      if (nrPagamentosConfirmados > 0)
        throw new ConflictException('Comanda com pagamento confirmado não pode ser cancelada!');

      const arrItensRevenda = await transacao.itemPedido.findMany({
        where: {
          id_comanda: nrId,
          id_situacao: { not: SituacaoItemPedido.CANCELADO },
          item_cardapio: { tipo_item: TipoItem.REVENDA },
        },
        select: { id_item_pedido: true }
      });

      await this.movimentosEstoqueService.estornarEstoqueDosItens(transacao, arrItensRevenda.map((item) => item.id_item_pedido));
      await transacao.itemPedido.updateMany({
        where: { id_comanda: nrId },
        data: { id_situacao: SituacaoItemPedido.CANCELADO }
      });
      await transacao.pagamento.updateMany({
        where: { id_comanda: nrId, id_situacao: SituacaoPagamento.PENDENTE },
        data: { id_situacao: SituacaoPagamento.RECUSADO },
      });
      await transacao.comanda.update({
        where: { id_comanda: nrId },
        data: { id_situacao: SituacaoComanda.CANCELADA, dt_fechamento: new Date() },
      });
    });

    return this.buscarComandaPorId(nrId);
  }

  private async validarCliente(nrIdCliente: number)
  {
    const cliente = await this.prisma.usuario.findFirst({
      where: {
        id_usuario: nrIdCliente,
        perfil: Perfil.CLIENTE,
        id_ativo: true
      }
    });

    if (!cliente)
      throw new NotFoundException(`Cliente ${nrIdCliente} não encontrado!`);
  }

  private async validarMesaLivre(nrIdMesa: number, nrIdComandaAtual?: number, transacao?: Prisma.TransactionClient)
  {
    const database = transacao ?? this.prisma;
    const mesa     = await database.mesa.findUnique({ where: { id_mesa: nrIdMesa } });

    if (!mesa)
      throw new NotFoundException(`Mesa ${nrIdMesa} não encontrada!`);

    const comandaAberta = await database.comanda.findFirst({
      where: { id_mesa: nrIdMesa, id_situacao: SituacaoComanda.ABERTA }
    });

    if (comandaAberta && comandaAberta.id_comanda !== nrIdComandaAtual)
      throw new ConflictException(`Mesa ${mesa.nr_mesa} já tem uma comanda aberta!`);

    if (comandaAberta)
      return;

    const reservaSegurando = await buscarReservaSegurandoMesa(database, nrIdMesa);

    if (reservaSegurando)
      throw new ConflictException(
        `Mesa ${mesa.nr_mesa} está reservada para ${formatarHorario(reservaSegurando.dt_reserva)} ` +
        `(check-in até ${formatarHorario(reservaSegurando.dt_limite_checkin)}). Faça o check-in da reserva!`
      );
  }

  private async validarComandaAberta(nrId: number, transacao?: Prisma.TransactionClient)
  {
    const database = transacao ?? this.prisma;
    const comanda  = await database.comanda.findUnique({ where: { id_comanda: nrId } });

    if (!comanda)
      throw new NotFoundException(`Comanda ${nrId} não encontrada!`);

    if (comanda.id_situacao !== SituacaoComanda.ABERTA)
      throw new ConflictException('Só é possível alterar uma comanda aberta!');
  }
}
