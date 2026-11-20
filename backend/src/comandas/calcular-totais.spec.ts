import { Prisma }                                from '../generated/prisma/client.js';
import { SituacaoItemPedido, SituacaoPagamento } from '../generated/prisma/enums.js';
import { calcularTotais }                        from './calcular-totais.js';

const item = (vlUnitario: string, qtQuantidade: number, idSituacao: SituacaoItemPedido = SituacaoItemPedido.AGUARDANDO) => ({
  vl_unitario: new Prisma.Decimal(vlUnitario),
  qt_quantidade: qtQuantidade,
  id_situacao: idSituacao
});

const pagamento = (vlPago: string, idSituacao: SituacaoPagamento) => ({
  vl_pago: new Prisma.Decimal(vlPago),
  id_situacao: idSituacao
});

describe('calcularTotais', () => {
  it('zera tudo quando não há itens nem pagamentos', () => {
    const totais = calcularTotais([], []);

    expect(totais.vlTotal.toString()).toBe('0');
    expect(totais.vlPago.toString()).toBe('0');
    expect(totais.vlPendente.toString()).toBe('0');
    expect(totais.vlRestante.toString()).toBe('0');
  });

  it('multiplica o valor unitário pela quantidade e soma os itens', () => {
    const totais = calcularTotais([item('12.50', 2), item('8.00', 3)], []);

    expect(totais.vlTotal.toString()).toBe('49');
  });

  it('não perde centavos com valores decimais', () => {
    const totais = calcularTotais([item('0.10', 3)], []);

    expect(totais.vlTotal.toString()).toBe('0.3');
  });

  it('ignora itens cancelados no total', () => {
    const totais = calcularTotais([item('20.00', 1), item('30.00', 1, SituacaoItemPedido.CANCELADO)], []);

    expect(totais.vlTotal.toString()).toBe('20');
  });

  it('conta como item todas as situações menos a cancelada', () => {
    const arrSituacoes = [
      SituacaoItemPedido.AGUARDANDO,
      SituacaoItemPedido.EM_PREPARO,
      SituacaoItemPedido.PRONTO,
      SituacaoItemPedido.ENTREGUE
    ];

    const totais = calcularTotais(arrSituacoes.map((idSituacao) => item('10.00', 1, idSituacao)), []);

    expect(totais.vlTotal.toString()).toBe('40');
  });

  it('separa pagamentos confirmados, pendentes e recusados', () => {
    const totais = calcularTotais([item('100.00', 1)], [
      pagamento('30.00', SituacaoPagamento.CONFIRMADO),
      pagamento('20.00', SituacaoPagamento.CONFIRMADO),
      pagamento('15.00', SituacaoPagamento.PENDENTE),
      pagamento('99.00', SituacaoPagamento.RECUSADO)
    ]);

    expect(totais.vlPago.toString()).toBe('50');
    expect(totais.vlPendente.toString()).toBe('15');
  });

  it('calcula o restante usando só o que foi confirmado', () => {
    const totais = calcularTotais([item('100.00', 1)], [
      pagamento('40.00', SituacaoPagamento.CONFIRMADO),
      pagamento('60.00', SituacaoPagamento.PENDENTE)
    ]);

    expect(totais.vlRestante.toString()).toBe('60');
  });

  it('deixa o restante negativo quando pagaram a mais', () => {
    const totais = calcularTotais([item('50.00', 1)], [pagamento('70.00', SituacaoPagamento.CONFIRMADO)]);

    expect(totais.vlRestante.toString()).toBe('-20');
  });
});
