
import 'package:flutter/material.dart';

import '../models/item_cardapio.dart';

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: creme,
      appBar: AppBar(
        backgroundColor: vinho,
        foregroundColor: Colors.white,
        title: const Text('Detalhes do produto'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              height: 220,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(
                Icons.restaurant,
                size: 90,
                color: vinho,
              ),
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
              'R\$ ${produto.preco.toStringAsFixed(2).replaceAll('.', ',')}',
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: vinho,
              ),
            ),
          ],
        ),
      ),
    );
  }
}