import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService }                                    from '../prisma/prisma.service.js';
import { travarInsumos }                                    from '../prisma/travas.js';
import { Prisma }                                           from '../generated/prisma/client.js';
import { TipoMovimento }                                    from '../generated/prisma/enums.js';
import { RegistrarMovimentoEstoqueDto }                     from './dto/registrar-movimento-estoque.dto.js';
import { ListarMovimentosEstoqueQueryDto }                  from './dto/listar-movimentos-estoque-query.dto.js';

const NR_LIMITE_LISTAGEM = 200;

export interface ItemPedidoParaEstoque
{
  id_item_pedido: number;
  id_item_cardapio: number;
  qt_quantidade: number;
}

// Único lugar que mexe em qt_estoque: todo ajuste gera um MovimentoEstoque.
@Injectable()
export class MovimentosEstoqueService
{
  constructor(private readonly prisma: PrismaService) {}

  registrarMovimento(registrarMovimentoEstoqueDto: RegistrarMovimentoEstoqueDto)
  {
    const { id_insumo, tipo_movimento, qt_movimento, ds_motivo } = registrarMovimentoEstoqueDto;

    return this.prisma.$transaction(async (transacao) => {
      await travarInsumos(transacao, [id_insumo]);

      const insumo = await transacao.insumo.findUnique({ where: { id_insumo } });

      if (!insumo)
        throw new NotFoundException(`Insumo ${id_insumo} não encontrado!`);

      const ehEntrada = tipo_movimento === TipoMovimento.ENTRADA;

      if (!ehEntrada && insumo.qt_estoque.lt(qt_movimento))
        throw new ConflictException(`Estoque de ${insumo.nm_insumo} é menor que a perda informada (${insumo.qt_estoque} ${insumo.unidade_medida})!`);

      const insumoAtualizado = await transacao.insumo.update({
        where: { id_insumo },
        data: { qt_estoque: ehEntrada ? { increment: qt_movimento } : { decrement: qt_movimento } },
      });
      const movimento = await transacao.movimentoEstoque.create({ data: { id_insumo, tipo_movimento, qt_movimento, ds_motivo } });

      return { ...movimento, qt_estoque_atual: insumoAtualizado.qt_estoque };
    });
  }

  listarMovimentos(listarMovimentosEstoqueQueryDto: ListarMovimentosEstoqueQueryDto)
  {
    const { id_insumo, tipo_movimento, dt_de, dt_ate } = listarMovimentosEstoqueQueryDto;

    return this.prisma.movimentoEstoque.findMany({
      where: {
        id_insumo,
        tipo_movimento,
        dt_movimento: {
          gte: dt_de ? new Date(dt_de) : undefined,
          lte: dt_ate ? new Date(dt_ate) : undefined,
        },
      },
      include: {
        insumo: {
          select: {
            nm_insumo: true,
            unidade_medida: true
          }
        }
      },
      orderBy: { dt_movimento: 'desc' },
      take: NR_LIMITE_LISTAGEM
    });
  }

  // Confere, sem travar nada, se há estoque para o item. Serve para avisar cedo (ao lançar o pedido).
  async verificarDisponibilidade(db: Prisma.TransactionClient, nrIdItemCardapio: number, qtQuantidade: number)
  {
    const arrReceita = await db.receita.findMany({ where: { id_item_cardapio: nrIdItemCardapio }, include: { insumo: true } });

    for (const ingrediente of arrReceita)
    {
      const vlNecessario = ingrediente.qt_insumo.times(qtQuantidade);

      if (ingrediente.insumo.qt_estoque.lt(vlNecessario))
        throw new ConflictException(
          `Estoque insuficiente de ${ingrediente.insumo.nm_insumo} ` +
          `(precisa de ${vlNecessario} ${ingrediente.insumo.unidade_medida}, há ${ingrediente.insumo.qt_estoque})!`
        );
    }
  }

  // Dá baixa nos insumos da receita. Deve rodar dentro da transação de quem chama.
  async baixarEstoqueDoItem(transacao: Prisma.TransactionClient, itemPedido: ItemPedidoParaEstoque)
  {
    const arrReceita = await transacao.receita.findMany({ where: { id_item_cardapio: itemPedido.id_item_cardapio }, orderBy: { id_insumo: 'asc' } });

    if (arrReceita.length === 0)
      return;

    await travarInsumos(transacao, arrReceita.map((ingrediente) => ingrediente.id_insumo));
    await this.verificarDisponibilidade(transacao, itemPedido.id_item_cardapio, itemPedido.qt_quantidade);

    for (const ingrediente of arrReceita)
    {
      const vlNecessario = ingrediente.qt_insumo.times(itemPedido.qt_quantidade);

      await transacao.insumo.update({
        where: { id_insumo: ingrediente.id_insumo },
        data: {
          qt_estoque: {
            decrement: vlNecessario
          }
        }
      });
      await transacao.movimentoEstoque.create({
        data: {
          id_insumo: ingrediente.id_insumo,
          id_item_pedido: itemPedido.id_item_pedido,
          tipo_movimento: TipoMovimento.SAIDA,
          qt_movimento: vlNecessario
        }
      });
    }
  }

  // Devolve exatamente o que saiu para os itens (a receita pode ter mudado desde então).
  // Recebe todos os itens de uma vez para travar os insumos juntos e em ordem.
  async estornarEstoqueDosItens(transacao: Prisma.TransactionClient, arrIdsItemPedido: number[])
  {
    if (arrIdsItemPedido.length === 0)
      return;

    const arrMovimentos = await transacao.movimentoEstoque.findMany({
      where: {
        id_item_pedido: {
          in: arrIdsItemPedido
        }
      }
    });
    const arrJaEstornados = new Set(
      arrMovimentos.filter((movimento) => movimento.tipo_movimento === TipoMovimento.ENTRADA)
        .map((movimento) => movimento.id_item_pedido)
    );
    const arrSaidas = arrMovimentos.filter((movimento) => movimento.tipo_movimento === TipoMovimento.SAIDA && !arrJaEstornados.has(movimento.id_item_pedido));

    if (arrSaidas.length === 0)
      return;

    const arrIdsInsumo = [...new Set(arrSaidas.map((saida) => saida.id_insumo))].sort((nrA, nrB) => nrA - nrB);

    await travarInsumos(transacao, arrIdsInsumo);

    for (const saida of arrSaidas)
    {
      await transacao.insumo.update({ where: { id_insumo: saida.id_insumo }, data: { qt_estoque: { increment: saida.qt_movimento } } });
      await transacao.movimentoEstoque.create({
        data: {
          id_insumo: saida.id_insumo,
          id_item_pedido: saida.id_item_pedido,
          tipo_movimento: TipoMovimento.ENTRADA,
          qt_movimento: saida.qt_movimento,
          ds_motivo: 'Estorno: item cancelado'
        }
      });
    }
  }
}
