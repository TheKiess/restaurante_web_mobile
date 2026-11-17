
import 'package:flutter/material.dart';
import '../models/item_cardapio.dart';

class ProdutoCard extends StatelessWidget {
  final ItemCardapio produto;
  final VoidCallback onTap;

  const ProdutoCard({
    super.key,
    required this.produto,
    required this.onTap,
  });

  static const Color vinho = Color(0xFF6F2438);
  static const Color creme = Color(0xFFF8F4EF);
  static const Color texto = Color(0xFF352A2C);
  static const Color textoSecundario = Color(0xFF786C6C);

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  color: creme,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.restaurant,
                  size: 38,
                  color: vinho,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      produto.nome,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: texto,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      produto.descricao.isEmpty
                          ? 'Sem descrição disponível.'
                          : produto.descricao,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 13,
                        color: textoSecundario,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      produto.categoria,
                      style: const TextStyle(
                        fontSize: 12,
                        color: vinho,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'R\$ ${produto.preco.toStringAsFixed(2).replaceAll('.', ',')}',
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: vinho,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: textoSecundario,
              ),
            ],
          ),
        ),
      ),
    );
  }
}