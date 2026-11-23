import 'dart:convert';
import 'package:http/http.dart' as http;

// Lê a mensagem que o backend devolve no campo "message" (texto ou lista).
String extrairMensagemErro(http.Response resposta, String mensagemPadrao)
{
  try
  {
    final dados = jsonDecode(resposta.body);

    if (dados['message'] is String)
    {
      return dados['message'];
    }

    if (dados['message'] is List)
    {
       return (dados['message'] as List).join('\n');
    }

  } catch (_) {
    // Mantém a mensagem padrão caso a resposta não seja JSON.
  }

  return mensagemPadrao;
}
