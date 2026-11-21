
class Usuario {
  final int idUsuario;
  final String apelido;
  final String perfil;
  final bool ativo;
  final String nomeCompleto;
  final String email;
  final String telefone;
  final String cpfCnpj;

  Usuario({
    required this.idUsuario,
    required this.apelido,
    required this.perfil,
    required this.ativo,
    required this.nomeCompleto,
    required this.email,
    required this.telefone,
    required this.cpfCnpj,
  });

  factory Usuario.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic> pessoa =
        json['pessoa'] is Map
            ? Map<String, dynamic>.from(json['pessoa'])
            : {};

    return Usuario(
      idUsuario: (json['id_usuario'] as num).toInt(),
      apelido: json['ds_apelido']?.toString() ?? '',
      perfil: json['perfil']?.toString() ?? '',
      ativo: json['id_ativo'] == true,
      nomeCompleto: pessoa['nm_pessoa']?.toString() ?? '',
      email: pessoa['ds_email']?.toString() ?? '',
      telefone: pessoa['ds_telefone']?.toString() ?? '',
      cpfCnpj: pessoa['ds_cnpj_cpf']?.toString() ?? '',
    );
  }
}
