import { Prisma } from '../generated/prisma/client.js';
import { SituacaoItemPedido, SituacaoPagamento } from '../generated/prisma/enums.js';

interface ItemParaTotal
{
  vl_unitario: Prisma.Decimal;
  qt_quantidade: number;
  id_situacao: SituacaoItemPedido;
}

interface PagamentoParaTotal
{
  vl_pago: Prisma.Decimal;
  id_situacao: SituacaoPagamento;
}

export function calcularTotais(itens: ItemParaTotal[], pagamentos: PagamentoParaTotal[])
{
  const vlPago     = somarPagamentos(pagamentos, SituacaoPagamento.CONFIRMADO);
  const vlPendente = somarPagamentos(pagamentos, SituacaoPagamento.PENDENTE);
  const vlTotal    = itens.filter((item) => item.id_situacao !== SituacaoItemPedido.CANCELADO)
    .reduce((vlSoma, item) => vlSoma.plus(item.vl_unitario.mul(item.qt_quantidade)), new Prisma.Decimal(0));

  return { vlTotal, vlPago, vlPendente, vlRestante: vlTotal.minus(vlPago) };
}

function somarPagamentos(pagamentos: PagamentoParaTotal[], situacao: SituacaoPagamento)
{
  return pagamentos.filter((pagamento) => pagamento.id_situacao === situacao)
    .reduce((vlSoma, pagamento) => vlSoma.plus(pagamento.vl_pago), new Prisma.Decimal(0));
}
