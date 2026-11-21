
import 'item_pedido.dart';

class Comanda {
  final int idComanda;
  final List<ItemPedido> itens;

  Comanda({
    required this.idComanda,
    required this.itens,
  });

  num get valorTotal {
  return itens
      .where((item) => item.situacao != 'CANCELADO')
      .fold(
        0,
        (total, item) =>
            total + (item.valorUnitario * item.quantidade),
      );
}
}
