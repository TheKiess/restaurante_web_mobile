
import 'dart:convert';
import 'package:http/http.dart' as http;

import '../models/resultado_login.dart';

class AuthService {
  static const String baseUrl = 'http://localhost:3000';

  Future<ResultadoLogin> entrar({
    required String login,
    required String senha,
  }) async {
    final url = Uri.parse('$baseUrl/auth/login');

    final resposta = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'ds_login': login.trim(),
        'ds_senha': senha,
      }),
    );

    if (resposta.statusCode == 200) {
      final Map<String, dynamic> dados =
          jsonDecode(resposta.body);

      return ResultadoLogin.fromJson(dados);
    }

    String mensagem = 'Não foi possível realizar o login.';

    try {
      final dados = jsonDecode(resposta.body);

      if (dados['message'] is String) {
        mensagem = dados['message'];
      } else if (dados['message'] is List) {
        mensagem = (dados['message'] as List).join('\n');
      }
    } catch (_) {
      // Mantém a mensagem padrão caso a resposta não seja JSON.
    }

    throw Exception(mensagem);
  }
}
