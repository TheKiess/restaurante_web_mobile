
import 'item_cardapio.dart';

class ItemCarrinho {
  final ItemCardapio produto;
  int quantidade;

  ItemCarrinho({
    required this.produto,
    this.quantidade = 1,
  });

  num get subtotal => produto.preco * quantidade;
}
