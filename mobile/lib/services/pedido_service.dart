
import 'dart:convert';
import 'package:http/http.dart' as http;

import '../models/item_pedido.dart';
import '../models/item_carrinho.dart';
import '../models/comanda.dart';

class PedidoService {
  static const String baseUrl = 'http://localhost:3000';

  // Finaliza o carrinho e registra os produtos como pedido de retirada.
  Future<int> finalizarPedido({
    required String token,
    required List<ItemCarrinho> itens,
  }) async {
    if (itens.isEmpty) {
      throw Exception('O carrinho está vazio.');
    }

    final urlComanda = Uri.parse('$baseUrl/comandas/retirada');

    final respostaComanda = await http.post(
      urlComanda,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (respostaComanda.statusCode != 201 &&
        respostaComanda.statusCode != 200) {
      throw Exception(
        'Erro ao criar comanda: ${respostaComanda.body}',
      );
    }

    final dadosComanda = jsonDecode(respostaComanda.body);
    final int idComanda = dadosComanda['id_comanda'];

    final urlItem = Uri.parse('$baseUrl/itens-pedido');

    for (final item in itens) {
      final respostaItem = await http.post(
        urlItem,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'id_comanda': idComanda,
          'id_item_cardapio': item.produto.id,
          'qt_quantidade': item.quantidade,
        }),
      );

      if (respostaItem.statusCode != 201 &&
          respostaItem.statusCode != 200) {
        throw Exception(
          'Erro ao registrar ${item.produto.nome}: '
          '${respostaItem.body}',
        );
      }
    }

    return idComanda;
  }

  // Lista os pedidos do cliente autenticado.
  Future<List<ItemPedido>> listarMeusPedidos({
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/itens-pedido/meus');

    final resposta = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (resposta.statusCode == 200) {
      final List<dynamic> dados = jsonDecode(resposta.body);

      return dados
          .map((item) => ItemPedido.fromJson(item))
          .toList();
    }

    throw Exception(
      'Erro ao carregar pedidos: '
      '${resposta.statusCode} - ${resposta.body}',
    );
  }

  // Agrupa os itens de pedido por comanda.
  Future<List<Comanda>> listarMinhasComandas({
    required String token,
  }) async {
    final pedidos = await listarMeusPedidos(token: token);

    final Map<int, List<ItemPedido>> itensPorComanda = {};

    for (final pedido in pedidos) {
      itensPorComanda
          .putIfAbsent(pedido.idComanda, () => [])
          .add(pedido);
    }

    return itensPorComanda.entries.map((entrada) {
      return Comanda(
        idComanda: entrada.key,
        itens: entrada.value,
      );
    }).toList();
  }

  // Cancela um item que ainda está aguardando.
  Future<void> cancelarPedido({
    required String token,
    required int idItemPedido,
    required int idComanda,
  }) async {
    final url = Uri.parse(
      '$baseUrl/itens-pedido/$idItemPedido/cancelar',
    );

    final resposta = await http.patch(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'id_comanda': idComanda,
      }),
    );

    if (resposta.statusCode != 200) {
      throw Exception(
        'Erro ao cancelar pedido: '
        '${resposta.statusCode} - ${resposta.body}',
      );
    }
  }
}
