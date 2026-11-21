
import 'package:flutter/foundation.dart';

import '../models/item_cardapio.dart';
import '../models/item_carrinho.dart';

class CarrinhoService extends ChangeNotifier {
  final List<ItemCarrinho> _itens = [];

  List<ItemCarrinho> get itens => List.unmodifiable(_itens);

  int get quantidadeTotal {
    return _itens.fold(
      0,
      (total, item) => total + item.quantidade,
    );
  }

  num get valorTotal {
    return _itens.fold(
      0,
      (total, item) => total + item.subtotal,
    );
  }

  void adicionar(ItemCardapio produto) {
    final indice = _itens.indexWhere(
      (item) => item.produto.id == produto.id,
    );

    if (indice >= 0) {
      _itens[indice].quantidade++;
    } else {
      _itens.add(
        ItemCarrinho(produto: produto),
      );
    }

    notifyListeners();
  }

  void incrementar(ItemCarrinho item) {
    item.quantidade++;
    notifyListeners();
  }

  void decrementar(ItemCarrinho item) {
    if (item.quantidade > 1) {
      item.quantidade--;
    } else {
      remover(item);
      return;
    }

    notifyListeners();
  }

  void remover(ItemCarrinho item) {
    _itens.remove(item);
    notifyListeners();
  }

  void limpar() {
    _itens.clear();
    notifyListeners();
  }
  static final CarrinhoService instance = CarrinhoService();
}