import { ConflictException, NotFoundException }               from '@nestjs/common';
import { OrigemPedido, SituacaoItemPedido, TipoItem }          from '../generated/prisma/enums.js';
import type { MovimentosEstoqueService }                       from '../movimentos-estoque/movimentos-estoque.service.js';
import type { PrismaService }                                  from '../prisma/prisma.service.js';
import { ItensPedidoService }                                  from './itens-pedido.service.js';

const itemCardapio = (nrId: number, idTipo: TipoItem, flDisponivel = true) => ({
  id_item_cardapio: nrId,
  nm_item: `Item ${nrId}`,
  tipo_item: idTipo,
  disponivel: flDisponivel,
  vl_unitario: '10.00'
});

function criarServico(objCliente: object | null, arrItensCardapio: object[])
{
  const tx = {
    usuario: { findFirst: vi.fn().mockResolvedValue(objCliente) },
    comanda: { create: vi.fn().mockResolvedValue({ id_comanda: 50, id_cliente: 7, id_mesa: null }) },
    itemCardapio: { findMany: vi.fn().mockResolvedValue(arrItensCardapio) },
    receita: { findMany: vi.fn().mockResolvedValue([{ id_insumo: 9 }, { id_insumo: 3 }]) },
    itemPedido: { create: vi.fn().mockImplementation(async ({ data }) => ({ id_item_pedido: 1, ...data })) },
    $queryRaw: vi.fn()
  };
  const prisma    = { $transaction: async (fn: (t: typeof tx) => unknown) => fn(tx) } as unknown as PrismaService;
  const estoque   = { verificarDisponibilidade: vi.fn(), baixarEstoqueDoItem: vi.fn() };
  const servico   = new ItensPedidoService(prisma, estoque as unknown as MovimentosEstoqueService);

  return { servico, tx, estoque };
}

describe('criarPedidoRetirada', () => {
  it('recusa cliente que não existe ou está inativo', async () => {
    const { servico, tx } = criarServico(null, []);

    await expect(servico.criarPedidoRetirada({ itens: [{ id_item_cardapio: 1, qt_quantidade: 1 }] }, 7)).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.comanda.create).not.toHaveBeenCalled();
  });

  it('recusa item que não está no cardápio', async () => {
    const { servico } = criarServico({ id_usuario: 7 }, []);

    await expect(servico.criarPedidoRetirada({ itens: [{ id_item_cardapio: 1, qt_quantidade: 1 }] }, 7)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('recusa item indisponível', async () => {
    const { servico } = criarServico({ id_usuario: 7 }, [itemCardapio(1, TipoItem.PREPARADO, false)]);

    await expect(servico.criarPedidoRetirada({ itens: [{ id_item_cardapio: 1, qt_quantidade: 1 }] }, 7)).rejects.toBeInstanceOf(ConflictException);
  });

  it('cria a comanda sem mesa, ligada ao cliente, e lança os itens com a origem do app', async () => {
    const { servico, tx } = criarServico({ id_usuario: 7 }, [itemCardapio(1, TipoItem.PREPARADO), itemCardapio(2, TipoItem.REVENDA)]);

    const resultado = await servico.criarPedidoRetirada({ itens: [{ id_item_cardapio: 1, qt_quantidade: 2 }, { id_item_cardapio: 2, qt_quantidade: 1 }] }, 7);

    expect(tx.comanda.create).toHaveBeenCalledWith({ data: { id_usuario: 7, id_cliente: 7, id_mesa: null } });
    expect(resultado.id_comanda).toBe(50);
    expect(resultado.itens).toHaveLength(2);
    expect(resultado.itens.every((item) => item.id_origem === OrigemPedido.APP && item.id_comanda === 50)).toBe(true);
  });

  it('preparado nasce AGUARDANDO e revenda nasce PRONTA com baixa de estoque na hora', async () => {
    const { servico, estoque } = criarServico({ id_usuario: 7 }, [itemCardapio(1, TipoItem.PREPARADO), itemCardapio(2, TipoItem.REVENDA)]);

    const resultado = await servico.criarPedidoRetirada({ itens: [{ id_item_cardapio: 1, qt_quantidade: 1 }, { id_item_cardapio: 2, qt_quantidade: 1 }] }, 7);

    expect(resultado.itens[0].id_situacao).toBe(SituacaoItemPedido.AGUARDANDO);
    expect(resultado.itens[1].id_situacao).toBe(SituacaoItemPedido.PRONTO);
    expect(estoque.baixarEstoqueDoItem).toHaveBeenCalledTimes(1);
  });

  it('soma as quantidades do mesmo item preparado ao conferir o estoque', async () => {
    const { servico, estoque } = criarServico({ id_usuario: 7 }, [itemCardapio(1, TipoItem.PREPARADO)]);

    await servico.criarPedidoRetirada({ itens: [{ id_item_cardapio: 1, qt_quantidade: 2 }, { id_item_cardapio: 1, qt_quantidade: 3 }] }, 7);

    expect(estoque.verificarDisponibilidade).toHaveBeenCalledTimes(1);
    expect(estoque.verificarDisponibilidade).toHaveBeenCalledWith(expect.anything(), 1, 5);
  });

  it('trava os insumos dos itens de revenda', async () => {
    const { servico, tx } = criarServico({ id_usuario: 7 }, [itemCardapio(2, TipoItem.REVENDA)]);

    await servico.criarPedidoRetirada({ itens: [{ id_item_cardapio: 2, qt_quantidade: 1 }] }, 7);

    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
  });
});
