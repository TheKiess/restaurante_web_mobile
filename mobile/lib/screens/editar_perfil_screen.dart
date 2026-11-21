
import 'package:material_ui/material_ui.dart';

import '../models/usuario.dart';
import '../services/usuario_service.dart';
import '../widgets/barra_superior.dart';

class EditarPerfilScreen extends StatefulWidget {
  final Usuario usuario;
  final String token;

  const EditarPerfilScreen({
    super.key,
    required this.usuario,
    required this.token,
  });

  @override
  State<EditarPerfilScreen> createState() => _EditarPerfilScreenState();
}

class _EditarPerfilScreenState extends State<EditarPerfilScreen> {
  static const Color vinho = Color(0xFF6F2438);
  static const Color creme = Color(0xFFF8F4EF);

  final UsuarioService usuarioService = UsuarioService();
  final formKey = GlobalKey<FormState>();

  late final TextEditingController nomeController;
  late final TextEditingController cpfController;
  late final TextEditingController emailController;
  late final TextEditingController telefoneController;
  late final TextEditingController apelidoController;

  final senhaController = TextEditingController();
  final confirmarSenhaController = TextEditingController();

  bool carregando = false;
  bool mostrarSenha = false;
  bool mostrarConfirmacao = false;

  @override
  void initState() {
    super.initState();

    nomeController = TextEditingController(
      text: widget.usuario.nomeCompleto,
    );
    cpfController = TextEditingController(
      text: widget.usuario.cpfCnpj,
    );
    emailController = TextEditingController(
      text: widget.usuario.email,
    );
    telefoneController = TextEditingController(
      text: widget.usuario.telefone,
    );
    apelidoController = TextEditingController(
      text: widget.usuario.apelido,
    );
  }

  @override
  void dispose() {
    nomeController.dispose();
    cpfController.dispose();
    emailController.dispose();
    telefoneController.dispose();
    apelidoController.dispose();
    senhaController.dispose();
    confirmarSenhaController.dispose();
    super.dispose();
  }

  Future<void> salvar() async {
    if (!formKey.currentState!.validate()) return;

    setState(() {
      carregando = true;
    });

    try {
      final usuarioAtualizado =
          await usuarioService.atualizarMeuPerfil(
        token: widget.token,
        nome: nomeController.text.trim(),
        cpf: cpfController.text.trim().isEmpty
            ? null
            : cpfController.text,
        email: emailController.text.trim(),
        telefone: telefoneController.text.trim(),
        apelido: apelidoController.text.trim(),
        senha: senhaController.text.isEmpty
            ? null
            : senhaController.text,
      );

      if (!mounted) return;

      Navigator.pop(context, usuarioAtualizado);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Perfil atualizado com sucesso!'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (erro) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            erro.toString().replaceFirst('Exception: ', ''),
          ),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          carregando = false;
        });
      }
    }
  }

  Widget campo({
    required String titulo,
    required TextEditingController controller,
    TextInputType tipo = TextInputType.text,
    bool senha = false,
    bool mostrar = false,
    VoidCallback? alternarSenha,
    String? Function(String?)? validar,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        controller: controller,
        keyboardType: tipo,
        obscureText: senha && !mostrar,
        decoration: InputDecoration(
          labelText: titulo,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(
              color: vinho,
              width: 2,
            ),
          ),
          suffixIcon: senha
              ? IconButton(
                  icon: Icon(
                    mostrar
                        ? Icons.visibility_off
                        : Icons.visibility,
                  ),
                  onPressed: alternarSenha,
                )
              : null,
        ),
        validator: validar,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: creme,
      appBar: const BarraSuperior(
        titulo: 'Editar meu perfil',
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              campo(
                titulo: 'Nome completo',
                controller: nomeController,
                validar: (valor) {
                  if (valor == null || valor.trim().isEmpty) {
                    return 'Informe seu nome';
                  }
                  return null;
                },
              ),

              campo(
                titulo: 'CPF/CNPJ',
                controller: cpfController,
                tipo: TextInputType.number,
                validar: (valor) {
                  if (valor != null && valor.isNotEmpty) {
                    final documento =
                        valor.replaceAll(RegExp(r'\D'), '');

                    if (documento.length != 11 &&
                        documento.length != 14) {
                      return 'Informe 11 ou 14 números';
                    }
                  }
                  return null;
                },
              ),

              campo(
                titulo: 'E-mail',
                controller: emailController,
                tipo: TextInputType.emailAddress,
                validar: (valor) {
                  if (valor != null &&
                      valor.isNotEmpty &&
                      !RegExp(r'^[^@]+@[^@]+\.[^@]+$')
                          .hasMatch(valor)) {
                    return 'Informe um e-mail válido';
                  }
                  return null;
                },
              ),

              campo(
                titulo: 'Telefone',
                controller: telefoneController,
                tipo: TextInputType.phone,
              ),

              campo(
                titulo: 'Apelido',
                controller: apelidoController,
                validar: (valor) {
                  if (valor == null || valor.trim().length < 3) {
                    return 'Mínimo de 3 caracteres';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 12),

              const Text(
                'Alterar senha',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: vinho,
                ),
              ),

              const SizedBox(height: 6),

              const Text(
                'Deixe os campos abaixo vazios se não quiser '
                'alterar sua senha.',
              ),

              const SizedBox(height: 16),

              campo(
                titulo: 'Nova senha',
                controller: senhaController,
                senha: true,
                mostrar: mostrarSenha,
                alternarSenha: () {
                  setState(() {
                    mostrarSenha = !mostrarSenha;
                  });
                },
                validar: (valor) {
                  if (valor != null &&
                      valor.isNotEmpty &&
                      valor.length < 6) {
                    return 'A senha deve ter pelo menos 6 caracteres';
                  }
                  return null;
                },
              ),

              campo(
                titulo: 'Confirmar nova senha',
                controller: confirmarSenhaController,
                senha: true,
                mostrar: mostrarConfirmacao,
                alternarSenha: () {
                  setState(() {
                    mostrarConfirmacao = !mostrarConfirmacao;
                  });
                },
                validar: (valor) {
                  if (senhaController.text.isNotEmpty &&
                      valor != senhaController.text) {
                    return 'As senhas não coincidem';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 12),

              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: carregando ? null : salvar,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: vinho,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: carregando
                      ? const CircularProgressIndicator(
                          color: Colors.white,
                        )
                      : const Text(
                          'Salvar alterações',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
