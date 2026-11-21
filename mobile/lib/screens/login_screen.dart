
import 'package:material_ui/material_ui.dart';

import '../models/resultado_login.dart';
import '../services/auth_service.dart';
import '../services/sessao_service.dart';
import '../widgets/barra_superior.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  static const Color vinho = Color(0xFF6F2438);
  static const Color creme = Color(0xFFF8F4EF);

  final AuthService authService = AuthService();

  final TextEditingController loginController =
      TextEditingController();

  final TextEditingController senhaController =
      TextEditingController();

  bool carregando = false;
  bool ocultarSenha = true;
  String? erro;

  Future<void> entrar() async {
    final login = loginController.text.trim();
    final senha = senhaController.text;

    if (login.isEmpty || senha.isEmpty) {
      setState(() {
        erro = 'Informe seu e-mail ou apelido e sua senha.';
      });
      return;
    }

    setState(() {
      carregando = true;
      erro = null;
    });

    try {
      final ResultadoLogin resultado = await authService.entrar(
        login: login,
        senha: senha,
      );

      if (!mounted) return;

      SessaoService.iniciarSessao(resultado);

      Navigator.pop(context, resultado);
    } catch (e) {
      if (!mounted) return;

      setState(() {
        erro = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          carregando = false;
        });
      }
    }
  }

  @override
  void dispose() {
    loginController.dispose();
    senhaController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: creme,
      appBar: const BarraSuperior(
        titulo: 'Entrar na minha conta',
      ),
      body: SafeArea(
        top: false,
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.restaurant,
                    size: 85,
                    color: vinho,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Restaurante',
                    style: TextStyle(
                      fontSize: 30,
                      fontWeight: FontWeight.bold,
                      color: vinho,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Entre na sua conta para continuar',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 15,
                      color: Colors.black54,
                    ),
                  ),
                  const SizedBox(height: 36),

                  TextField(
                    controller: loginController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(
                      labelText: 'E-mail ou apelido',
                      prefixIcon: const Icon(Icons.person_outline),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),

                  const SizedBox(height: 18),

                  TextField(
                    controller: senhaController,
                    obscureText: ocultarSenha,
                    onSubmitted: (_) {
                      if (!carregando) entrar();
                    },
                    decoration: InputDecoration(
                      labelText: 'Senha',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        onPressed: () {
                          setState(() {
                            ocultarSenha = !ocultarSenha;
                          });
                        },
                        icon: Icon(
                          ocultarSenha
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                        ),
                      ),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),

                  if (erro != null) ...[
                    const SizedBox(height: 16),
                    Text(
                      erro!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.red,
                        fontSize: 14,
                      ),
                    ),
                  ],

                  const SizedBox(height: 28),

                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: carregando ? null : entrar,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: vinho,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: carregando
                          ? const SizedBox(
                              height: 24,
                              width: 24,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Text(
                              'Entrar',
                              style: TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
