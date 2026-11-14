import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService }                                                        from '../prisma/prisma.service.js';
import { MovimentosEstoqueService }                                             from '../movimentos-estoque/movimentos-estoque.service.js';
import { travarComanda }                                                        from '../prisma/travas.js';
import { Prisma }                                                               from '../generated/prisma/client.js';
import { OrigemPedido, SituacaoComanda, SituacaoItemPedido, TipoItem }          from '../generated/prisma/enums.js';
import { CreateItensPedidoDto }                                                 from './dto/create-itens-pedido.dto.js';
import { UpdateItensPedidoDto }                                                 from './dto/update-itens-pedido.dto.js';
import { AlterarSituacaoItemPedidoDto }                                         from './dto/alterar-situacao-item-pedido.dto.js';
import { ListarItensPedidoQueryDto }                                            from './dto/listar-itens-pedido-query.dto.js';

const SELECIONAR_NOME = {
  select: {
    pessoa: {
      select: { nm_pessoa: true }
    }
  }
} satisfies Prisma.UsuarioDefaultArgs;

const INCLUIR_DETALHES = {
  item_cardapio: {
    select: { nm_item: true }
  },
  usuario: SELECIONAR_NOME,
  comanda: {
    select: {
      id_comanda: true,
      id_situacao: true,
      id_cliente: true,
      cliente: SELECIONAR_NOME,
      mesa: {
        select: {
          nr_mesa: true
        }
      }
    }
  }
} satisfies Prisma.ItemPedidoInclude;

export interface AutorDoItem
{
  nrIdUsuario: number;
  idOrigem: OrigemPedido;
  nrIdClienteDono?: number;
}

const TRANSICOES_PERMITIDAS: Record<SituacaoItemPedido, SituacaoItemPedido[]> = {
  [SituacaoItemPedido.AGUARDANDO]: [SituacaoItemPedido.EM_PREPARO, SituacaoItemPedido.CANCELADO],
  [SituacaoItemPedido.EM_PREPARO]: [SituacaoItemPedido.PRONTO],
  [SituacaoItemPedido.PRONTO]: [SituacaoItemPedido.ENTREGUE, SituacaoItemPedido.CANCELADO],
  [SituacaoItemPedido.ENTREGUE]: [],
  [SituacaoItemPedido.CANCELADO]: [],
};

@Injectable()
export class ItensPedidoService
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly movimentosEstoqueService: MovimentosEstoqueService,
  ) {}

  async lancarItemPedido(createItensPedidoDto: CreateItensPedidoDto, autorDoItem: AutorDoItem)
  {
    const { id_comanda, id_item_cardapio, qt_quantidade, ds_observacao } = createItensPedidoDto;

    return this.prisma.$transaction(async (transacao) => {
      await travarComanda(transacao, id_comanda);

      const comanda = await transacao.comanda.findUnique({ where: { id_comanda } });

      // O cliente só enxerga a comanda que está no nome dele; para os outros ela "não existe".
      if (!comanda ||
        (autorDoItem.nrIdClienteDono !== undefined &&
        comanda.id_cliente !== autorDoItem.nrIdClienteDono)
      )
        throw new NotFoundException(`Comanda ${id_comanda} não encontrada!`);

      if (comanda.id_situacao !== SituacaoComanda.ABERTA)
        throw new ConflictException('Só é possível lançar itens em uma comanda aberta!');

      const itemCardapio = await transacao.itemCardapio.findUnique({ where: { id_item_cardapio } });

      if (!itemCardapio)
        throw new NotFoundException(`Item ${id_item_cardapio} não encontrado no cardápio!`);

      if (!itemCardapio.disponivel)
        throw new ConflictException(`${itemCardapio.nm_item} não está disponível!`);

      const idPreparado = itemCardapio.tipo_item === TipoItem.PREPARADO;

      // Preparado: só avisa se já falta insumo, a baixa acontece quando a cozinha começa a preparar.
      if (idPreparado)
        await this.movimentosEstoqueService.verificarDisponibilidade(transacao, id_item_cardapio, qt_quantidade);

      const itemPedido = await transacao.itemPedido.create({
        data: {
          id_comanda,
          id_item_cardapio,
          id_usuario: autorDoItem.nrIdUsuario,
          id_origem: autorDoItem.idOrigem,
          qt_quantidade,
          ds_observacao,
          vl_unitario: itemCardapio.vl_unitario,
          id_situacao: idPreparado ? SituacaoItemPedido.AGUARDANDO : SituacaoItemPedido.PRONTO,
        },
        include: INCLUIR_DETALHES,
      });

      // Revenda já nasce pronta, então a baixa é na hora do lançamento.
      if (!idPreparado)
        await this.movimentosEstoqueService.baixarEstoqueDoItem(transacao, itemPedido);

      return itemPedido;
    });
  }

  listarItensPedido(listarItensPedidoQueryDto: ListarItensPedidoQueryDto)
  {
    return this.prisma.itemPedido.findMany({
      where: {
        id_situacao: listarItensPedidoQueryDto.id_situacao,
        id_comanda: listarItensPedidoQueryDto.id_comanda
      },
      include: INCLUIR_DETALHES,
      orderBy: { dt_pedido: 'asc' },
    });
  }

  listarFilaCozinha()
  {
    return this.prisma.itemPedido.findMany({
      where: {
        id_situacao: {
          in: [
            SituacaoItemPedido.AGUARDANDO,
            SituacaoItemPedido.EM_PREPARO
          ]
        }
      },
      include: INCLUIR_DETALHES,
      orderBy: { dt_pedido: 'asc' },
    });
  }

  async buscarItemPedidoPorId(nrId: number)
  {
    const itemPedido = await this.prisma.itemPedido.findUnique({ where: { id_item_pedido: nrId }, include: INCLUIR_DETALHES });

    if (!itemPedido)
      throw new NotFoundException(`Item de pedido ${nrId} não encontrado!`);

    return itemPedido;
  }

  async atualizarItemPedido(nrId: number, updateItensPedidoDto: UpdateItensPedidoDto)
  {
    const itemInicial = await this.buscarItemPedidoPorId(nrId);

    await this.prisma.$transaction(async (transacao) => {
      await travarComanda(transacao, itemInicial.id_comanda);

      const itemPedido = await transacao.itemPedido.findUnique({ where: { id_item_pedido: nrId } });

      if (itemPedido?.id_situacao !== SituacaoItemPedido.AGUARDANDO)
        throw new ConflictException('Só é possível alterar um item que ainda está aguardando!');

      if (updateItensPedidoDto.qt_quantidade)
        await this.movimentosEstoqueService.verificarDisponibilidade(
          transacao,
          itemPedido.id_item_cardapio,
          updateItensPedidoDto.qt_quantidade
        );

      await transacao.itemPedido.update({ where: { id_item_pedido: nrId }, data: updateItensPedidoDto });
    });

    return this.buscarItemPedidoPorId(nrId);
  }

  // O cliente só cancela o que ele mesmo pediu pelo app e enquanto o item ainda está aguardando.
  async cancelarItemDoCliente(nrIdItem: number, nrIdComanda: number, nrIdCliente: number)
  {
    await this.prisma.$transaction(async (transacao) => {
      await travarComanda(transacao, nrIdComanda);

      const itemPedido = await transacao.itemPedido.findFirst({
        where: { id_item_pedido: nrIdItem, id_comanda: nrIdComanda, comanda: { id_cliente: nrIdCliente } }
      });

      if (!itemPedido)
        throw new NotFoundException(`Item de pedido ${nrIdItem} não encontrado!`);

      if (itemPedido.id_usuario !== nrIdCliente)
        throw new ForbiddenException('Você só pode cancelar os itens que você mesmo pediu!');

      if (itemPedido.id_situacao !== SituacaoItemPedido.AGUARDANDO)
        throw new ConflictException('Só é possível cancelar um item que ainda está aguardando!');

      await transacao.itemPedido.update({
        where: { id_item_pedido: nrIdItem },
        data: { id_situacao: SituacaoItemPedido.CANCELADO }
      });
    });

    return this.buscarItemPedidoPorId(nrIdItem);
  }

  async alterarSituacaoItemPedido(nrId: number, alterarSituacaoItemPedidoDto: AlterarSituacaoItemPedidoDto)
  {
    const situacaoNova = alterarSituacaoItemPedidoDto.id_situacao;

    await this.prisma.$transaction(async (transacao) => {
      const itemInicial = await transacao.itemPedido.findUnique({
        where: { id_item_pedido: nrId },
        select: { id_comanda: true },
      });

      if (!itemInicial)
        throw new NotFoundException(`Item de pedido ${nrId} não encontrado!`);

      await travarComanda(transacao, itemInicial.id_comanda);

      // Relê depois da trava: a quantidade pode ter sido editada enquanto esperava a vez.
      const itemPedido = await transacao.itemPedido.findUniqueOrThrow({
        where: { id_item_pedido: nrId },
        include: { item_cardapio: { select: { tipo_item: true } } },
      });

      if (!TRANSICOES_PERMITIDAS[itemPedido.id_situacao].includes(situacaoNova))
        throw new ConflictException(`Não é possível mudar o item de ${itemPedido.id_situacao} para ${situacaoNova}!`);

      const { count } = await transacao.itemPedido.updateMany({
        where: {
          id_item_pedido: nrId,
          id_situacao: itemPedido.id_situacao
        },
        data: { id_situacao: situacaoNova },
      });

      if (count === 0)
        throw new ConflictException('Este item acabou de ser alterado por outra pessoa, atualize e tente de novo!');

      const idPreparado = itemPedido.item_cardapio.tipo_item === TipoItem.PREPARADO;

      // Preparado consome insumo quando a cozinha começa; revenda cancelada volta para a prateleira.
      if (idPreparado && situacaoNova === SituacaoItemPedido.EM_PREPARO)
        await this.movimentosEstoqueService.baixarEstoqueDoItem(transacao, itemPedido);

      if (!idPreparado && situacaoNova === SituacaoItemPedido.CANCELADO)
        await this.movimentosEstoqueService.estornarEstoqueDosItens(transacao, [nrId]);
    });

    return this.buscarItemPedidoPorId(nrId);
  }
}
