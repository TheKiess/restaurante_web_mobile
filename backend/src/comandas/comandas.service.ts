import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SituacaoComanda, SituacaoItemPedido, SituacaoPagamento } from '../generated/prisma/enums.js';
import { calcularTotais } from './calcular-totais.js';
import { CreateComandaDto } from './dto/create-comanda.dto.js';
import { UpdateComandaDto } from './dto/update-comanda.dto.js';
import { ListarComandasQueryDto } from './dto/listar-comandas-query.dto.js';

@Injectable()
export class ComandasService
{
  constructor(private readonly prisma: PrismaService) {}

  async abrirComanda(createComandaDto: CreateComandaDto)
  {
    const { id_usuario, id_mesa } = createComandaDto;
    await this.validarUsuario(id_usuario);

    if (id_mesa)
      await this.validarMesaLivre(id_mesa);

    return this.prisma.comanda.create({ data: { id_usuario, id_mesa } });
  }

  listarComandas(listarComandasQueryDto: ListarComandasQueryDto)
  {
    return this.prisma.comanda.findMany({
      where: { id_situacao: listarComandasQueryDto.id_situacao },
      include: { mesa: true },
      orderBy: { dt_abertura: 'desc' },
    });
  }

  async buscarComandaPorId(nrId: number)
  {
    const comanda = await this.prisma.comanda.findUnique({
      where: { id_comanda: nrId },
      include: {
        mesa: true,
        usuario: { select: { id_usuario: true, ds_apelido: true, pessoa: { select: { nm_pessoa: true } } } },
        itens: { include: { item_cardapio: { select: { nm_item: true } } }, orderBy: { dt_pedido: 'asc' } },
        pagamentos: true,
      },
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
    await this.validarComandaAberta(nrId);
    await this.validarMesaLivre(updateComandaDto.id_mesa, nrId);
    await this.prisma.comanda.update({ where: { id_comanda: nrId }, data: { id_mesa: updateComandaDto.id_mesa } });
    return this.buscarComandaPorId(nrId);
  }

  async fecharComanda(nrId: number)
  {
    await this.prisma.$transaction(async (tx) => {
      const comanda = await tx.comanda.findUnique({ where: { id_comanda: nrId }, include: { itens: true, pagamentos: true } });

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
      if (vlRestante.gte(0))
        throw new ConflictException(`Falta pagar ${vlRestante.toFixed(2)}!`);
      if (vlRestante.lt(0))
        throw new ConflictException('Os pagamentos são maiores que o total da comanda!');

      const { count } = await tx.comanda.updateMany({
        where: { id_comanda: nrId, id_situacao: SituacaoComanda.ABERTA },
        data: { id_situacao: SituacaoComanda.FECHADA, dt_fechamento: new Date() },
      });

      if (count === 0)
        throw new ConflictException('Esta comanda acabou de ser alterada por outra pessoa, atualize e tente de novo');
    });

    return this.buscarComandaPorId(nrId);
  }

  async cancelarComanda(nrId: number)
  {
    await this.validarComandaAberta(nrId);
    const nrItensEntregues = await this.prisma.itemPedido.count({
      where: { id_comanda: nrId, id_situacao: SituacaoItemPedido.ENTREGUE },
    });

    if (nrItensEntregues > 0)
      throw new ConflictException('Comanda com itens entregues não pode ser cancelada, feche a comanda!');

    const nrPagamentosConfirmados = await this.prisma.pagamento.count({
      where: { id_comanda: nrId, id_situacao: SituacaoPagamento.CONFIRMADO },
    });

    if (nrPagamentosConfirmados > 0)
      throw new ConflictException('Comanda com pagamento confirmado não pode ser cancelada!');

    await this.prisma.$transaction([
      this.prisma.itemPedido.updateMany({ where: { id_comanda: nrId }, data: { id_situacao: SituacaoItemPedido.CANCELADO } }),
      this.prisma.pagamento.updateMany({
        where: { id_comanda: nrId, id_situacao: SituacaoPagamento.PENDENTE },
        data: { id_situacao: SituacaoPagamento.RECUSADO },
      }),
      this.prisma.comanda.update({
        where: { id_comanda: nrId },
        data: { id_situacao: SituacaoComanda.CANCELADA, dt_fechamento: new Date() },
      })
    ]);
    return this.buscarComandaPorId(nrId);
  }

  private async validarUsuario(nrIdUsuario: number)
  {
    const usuario = await this.prisma.usuario.findUnique({ where: { id_usuario: nrIdUsuario } });

    if (!usuario)
      throw new NotFoundException(`Usuário ${nrIdUsuario} não encontrado!`);
  }

  private async validarMesaLivre(nrIdMesa: number, nrIdComandaAtual?: number)
  {
    const mesa = await this.prisma.mesa.findUnique({ where: { id_mesa: nrIdMesa } });

    if (!mesa)
      throw new NotFoundException(`Mesa ${nrIdMesa} não encontrada!`);

    const comandaAberta = await this.prisma.comanda.findFirst({
      where: { id_mesa: nrIdMesa, id_situacao: SituacaoComanda.ABERTA }
    });

    if (comandaAberta && comandaAberta.id_comanda !== nrIdComandaAtual)
      throw new ConflictException(`Mesa ${mesa.nr_mesa} já tem uma comanda aberta!`);
  }

  private async validarComandaAberta(nrId: number)
  {
    const comanda = await this.prisma.comanda.findUnique({ where: { id_comanda: nrId } });

    if (!comanda)
      throw new NotFoundException(`Comanda ${nrId} não encontrada!`);

    if (comanda.id_situacao !== SituacaoComanda.ABERTA)
      throw new ConflictException('Só é possível alterar uma comanda aberta!');
  }
}
