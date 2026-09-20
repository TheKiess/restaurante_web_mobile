import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { SituacaoComanda, SituacaoItemPedido, TipoItem } from '../generated/prisma/enums.js';
import { CreateItensPedidoDto } from './dto/create-itens-pedido.dto.js';
import { UpdateItensPedidoDto } from './dto/update-itens-pedido.dto.js';
import { AlterarSituacaoItemPedidoDto } from './dto/alterar-situacao-item-pedido.dto.js';
import { ListarItensPedidoQueryDto } from './dto/listar-itens-pedido-query.dto.js';

const INCLUIR_DETALHES = {
  item_cardapio: {
    select: { nm_item: true }
  },
  comanda: {
    select: {
      id_comanda: true,
      mesa: {
        select: {
          nr_mesa: true
        }
      }
    }
  },
} satisfies Prisma.ItemPedidoInclude;

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
  constructor(private readonly prisma: PrismaService) {}

  async lancarItemPedido(createItensPedidoDto: CreateItensPedidoDto)
  {
    const { id_comanda, id_item_cardapio, qt_quantidade, ds_observacao } = createItensPedidoDto;
    const comanda = await this.prisma.comanda.findUnique({ where: { id_comanda } });

    if (!comanda)
      throw new NotFoundException(`Comanda ${id_comanda} não encontrada!`);

    if (comanda.id_situacao !== SituacaoComanda.ABERTA)
      throw new ConflictException('Só é possível lançar itens em uma comanda aberta!');

    const itemCardapio = await this.prisma.itemCardapio.findUnique({ where: { id_item_cardapio } });
    if (!itemCardapio)
      throw new NotFoundException(`Item ${id_item_cardapio} não encontrado no cardápio!`);

    if (!itemCardapio.disponivel)
      throw new ConflictException(`${itemCardapio.nm_item} não está disponível!`);

    return this.prisma.itemPedido.create({
      data: {
        id_comanda,
        id_item_cardapio,
        qt_quantidade,
        ds_observacao,
        vl_unitario: itemCardapio.vl_unitario,
        id_situacao: itemCardapio.tipo_item === TipoItem.PREPARADO ? SituacaoItemPedido.AGUARDANDO : SituacaoItemPedido.PRONTO,
      },
      include: INCLUIR_DETALHES,
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
    await this.buscarItemPedidoPorId(nrId);
    const { count } = await this.prisma.itemPedido.updateMany({
      where: { id_item_pedido: nrId, id_situacao: SituacaoItemPedido.AGUARDANDO },
      data: updateItensPedidoDto,
    });

    if (count === 0)
      throw new ConflictException('Só é possível alterar um item que ainda está aguardando!');

    return this.buscarItemPedidoPorId(nrId);
  }

  async alterarSituacaoItemPedido(nrId: number, alterarSituacaoItemPedidoDto: AlterarSituacaoItemPedidoDto)
  {
    const itemPedido   = await this.buscarItemPedidoPorId(nrId);
    const situacaoNova = alterarSituacaoItemPedidoDto.id_situacao;

    if (!TRANSICOES_PERMITIDAS[itemPedido.id_situacao].includes(situacaoNova))
      throw new ConflictException(`Não é possível mudar o item de ${itemPedido.id_situacao} para ${situacaoNova}!`);

    const { count } = await this.prisma.itemPedido.updateMany({
      where: {
        id_item_pedido: nrId,
        id_situacao: itemPedido.id_situacao
      },
      data: { id_situacao: situacaoNova },
    });

    if (count === 0)
      throw new ConflictException('Este item acabou de ser alterado por outra pessoa, atualize e tente de novo');

    return this.buscarItemPedidoPorId(nrId);
  }
}
