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
    select: {
      nm_item: true,
      ds_imagem: true
    }
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
        autorDoItem.nrIdClienteDono !== undefined &&
        (comanda.id_cliente !== autorDoItem.nrIdClienteDono || comanda.id_mesa !== null)
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


async criarPedidoRetirada(
  createPedidoRetiradaDto: CreatePedidoRetiradaDto,
  nrIdCliente: number,
) {
  const { itens } = createPedidoRetiradaDto;

  return this.prisma.$transaction(async (transacao) => {
    // 1. Valida se o cliente existe e está ativo.
    const cliente = await transacao.usuario.findFirst({
      where: {
        id_usuario: nrIdCliente,
        perfil: 'CLIENTE',
        id_ativo: true,
      },
    });

    if (!cliente)
      throw new NotFoundException('Cliente não encontrado ou inativo!');

    // 2. Cria a comanda de retirada dentro da transação.
    const comanda = await transacao.comanda.create({
      data: {
        id_usuario: nrIdCliente,
        id_cliente: nrIdCliente,
        id_mesa: null,
      },
    });

    // 3. Busca e valida todos os produtos do pedido.
    const idsItens = [...new Set(
      itens.map((item) => item.id_item_cardapio),
    )];

    const arrItensCardapio = await transacao.itemCardapio.findMany({
      where: {
        id_item_cardapio: { in: idsItens },
      },
    });

    const itensValidados = itens.map((dados) => {
      const itemCardapio = arrItensCardapio.find(
        (item) => item.id_item_cardapio === dados.id_item_cardapio,
      );

      if (!itemCardapio)
        throw new NotFoundException(
          `Item ${dados.id_item_cardapio} não encontrado no cardápio!`,
        );

      if (!itemCardapio.disponivel)
        throw new ConflictException(
          `${itemCardapio.nm_item} não está disponível!`,
        );

      return { dados, itemCardapio };
    });

    // 4. Identifica os produtos de revenda e trava
    // todos os insumos em ordem crescente de ID.
    const idsItensRevenda = [
      ...new Set(
        itensValidados
          .filter(({ itemCardapio }) =>
            itemCardapio.tipo_item === TipoItem.REVENDA,
          )
          .map(({ itemCardapio }) => itemCardapio.id_item_cardapio),
      ),
    ];

    if (idsItensRevenda.length > 0) {
      const receitas = await transacao.receita.findMany({
        where: {
          id_item_cardapio: { in: idsItensRevenda },
        },
        select: {
          id_insumo: true,
        },
      });

      const idsInsumos = [
        ...new Set(receitas.map((receita) => receita.id_insumo)),
      ].sort((a, b) => a - b);

      await travarInsumos(transacao, idsInsumos);
    }

    // 5. Verifica a disponibilidade dos preparados.
    // Agrupa quantidades quando o mesmo produto aparece mais de uma vez.
    const quantidadesPreparados = new Map<number, number>();

    for (const { dados, itemCardapio } of itensValidados) {
      if (itemCardapio.tipo_item !== TipoItem.PREPARADO)
        continue;

      const quantidadeAtual =
        quantidadesPreparados.get(itemCardapio.id_item_cardapio) ?? 0;

      quantidadesPreparados.set(
        itemCardapio.id_item_cardapio,
        quantidadeAtual + dados.qt_quantidade,
      );
    }

    for (const [idItem, quantidade] of quantidadesPreparados) {
      await this.movimentosEstoqueService.verificarDisponibilidade(
        transacao,
        idItem,
        quantidade,
      );
    }

    // 6. Registra todos os itens.
    const itensCriados = [];

    for (const { dados, itemCardapio } of itensValidados) {
      const idPreparado =
        itemCardapio.tipo_item === TipoItem.PREPARADO;

      const itemPedido = await transacao.itemPedido.create({
        data: {
          id_comanda: comanda.id_comanda,
          id_item_cardapio: itemCardapio.id_item_cardapio,
          id_usuario: nrIdCliente,
          id_origem: OrigemPedido.APP,
          qt_quantidade: dados.qt_quantidade,
          ds_observacao: dados.ds_observacao,
          vl_unitario: itemCardapio.vl_unitario,
          id_situacao: idPreparado
            ? SituacaoItemPedido.AGUARDANDO
            : SituacaoItemPedido.PRONTO,
        },
        include: INCLUIR_DETALHES,
      });

      // 7. Produtos de revenda têm baixa imediata.
      // Os preparados terão baixa quando a cozinha iniciar o preparo.
      if (!idPreparado) {
        await this.movimentosEstoqueService.baixarEstoqueDoItem(
          transacao,
          itemPedido,
        );
      }

      itensCriados.push(itemPedido);
    }

    return {
      ...comanda,
      itens: itensCriados,
    };
  });
}

  listarItensDoCliente(nrIdCliente: number)
{
  return this.prisma.itemPedido.findMany({
    where: {
      comanda: {
        is: {
          id_cliente: nrIdCliente,
          id_mesa: null
        }
      }
    },
    include: INCLUIR_DETALHES,
    orderBy: {
      dt_pedido: 'desc'
    }
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
      orderBy: { dt_pedido: 'asc' }
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

  // O cliente só cancela o que ele mesmo pediu pelo app
  // e enquanto o item ainda está aguardando.
  async cancelarItemDoCliente(nrIdItem: number, nrIdComanda: number, nrIdCliente: number)
  {
    await this.prisma.$transaction(async (transacao) => {
      await travarComanda(transacao, nrIdComanda);

      const itemPedido = await transacao.itemPedido.findFirst({
        where: {
          id_item_pedido: nrIdItem,
          id_comanda: nrIdComanda,
          id_usuario: nrIdCliente,
          comanda: {
            id_cliente: nrIdCliente,
            id_mesa: null,
          },
        },
      });

      if (!itemPedido)
        throw new NotFoundException(`Item de pedido ${nrIdItem} não encontrado!`);

      if (itemPedido.id_usuario !== nrIdCliente)
        throw new ForbiddenException('Você só pode cancelar os itens que você mesmo pediu!');

      if (itemPedido.id_situacao !== SituacaoItemPedido.AGUARDANDO)
        throw new ConflictException('Só é possível cancelar um item que ainda está aguardando!');

      await transacao.itemPedido.update({
        where: { id_item_pedido: nrIdItem },
        data: {
          id_situacao: SituacaoItemPedido.CANCELADO,
        },
      });

      // 2. Verifica se ainda existem itens não cancelados.
      const quantidadeItensAtivos = await transacao.itemPedido.count({
        where: {
          id_comanda: nrIdComanda,
          id_situacao: {
            not: SituacaoItemPedido.CANCELADO,
          },
        },
      });

      // 3. Se todos foram cancelados, cancela a comanda.
      if (quantidadeItensAtivos === 0) {
        await transacao.comanda.update({
          where: {
            id_comanda: nrIdComanda,
          },
          data: {
            id_situacao: SituacaoComanda.CANCELADA,
          },
        });
      }
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
