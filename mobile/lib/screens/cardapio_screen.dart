
import 'package:flutter/material.dart';

import '../models/item_cardapio.dart';
import '../services/cardapio_service.dart';
import '../widgets/produto_card.dart';
import 'detalhes_produto_screen.dart';

class CardapioScreen extends StatefulWidget {
  const CardapioScreen({super.key});

  @override
  State<CardapioScreen> createState() => _CardapioScreenState();
}

class _CardapioScreenState extends State<CardapioScreen> {
  static const Color vinho = Color(0xFF6F2438);
  static const Color creme = Color(0xFFF8F4EF);
  static const Color texto = Color(0xFF352A2C);
  static const Color textoSecundario = Color(0xFF786C6C);

  final CardapioService cardapioService = CardapioService();

  final TextEditingController pesquisaController =
      TextEditingController();

  late Future<List<ItemCardapio>> produtos;

  String pesquisa = '';

  @override
  void initState() {
    super.initState();
    produtos = cardapioService.listarItens();
  }

  @override
  void dispose() {
    pesquisaController.dispose();
    super.dispose();
  }

  void carregarProdutosNovamente() {
    setState(() {
      produtos = cardapioService.listarItens();
    });
  }

  void abrirDetalhesProduto(ItemCardapio produto) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DetalhesProdutoScreen(
          produto: produto,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: creme,
      body: SafeArea(
        child: Column(
          children: [
            // Cabeçalho
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 24),
              decoration: const BoxDecoration(
                color: vinho,
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(24),
                  bottomRight: Radius.circular(24),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Nosso Restaurante',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Olá! Escolha o que deseja hoje.',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 15,
                    ),
                  ),
                ],
              ),
            ),

            // Campo de pesquisa
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
              child: TextField(
                controller: pesquisaController,
                onChanged: (valor) {
                  setState(() {
                    pesquisa = valor.toLowerCase();
                  });
                },
                decoration: InputDecoration(
                  hintText: 'Pesquisar produto...',
                  prefixIcon: const Icon(
                    Icons.search,
                    color: vinho,
                  ),
                  suffixIcon: pesquisa.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () {
                            pesquisaController.clear();

                            setState(() {
                              pesquisa = '';
                            });
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(
                    vertical: 14,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),

            // Título da seção
            const Padding(
              padding: EdgeInsets.fromLTRB(20, 12, 20, 14),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Nosso cardápio',
                  style: TextStyle(
                    fontSize: 21,
                    fontWeight: FontWeight.bold,
                    color: texto,
                  ),
                ),
              ),
            ),

            // Lista de produtos
            Expanded(
              child: FutureBuilder<List<ItemCardapio>>(
                future: produtos,
                builder: (context, snapshot) {
                  // Carregando
                  if (snapshot.connectionState ==
                      ConnectionState.waiting) {
                    return const Center(
                      child: CircularProgressIndicator(
                        color: vinho,
                      ),
                    );
                  }

                  // Erro
                  if (snapshot.hasError) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.error_outline,
                              size: 55,
                              color: vinho,
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'Não foi possível carregar o cardápio.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 16,
                                color: texto,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '${snapshot.error}',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 12,
                                color: textoSecundario,
                              ),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: carregarProdutosNovamente,
                              icon: const Icon(Icons.refresh),
                              label: const Text('Tentar novamente'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: vinho,
                                foregroundColor: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  // Lista vazia
                  if (!snapshot.hasData ||
                      snapshot.data!.isEmpty) {
                    return const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.restaurant_menu,
                            size: 60,
                            color: textoSecundario,
                          ),
                          SizedBox(height: 16),
                          Text(
                            'Nenhum produto cadastrado.',
                            style: TextStyle(
                              fontSize: 16,
                              color: textoSecundario,
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  // Filtragem dos produtos
                  final listaProdutos = snapshot.data!
                      .where((produto) {
                    final nome = produto.nome.toLowerCase();
                    final descricao =
                        produto.descricao.toLowerCase();

                    return produto.disponivel &&
                        (nome.contains(pesquisa) ||
                            descricao.contains(pesquisa));
                  }).toList();

                  // Nenhum resultado na pesquisa
                  if (listaProdutos.isEmpty) {
                    return const Center(
                      child: Text(
                        'Nenhum produto encontrado.',
                        style: TextStyle(
                          fontSize: 16,
                          color: textoSecundario,
                        ),
                      ),
                    );
                  }

                  // Exibição dos produtos
                  return ListView.builder(
                    padding: const EdgeInsets.fromLTRB(
                      20,
                      4,
                      20,
                      20,
                    ),
                    itemCount: listaProdutos.length,
                    itemBuilder: (context, index) {
                      final produto = listaProdutos[index];

                      return ProdutoCard(
                        produto: produto,
                        onTap: () {
                          abrirDetalhesProduto(produto);
                        },
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
