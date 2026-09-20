import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { FormaPagamento, SituacaoComanda, SituacaoPagamento } from '../generated/prisma/enums.js';
import { calcularTotais } from '../comandas/calcular-totais.js';
import { CreatePagamentoDto } from './dto/create-pagamento.dto.js';
import { AlterarSituacaoPagamentoDto } from './dto/alterar-situacao-pagamento.dto.js';
import { ListarPagamentosQueryDto } from './dto/listar-pagamentos-query.dto.js';

@Injectable()
export class PagamentosService
{
  constructor(private readonly prisma: PrismaService) {}

  async registrarPagamento(createPagamentoDto: CreatePagamentoDto)
  {
    const { id_comanda, vl_pago, forma_pagamento } = createPagamentoDto;
    const comanda = await this.prisma.comanda.findUnique({
      where: {
        id_comanda },
        include: {
          itens: true,
          pagamentos: true
        }
      });

    if (!comanda)
      throw new NotFoundException(`Comanda ${id_comanda} não encontrada!`);
  
    if (comanda.id_situacao !== SituacaoComanda.ABERTA)
      throw new ConflictException('Só é possível registrar pagamento em uma comanda aberta!');

    const { vlTotal, vlPago, vlPendente } = calcularTotais(comanda.itens, comanda.pagamentos);
    const vlDisponivel                    = vlTotal.minus(vlPago).minus(vlPendente);

    if (new Prisma.Decimal(vl_pago).gt(vlDisponivel)) throw new ConflictException(`Valor maior que o que falta pagar (${vlDisponivel.toFixed(2)})`);

    const confirmadoNaHora = forma_pagamento !== FormaPagamento.PIX;
    return this.prisma.pagamento.create({
      data: {
        id_comanda,
        vl_pago,
        forma_pagamento,
        id_situacao: confirmadoNaHora ? SituacaoPagamento.CONFIRMADO : SituacaoPagamento.PENDENTE,
        dt_pagamento: confirmadoNaHora ? new Date() : null,
      },
    });
  }

  listarPagamentos(listarPagamentosQueryDto: ListarPagamentosQueryDto)
  {
    return this.prisma.pagamento.findMany({
      where: { id_comanda: listarPagamentosQueryDto.id_comanda, id_situacao: listarPagamentosQueryDto.id_situacao },
      orderBy: { id_pagamento: 'asc' },
    });
  }

  async buscarPagamentoPorId(nrId: number)
  {
    const pagamento = await this.prisma.pagamento.findUnique({ where: { id_pagamento: nrId } });

    if (!pagamento)
      throw new NotFoundException(`Pagamento ${nrId} não encontrado!`);

    return pagamento;
  }

  async alterarSituacaoPagamento(nrId: number, alterarSituacaoPagamentoDto: AlterarSituacaoPagamentoDto)
  {
    await this.buscarPagamentoPorId(nrId);
    const situacaoNova = alterarSituacaoPagamentoDto.id_situacao;
    const { count }    = await this.prisma.pagamento.updateMany({
      where: { id_pagamento: nrId, id_situacao: SituacaoPagamento.PENDENTE },
      data: {
        id_situacao: situacaoNova,
        dt_pagamento: situacaoNova === SituacaoPagamento.CONFIRMADO ? new Date() : null
      },
    });

    if (count === 0)
      throw new ConflictException('Só é possível confirmar ou recusar um pagamento pendente!');

    return this.buscarPagamentoPorId(nrId);
  }
}