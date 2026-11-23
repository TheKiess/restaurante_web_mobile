import 'package:material_ui/material_ui.dart';
import '../config/api_config.dart';

// Mostra a foto do item vinda do backend ou um ícone padrão quando não há foto.
class FotoProduto extends StatelessWidget
{
  final String? imagem;
  final double? largura;
  final double altura;
  final double raio;
  final double tamanhoIcone;

  const FotoProduto({
    super.key,
    required this.imagem,
    required this.altura,
    this.largura,
    this.raio = 12,
    this.tamanhoIcone = 38
  });

  static const Color vinho = Color(0xFF6F2438);
  static const Color creme = Color(0xFFF8F4EF);

  Widget iconePadrao()
  {
    return Container(
      color: creme,
      alignment: Alignment.center,
      child: Icon(
        Icons.restaurant,
        size: tamanhoIcone,
        color: vinho
      )
    );
  }

  @override
  Widget build(BuildContext context)
  {
    final caminho = imagem;

    return ClipRRect(
      borderRadius: BorderRadius.circular(raio),
      child: SizedBox(
        width: largura,
        height: altura,
        child: caminho == null || caminho.isEmpty
          ? iconePadrao()
          : Image.network(
            '${ApiConfig.baseUrl}$caminho',
            fit: BoxFit.cover,
            errorBuilder: (context, erro, pilha) => iconePadrao(),
          )
      )
    );
  }
}
