
import 'dart:convert';

import 'package:http/http.dart' as http;
import '../config/api_config.dart';

import '../models/usuario.dart';
import 'erro_api.dart';

class UsuarioService
{
  static const String baseUrl = ApiConfig.baseUrl;

  // Cadastrar um novo cliente
  Future<void> cadastrarUsuario({
    required String nome,
    String? cpf,
    String? email,
    String? telefone,
    required String apelido,
    required String senha,
  }) async {
    final url      = Uri.parse('$baseUrl/usuarios');
    final resposta = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'nm_pessoa': nome,
        'ds_cnpj_cpf': cpf,
        'ds_email': email,
        'ds_telefone': telefone,
        'ds_apelido': apelido,
        'ds_senha': senha,
        'perfil': 'CLIENTE'
      })
    );

    if (resposta.statusCode != 201 && resposta.statusCode != 200)
    {
      throw Exception(extrairMensagemErro(resposta, 'Não foi possível cadastrar o usuário.'));
    }
  }

  // Buscar os dados do cliente autenticado
  Future<Usuario> buscarMeuPerfil({
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/usuarios/me');

    final resposta = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (resposta.statusCode == 200) {
      final Map<String, dynamic> dados =
          jsonDecode(resposta.body);

      return Usuario.fromJson(dados);
    }

    throw Exception(extrairMensagemErro(resposta, 'Não foi possível carregar o perfil.'));
  }

  // Atualizar os dados do cliente autenticado
  Future<Usuario> atualizarMeuPerfil({
    required String token,
    String? nome,
    String? cpf,
    String? email,
    String? telefone,
    String? apelido,
    String? senha,
  }) async {
    final url = Uri.parse('$baseUrl/usuarios/me');

    final Map<String, dynamic> dados = {};

    if (nome != null) dados['nm_pessoa'] = nome;
    if (cpf != null) {
      dados['ds_cnpj_cpf'] = cpf.replaceAll(RegExp(r'\D'), '');
    }
    if (email != null) dados['ds_email'] = email;
    if (telefone != null) {
      dados['ds_telefone'] = telefone.replaceAll(RegExp(r'\D'), '');
    }
    if (apelido != null) dados['ds_apelido'] = apelido;
    if (senha != null && senha.isNotEmpty) {
      dados['ds_senha'] = senha;
    }

    final resposta = await http.patch(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(dados),
    );

    if (resposta.statusCode == 200) {
      final Map<String, dynamic> resultado =
          jsonDecode(resposta.body);

      return Usuario.fromJson(resultado);
    }

    throw Exception(extrairMensagemErro(resposta, 'Não foi possível atualizar o perfil.'));
  }
}
