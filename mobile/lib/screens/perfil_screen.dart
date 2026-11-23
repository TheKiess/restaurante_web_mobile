
import 'package:material_ui/material_ui.dart';

import '../models/usuario.dart';
import '../models/resultado_login.dart';
import '../services/usuario_service.dart';
import '../services/sessao_service.dart';
import '../widgets/barra_superior.dart';
import 'cadastro_screen.dart';
import 'editar_perfil_screen.dart';
import 'login_screen.dart';

class PerfilScreen extends StatefulWidget {
  final String? token;

  const PerfilScreen({
    super.key,
    this.token,
  });

  @override
  State<PerfilScreen> createState() => _PerfilScreenState();
}

class _PerfilScreenState extends State<PerfilScreen> {
  static const Color vinho = Color(0xFF6F2438);
  static const Color creme = Color(0xFFF8F4EF);
  static const Color texto = Color(0xFF352A2C);

  final UsuarioService usuarioService = UsuarioService();

  Usuario? usuario;
  bool carregando = false;
  String? erro;

  String? get tokenAtual {
    return SessaoService.token ?? widget.token;
  }

  @override
  void initState() {
    super.initState();

    if (tokenAtual != null && tokenAtual!.isNotEmpty) {
      carregarPerfil();
    }
  }

  @override
  void didUpdateWidget(covariant PerfilScreen oldWidget) {
    super.didUpdateWidget(oldWidget);

    final token = tokenAtual;

    if (token != null &&
        token.isNotEmpty &&
        token != oldWidget.token) {
      carregarPerfil();
    }

    if (token == null || token.isEmpty) {
      usuario = null;
      erro = null;
      carregando = false;
    }
  }

  Future<void> carregarPerfil() async {
    final token = tokenAtual;

    if (token == null || token.isEmpty) {
      return;
    }

    setState(() {
      carregando = true;
      erro = null;
    });

    try {
      final resultado = await usuarioService.buscarMeuPerfil(
        token: token,
      );

      if (!mounted) return;

      setState(() {
        usuario = resultado;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        erro = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          carregando = false;
        });
      }
    }
  }

  Future<void> entrarNaConta() async {
    final resultado = await Navigator.push<ResultadoLogin>(
      context,
      MaterialPageRoute(
        builder: (context) => const LoginScreen(),
      ),
    );

    if (!mounted) return;

    if (resultado != null) {
      setState(() {
        usuario = null;
        erro = null;
      });

      await carregarPerfil();
    }
  }

  Future<void> editarPerfil() async {
    final token = tokenAtual;

    if (usuario == null || token == null || token.isEmpty) {
      return;
    }

    final resultado = await Navigator.push<Usuario>(
      context,
      MaterialPageRoute(
        builder: (context) => EditarPerfilScreen(
          usuario: usuario!,
          token: token,
        ),
      ),
    );

    if (!mounted) return;

    if (resultado != null) {
      setState(() {
        usuario = resultado;
        erro = null;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Perfil atualizado com sucesso!'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  Future<void> sairDaConta() async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Sair da conta'),
          content: const Text(
            'Tem certeza de que deseja sair da sua conta?',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context, false);
              },
              child: const Text(
                'Cancelar',
                style: TextStyle(color: texto),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context, true);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: vinho,
                foregroundColor: Colors.white,
              ),
              child: const Text('Sair'),
            ),
          ],
        );
      },
    );

    if (confirmar != true || !mounted) return;

    SessaoService.encerrarSessao();

    setState(() {
      usuario = null;
      erro = null;
      carregando = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Você saiu da sua conta.'),
        backgroundColor: vinho,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final token = tokenAtual;
    final possuiToken = token != null && token.isNotEmpty;

    return Scaffold(
      backgroundColor: creme,
      appBar: BarraSuperior(
        titulo: 'Meu perfil',
        automaticamenteImplyLeading: false,
        acoes: [
          if (possuiToken)
            IconButton(
              onPressed: carregando ? null : carregarPerfil,
              icon: const Icon(Icons.refresh),
              tooltip: 'Atualizar perfil',
            ),
        ],
      ),
      body: _construirConteudo(possuiToken),
    );
  }

  Widget _construirConteudo(bool possuiToken) {
    if (!possuiToken) {
      return _construirSemLogin();
    }

    if (carregando && usuario == null) {
      return const Center(
        child: CircularProgressIndicator(color: vinho),
      );
    }

    if (erro != null && usuario == null) {
      return _construirErro();
    }

    if (usuario == null) {
      return const Center(
        child: Text('Nenhum dado de perfil encontrado.'),
      );
    }

    return RefreshIndicator(
      onRefresh: carregarPerfil,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 20),

            const CircleAvatar(
              radius: 48,
              backgroundColor: vinho,
              child: Icon(
                Icons.person,
                size: 55,
                color: Colors.white,
              ),
            ),

            const SizedBox(height: 16),

            Text(
              usuario!.nomeCompleto,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: texto,
              ),
            ),

            const SizedBox(height: 8),

            Text(
              '@${usuario!.apelido}',
              style: const TextStyle(
                fontSize: 15,
                color: texto,
              ),
            ),

            const SizedBox(height: 32),

            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Dados da minha conta',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: vinho,
                    ),
                  ),

                  const SizedBox(height: 20),

                  _informacao(
                    Icons.person_outline,
                    'Nome completo',
                    usuario!.nomeCompleto,
                  ),

                  _informacao(
                    Icons.alternate_email,
                    'Apelido',
                    usuario!.apelido,
                  ),

                  _informacao(
                    Icons.email_outlined,
                    'E-mail',
                    usuario!.email,
                  ),

                  _informacao(
                    Icons.phone_outlined,
                    'Telefone',
                    usuario!.telefone,
                  ),

                  _informacao(
                    Icons.badge_outlined,
                    'CPF/CNPJ',
                    usuario!.cpfCnpj,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: carregando ? null : editarPerfil,
                icon: const Icon(Icons.edit),
                label: const Text('Editar perfil'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: vinho,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 12),

            SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton.icon(
                onPressed: sairDaConta,
                icon: const Icon(Icons.logout),
                label: const Text('Sair da conta'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),

            if (erro != null)
              Text(
                'Não foi possível atualizar os dados: '
                '${erro.toString().replaceFirst('Exception: ', '')}',
                style: const TextStyle(color: Colors.red),
              ),
          ],
        ),
      ),
    );
  }

  Widget _construirSemLogin() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 40),

          const CircleAvatar(
            radius: 48,
            backgroundColor: vinho,
            child: Icon(
              Icons.person,
              size: 55,
              color: Colors.white,
            ),
          ),

          const SizedBox(height: 16),

          const Text(
            'Bem-vindo!',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: texto,
            ),
          ),

          const SizedBox(height: 8),

          const Text(
            'Acesse sua conta para visualizar seus dados.',
            textAlign: TextAlign.center,
            style: TextStyle(color: texto),
          ),

          const SizedBox(height: 32),

          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: entrarNaConta,
              icon: const Icon(Icons.login),
              label: const Text('Entrar na minha conta'),
              style: ElevatedButton.styleFrom(
                backgroundColor: vinho,
                foregroundColor: Colors.white,
              ),
            ),
          ),

          const SizedBox(height: 12),

          SizedBox(
            width: double.infinity,
            height: 52,
            child: OutlinedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const CadastroScreen(),
                  ),
                );
              },
              icon: const Icon(Icons.person_add),
              label: const Text('Criar minha conta'),
              style: OutlinedButton.styleFrom(
                foregroundColor: vinho,
                side: const BorderSide(color: vinho),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _construirErro() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.error_outline,
              color: Colors.red,
              size: 48,
            ),
            const SizedBox(height: 12),
            const Text(
              'Não foi possível carregar seu perfil.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: texto,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              erro ?? '',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: carregarPerfil,
              style: ElevatedButton.styleFrom(
                backgroundColor: vinho,
                foregroundColor: Colors.white,
              ),
              child: const Text('Tentar novamente'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _informacao(
    IconData icone,
    String titulo,
    String valor,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icone, color: vinho, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  titulo,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  valor.isEmpty ? 'Não informado' : valor,
                  style: const TextStyle(
                    fontSize: 14,
                    color: texto,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
