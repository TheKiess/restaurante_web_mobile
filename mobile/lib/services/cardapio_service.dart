
import 'dart:convert';
import 'package:http/http.dart' as http;

import '../models/item_cardapio.dart';

class CardapioService {
  // Endereço do backend NestJS
  static const String baseUrl = 'http://localhost:3000';

  // Busca os produtos cadastrados no banco
  Future<List<ItemCardapio>> listarItens() async {
    final url = Uri.parse('$baseUrl/itens-cardapio');

    final resposta = await http.get(url);

    if (resposta.statusCode == 200) {
      final List<dynamic> dados = jsonDecode(resposta.body);

      return dados
          .map((item) => ItemCardapio.fromJson(item))
          .toList();
    } else {
      throw Exception(
        'Erro ao carregar cardápio: ${resposta.statusCode}',
      );
    }
  }
}
