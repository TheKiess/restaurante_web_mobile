
import 'usuario.dart';

class ResultadoLogin {
  final String token;
  final Usuario usuario;

  ResultadoLogin({
    required this.token,
    required this.usuario,
  });

  factory ResultadoLogin.fromJson(Map<String, dynamic> json) {
    return ResultadoLogin(
      token: json['ds_token'],
      usuario: Usuario(
        idUsuario: json['usuario']['id_usuario'],
        apelido: json['usuario']['ds_apelido'],
        perfil: json['usuario']['perfil'],
        ativo: true,
        nomeCompleto: json['usuario']['nm_pessoa'],
        email: '',
        telefone: '',
        cpfCnpj: '',
      ),
    );
  }
}
