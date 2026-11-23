
import 'package:material_ui/material_ui.dart';

import '../models/item_cardapio.dart';
import '../services/carrinho_service.dart';
import '../widgets/barra_superior.dart';
import '../widgets/foto_produto.dart';

class DetalhesProdutoScreen extends StatelessWidget {
  final ItemCardapio produto;

  const DetalhesProdutoScreen({
    super.key,
    required this.produto,
  });

  static const Color vinho = Color(0xFF6F2438);
  static const Color creme = Color(0xFFF8F4EF);
  static const Color texto = Color(0xFF352A2C);
  static const Color textoSecundario = Color(0xFF786C6C);

  String get precoFormatado {
    return 'R\$ ${produto.preco.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  void adicionarAoCarrinho(BuildContext context) {
    CarrinhoService.instance.adicionar(produto);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${produto.nome} adicionado ao carrinho!'),
        backgroundColor: vinho,
        behavior: SnackBarBehavior.floating,
        action: SnackBarAction(
          label: 'OK',
          textColor: Colors.white,
          onPressed: () {},
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: creme,
      appBar: const BarraSuperior(
        titulo: 'Detalhes do produto',
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FotoProduto(
              imagem: produto.imagem,
              largura: double.infinity,
              altura: 220,
              raio: 16,
              tamanhoIcone: 90,
            ),

            const SizedBox(height: 24),

            Text(
              produto.nome,
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: texto,
              ),
            ),

            const SizedBox(height: 10),

            Text(
              produto.categoria,
              style: const TextStyle(
                fontSize: 15,
                color: vinho,
                fontWeight: FontWeight.w600,
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'Descrição',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: texto,
              ),
            ),

            const SizedBox(height: 8),

            Text(
              produto.descricao.isEmpty
                  ? 'Sem descrição disponível.'
                  : produto.descricao,
              style: const TextStyle(
                fontSize: 15,
                color: textoSecundario,
                height: 1.5,
              ),
            ),

            const SizedBox(height: 28),

            const Divider(),

            const SizedBox(height: 12),

            const Text(
              'Preço',
              style: TextStyle(
                fontSize: 16,
                color: textoSecundario,
              ),
            ),

            const SizedBox(height: 6),

            Text(
              precoFormatado,
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: vinho,
              ),
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),

      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(18),
          ),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 52,
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: produto.disponivel
                  ? () => adicionarAoCarrinho(context)
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: vinho,
                foregroundColor: Colors.white,
                disabledBackgroundColor: Colors.grey,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: const Icon(Icons.shopping_cart_outlined),
              label: Text(
                produto.disponivel
                    ? 'Adicionar ao carrinho'
                    : 'Produto indisponível',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
