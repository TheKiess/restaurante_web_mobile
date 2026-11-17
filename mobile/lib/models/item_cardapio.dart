
class ItemCardapio {
  final int id;
  final String nome;
  final String descricao;
  final double preco;
  final String categoria;
  final String tipo;
  final bool disponivel;

  ItemCardapio({
    required this.id,
    required this.nome,
    required this.descricao,
    required this.preco,
    required this.categoria,
    required this.tipo,
    required this.disponivel,
  });

  //CONVERTE JSON PARA DART
  factory ItemCardapio.fromJson(Map<String, dynamic> json) {
    return ItemCardapio(
      id: json['id_item_cardapio'],
      nome: json['nm_item'],
      descricao: json['ds_item'] ?? '',
      preco: double.parse(json['vl_unitario'].toString()),
      categoria: json['categoria']['nm_categoria'],
      tipo: json['tipo_item'],
      disponivel: json['disponivel'],
    );
  }
}