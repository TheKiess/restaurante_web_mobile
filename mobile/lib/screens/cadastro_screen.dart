
import 'package:material_ui/material_ui.dart';

import '../services/usuario_service.dart';
import '../widgets/barra_superior.dart';

class CadastroScreen extends StatefulWidget {
  const CadastroScreen({super.key});

  static const Color vinho = Color(0xFF6F2438);
  static const Color creme = Color(0xFFF8F4EF);
  static const Color texto = Color(0xFF352A2C);

  @override
  State<CadastroScreen> createState() => _CadastroScreenState();
}

class _CadastroScreenState extends State<CadastroScreen> {
  final _formKey = GlobalKey<FormState>();

  final nomeController = TextEditingController();
  final cpfController = TextEditingController();
  final emailController = TextEditingController();
  final telefoneController = TextEditingController();
  final apelidoController = TextEditingController();
  final senhaController = TextEditingController();
  final confirmarSenhaController = TextEditingController();

  final usuarioService = UsuarioService();

  bool carregando = false;
  bool mostrarSenha = false;
  bool mostrarConfirmacao = false;

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

  Future<void> cadastrar() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      carregando = true;
    });

    try {
      await usuarioService.cadastrarUsuario(
        nome: nomeController.text.trim(),
        cpf: cpfController.text.trim().isEmpty
            ? null
            : cpfController.text.replaceAll(RegExp(r'\D'), ''),
        email: emailController.text.trim().isEmpty
            ? null
            : emailController.text.trim(),
        telefone: telefoneController.text.trim().isEmpty
            ? null
            : telefoneController.text.replaceAll(RegExp(r'\D'), ''),
        apelido: apelidoController.text.trim(),
        senha: senhaController.text,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cadastro realizado com sucesso!'),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.pop(context);
    } catch (erro) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(erro.toString().replaceFirst('Exception: ', '')),
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
    required String mensagem,
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
          hintText: mensagem,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(
              color: CadastroScreen.vinho,
              width: 2,
            ),
          ),
          suffixIcon: senha
              ? IconButton(
                  icon: Icon(
                    mostrar ? Icons.visibility_off : Icons.visibility,
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
      backgroundColor: CadastroScreen.creme,
      appBar: const BarraSuperior(
        titulo: 'Criar minha conta',
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(
                Icons.person_add_alt_1,
                size: 65,
                color: CadastroScreen.vinho,
              ),
              const SizedBox(height: 12),
              const Text(
                'Seja bem-vindo!',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 23,
                  fontWeight: FontWeight.bold,
                  color: CadastroScreen.texto,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Preencha seus dados para criar sua conta.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 28),

              campo(
                titulo: 'Nome completo',
                controller: nomeController,
                mensagem: 'Digite seu nome',
                validar: (valor) {
                  if (valor == null || valor.trim().isEmpty) {
                    return 'Informe seu nome';
                  }
                  return null;
                },
              ),

              campo(
                titulo: 'CPF (opcional)',
                controller: cpfController,
                mensagem: 'Somente números',
                tipo: TextInputType.number,
                validar: (valor) {
                  if (valor != null && valor.isNotEmpty) {
                    final cpf = valor.replaceAll(RegExp(r'\D'), '');
                    if (cpf.length != 11) {
                      return 'O CPF deve conter 11 números';
                    }
                  }
                  return null;
                },
              ),

              campo(
                titulo: 'E-mail',
                controller: emailController,
                mensagem: 'seu@email.com',
                tipo: TextInputType.emailAddress,
                validar: (valor) {
                  if (valor != null &&
                      valor.isNotEmpty &&
                      !RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(valor)) {
                    return 'Informe um e-mail válido';
                  }
                  return null;
                },
              ),

              campo(
                titulo: 'Telefone',
                controller: telefoneController,
                mensagem: 'Somente números',
                tipo: TextInputType.phone,
              ),

              campo(
                titulo: 'Apelido',
                controller: apelidoController,
                mensagem: 'Escolha um nome de acesso',
                validar: (valor) {
                  if (valor == null || valor.trim().length < 3) {
                    return 'O apelido deve ter pelo menos 3 caracteres';
                  }
                  return null;
                },
              ),

              campo(
                titulo: 'Senha',
                controller: senhaController,
                mensagem: 'Mínimo de 6 caracteres',
                senha: true,
                mostrar: mostrarSenha,
                alternarSenha: () {
                  setState(() {
                    mostrarSenha = !mostrarSenha;
                  });
                },
                validar: (valor) {
                  if (valor == null || valor.length < 6) {
                    return 'A senha deve ter pelo menos 6 caracteres';
                  }
                  return null;
                },
              ),

              campo(
                titulo: 'Confirmar senha',
                controller: confirmarSenhaController,
                mensagem: 'Digite a senha novamente',
                senha: true,
                mostrar: mostrarConfirmacao,
                alternarSenha: () {
                  setState(() {
                    mostrarConfirmacao = !mostrarConfirmacao;
                  });
                },
                validar: (valor) {
                  if (valor != senhaController.text) {
                    return 'As senhas não coincidem';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 12),

              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: carregando ? null : cadastrar,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: CadastroScreen.vinho,
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
                          'Cadastrar',
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
