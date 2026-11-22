
import 'dart:convert';
import 'package:http/http.dart' as http;

import '../models/item_pedido.dart';
import '../models/item_carrinho.dart';
import '../models/comanda.dart';

class PedidoService {
  static const String baseUrl = 'http://localhost:3000';

  // Finaliza o carrinho em uma única requisição.
  Future<int> finalizarPedido({
    required String token,
    required List<ItemCarrinho> itens,
  }) async {
    if (itens.isEmpty) {
      throw Exception('O carrinho está vazio.');
    }

    final url = Uri.parse('$baseUrl/itens-pedido/retirada');

    final resposta = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'itens': itens.map((item) {
          return {
            'id_item_cardapio': item.produto.id,
            'qt_quantidade': item.quantidade,
          };
        }).toList(),
      }),
    );

    if (resposta.statusCode != 201 &&
        resposta.statusCode != 200) {
      throw Exception(
        'Erro ao finalizar pedido: '
        '${resposta.statusCode} - ${resposta.body}',
      );
    }

    final dados = jsonDecode(resposta.body);
    return dados['id_comanda'] as int;
  }

  // Registra o pagamento da comanda.
  Future<void> registrarPagamento({
    required String token,
    required int idComanda,
    required double valorTotal,
    required String formaPagamento,
  }) async {
    final url = Uri.parse('$baseUrl/pagamentos');

    final resposta = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'id_comanda': idComanda,
        'vl_pago': valorTotal,
        'forma_pagamento': formaPagamento,
      }),
    );

    if (resposta.statusCode != 201 &&
        resposta.statusCode != 200) {
      throw Exception(
        'Erro ao registrar pagamento: '
        '${resposta.statusCode} - ${resposta.body}',
      );
    }
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
