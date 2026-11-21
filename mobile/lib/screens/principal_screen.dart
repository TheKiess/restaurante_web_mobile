
import 'package:material_ui/material_ui.dart';

import '../services/sessao_service.dart';
import 'cardapio_screen.dart';
import 'pedidos_screen.dart';
import 'carrinho_screen.dart';
import 'perfil_screen.dart';

class PrincipalScreen extends StatefulWidget {
  final String? tokenCliente;

  const PrincipalScreen({
    super.key,
    this.tokenCliente,
  });

  @override
  State<PrincipalScreen> createState() => _PrincipalScreenState();
}

class _PrincipalScreenState extends State<PrincipalScreen> {
  static const Color vinho = Color(0xFF6F2438);
  static const Color creme = Color(0xFFF8F4EF);

  int paginaSelecionada = 0;

  // Controla a recriação da tela de pedidos.
  int chavePedidos = 0;

  @override
  void initState() {
    super.initState();

    if (widget.tokenCliente != null &&
        widget.tokenCliente!.isNotEmpty) {
      SessaoService.token = widget.tokenCliente;
    }
  }

  void selecionarPagina(int index) {
    setState(() {
      paginaSelecionada = index;

      // Recria a tela sempre que a aba de pedidos for selecionada.
      if (index == 1) {
        chavePedidos++;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String?>(
      valueListenable: SessaoService.tokenNotifier,
      builder: (context, tokenSessao, child) {
        final String? token = tokenSessao ?? widget.tokenCliente;

        final List<Widget> telas = [
          const CardapioScreen(),

          PedidosScreen(
            key: ValueKey(chavePedidos),
            token: token,
          ),

          CarrinhoScreen(
            token: token,
            onSelecionarPagina: selecionarPagina,
          ),

          PerfilScreen(
            token: token,
          ),
        ];

        return Scaffold(
          body: IndexedStack(
            index: paginaSelecionada,
            children: telas,
          ),
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: paginaSelecionada,
            onTap: selecionarPagina,
            type: BottomNavigationBarType.fixed,
            backgroundColor: creme,
            selectedItemColor: vinho,
            unselectedItemColor: Colors.grey,
            selectedFontSize: 12,
            unselectedFontSize: 12,
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.restaurant_menu),
                label: 'Cardápio',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.receipt_long),
                label: 'Pedidos',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.shopping_cart),
                label: 'Carrinho',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.person),
                label: 'Perfil',
              ),
            ],
          ),
        );
      },
    );
  }
}
