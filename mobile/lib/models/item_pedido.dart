
class ItemPedido {
  final int idItemPedido;
  final int idComanda;
  final String nomeItem;
  final int quantidade;
  final num valorUnitario;
  final String situacao;
  final String? observacao;
  final DateTime dataPedido;

  ItemPedido({
    required this.idItemPedido,
    required this.idComanda,
    required this.nomeItem,
    required this.quantidade,
    required this.valorUnitario,
    required this.situacao,
    this.observacao,
    required this.dataPedido,
  });

  factory ItemPedido.fromJson(Map<String, dynamic> json) {
    return ItemPedido(
      idItemPedido: json['id_item_pedido'],
      idComanda: json['id_comanda'],
      nomeItem: json['item_cardapio']['nm_item'],
      quantidade: json['qt_quantidade'],
      valorUnitario: num.parse(json['vl_unitario'].toString()),
      situacao: json['id_situacao'],
      observacao: json['ds_observacao'],
      dataPedido: DateTime.parse(json['dt_pedido']),
    );
  }
}
