
import 'item_pedido.dart';

class Comanda {
  final int idComanda;
  final List<ItemPedido> itens;

  Comanda({
    required this.idComanda,
    required this.itens,
  });

  double get valorTotal {
    return itens
        .where((item) => item.situacao != 'CANCELADO')
        .fold(
          0.0,
          (total, item) =>
              total + (item.valorUnitario * item.quantidade),
        );
  }

  String get situacaoGeral {
    final itensAtivos = itens
        .where((item) => item.situacao != 'CANCELADO')
        .toList();

    if (itensAtivos.isEmpty) {
      return 'CANCELADA';
    }

    if (itensAtivos.any((item) => item.situacao == 'EM_PREPARO')) {
      return 'EM_PREPARO';
    }

    if (itensAtivos.any((item) => item.situacao == 'AGUARDANDO')) {
      return 'AGUARDANDO';
    }

    if (itensAtivos.any((item) => item.situacao == 'PRONTO')) {
      return 'PRONTO';
    }

    if (itensAtivos.every((item) => item.situacao == 'ENTREGUE')) {
      return 'FINALIZADA';
    }

    return 'AGUARDANDO';
  }
}
