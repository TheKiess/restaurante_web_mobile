
import 'package:material_ui/material_ui.dart';

import '../models/resultado_login.dart';
import '../models/item_carrinho.dart';
import '../services/carrinho_service.dart';
import '../services/sessao_service.dart';
import '../widgets/barra_superior.dart';
import 'login_screen.dart';
import 'finalizacao_pedido_screen.dart';

class CarrinhoScreen extends StatefulWidget {
  final String? token;
  final void Function(int) onSelecionarPagina;

  const CarrinhoScreen({
    super.key,
    this.token,
    required this.onSelecionarPagina,
  });

  @override
  State<CarrinhoScreen> createState() => _CarrinhoScreenState();
}

class _CarrinhoScreenState extends State<CarrinhoScreen> {
  static const Color vinho = Color(0xFF6F2438);
  static const Color creme = Color(0xFFF8F4EF);

  bool enviandoPedido = false;
  String? tokenAtual;

  @override
  void initState() {
    super.initState();
    tokenAtual = SessaoService.token ?? widget.token;
  }

  @override
  void didUpdateWidget(covariant CarrinhoScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    tokenAtual = SessaoService.token ?? widget.token;
  }

  String formatarPreco(num valor) {
    return 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  Future<void> finalizarPedido() async {
    final carrinho = CarrinhoService.instance;

    if (carrinho.itens.isEmpty || enviandoPedido) {
      return;
    }

    tokenAtual = SessaoService.token ?? widget.token;

    if (tokenAtual == null || tokenAtual!.isEmpty) {
      final resultado = await Navigator.push<ResultadoLogin>(
        context,
        MaterialPageRoute(
          builder: (context) => const LoginScreen(),
        ),
      );

      if (!mounted || resultado == null) return;

      setState(() {
        tokenAtual = resultado.token;
      });
    }

    final itensPedido = List<ItemCarrinho>.from(carrinho.itens);
    final valorTotal = carrinho.valorTotal;

    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => FinalizacaoPedidoScreen(
          token: tokenAtual!,
          itens: itensPedido,
          valorTotal: valorTotal,
          onSelecionarPagina: widget.onSelecionarPagina,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final carrinho = CarrinhoService.instance;

    return Scaffold(
      backgroundColor: creme,
      appBar: const BarraSuperior(
        titulo: 'Meu carrinho',
        automaticamenteImplyLeading: false,
      ),
      body: AnimatedBuilder(
        animation: carrinho,
        builder: (context, child) {
          if (carrinho.itens.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.shopping_cart_outlined,
                    size: 80,
                    color: vinho,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Seu carrinho está vazio',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Adicione produtos do nosso cardápio!',
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: vinho,
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () {
                      widget.onSelecionarPagina(0);
                    },
                    child: const Text('Ver cardápio'),
                  ),
                ],
              ),
            );
          }

          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: carrinho.itens.length,
                  itemBuilder: (context, index) {
                    final item = carrinho.itens[index];

                    return _ItemCarrinhoCard(
                      item: item,
                      formatarPreco: formatarPreco,
                      incrementar: () => carrinho.incrementar(item),
                      decrementar: () => carrinho.decrementar(item),
                      remover: () => carrinho.remover(item),
                    );
                  },
                ),
              ),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(
                    top: Radius.circular(20),
                  ),
                ),
                child: SafeArea(
                  top: false,
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Quantidade de itens'),
                          Text('${carrinho.quantidadeTotal}'),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Total',
                            style: TextStyle(
                              fontSize: 19,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            formatarPreco(carrinho.valorTotal),
                            style: const TextStyle(
                              fontSize: 21,
                              fontWeight: FontWeight.bold,
                              color: vinho,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: vinho,
                            foregroundColor: Colors.white,
                          ),
                          onPressed: enviandoPedido
                              ? null
                              : finalizarPedido,
                          child: const Text(
                            'Continuar pedido',
                            style: TextStyle(fontSize: 16),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ItemCarrinhoCard extends StatelessWidget {
  final ItemCarrinho item;
  final String Function(num) formatarPreco;
  final VoidCallback incrementar;
  final VoidCallback decrementar;
  final VoidCallback remover;

  const _ItemCarrinhoCard({
    required this.item,
    required this.formatarPreco,
    required this.incrementar,
    required this.decrementar,
    required this.remover,
  });

  static const Color vinho = Color(0xFF6F2438);

  @override
  Widget build(BuildContext context) {
    final produto = item.produto;

    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 14),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: _imagemPadrao(),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    produto.nome,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    formatarPreco(produto.preco),
                    style: const TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      _botaoQuantidade(
                        icone: Icons.remove,
                        acao: decrementar,
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          '${item.quantidade}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      _botaoQuantidade(
                        icone: Icons.add,
                        acao: incrementar,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                IconButton(
                  onPressed: remover,
                  icon: const Icon(
                    Icons.delete_outline,
                    color: Colors.red,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  formatarPreco(item.subtotal),
                  style: const TextStyle(
                    color: vinho,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _imagemPadrao() {
    return Container(
      width: 85,
      height: 85,
      color: const Color(0xFFF0E9E3),
      child: const Icon(
        Icons.fastfood,
        size: 35,
        color: vinho,
      ),
    );
  }

  Widget _botaoQuantidade({
    required IconData icone,
    required VoidCallback acao,
  }) {
    return InkWell(
      onTap: acao,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          border: Border.all(color: vinho),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          icone,
          size: 17,
          color: vinho,
        ),
      ),
    );
  }
}
