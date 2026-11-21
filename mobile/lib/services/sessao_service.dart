
import 'package:material_ui/material_ui.dart';

import '../models/usuario.dart';
import '../models/resultado_login.dart';

class SessaoService {
  static final ValueNotifier<String?> tokenNotifier =
      ValueNotifier<String?>(null);

  static String? get token => tokenNotifier.value;

  static set token(String? valor) {
    tokenNotifier.value = valor;
  }

  static Usuario? usuario;

  static bool get autenticado {
    return token != null && token!.isNotEmpty;
  }

  static void iniciarSessao(ResultadoLogin resultado) {
    usuario = resultado.usuario;
    token = resultado.token;
  }

  static void encerrarSessao() {
    usuario = null;
    token = null;
  }
}
