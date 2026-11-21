
import 'package:material_ui/material_ui.dart';

import '../models/item_pedido.dart';

class PedidoCard extends StatelessWidget {
  final ItemPedido pedido;
  final VoidCallback? onCancelar;
  final bool cancelando;

  const PedidoCard({
    super.key,
    required this.pedido,
    this.onCancelar,
    this.cancelando = false,
  });

  static const Color vinho = Color(0xFF6F2438);

  Color corSituacao(String situacao) {
    switch (situacao) {
      case 'AGUARDANDO':
        return Colors.orange;
      case 'EM_PREPARO':
        return Colors.blue;
      case 'PRONTO':
        return Colors.green;
      case 'ENTREGUE':
        return Colors.grey;
      case 'CANCELADO':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String textoSituacao(String situacao) {
    switch (situacao) {
      case 'AGUARDANDO':
        return 'Aguardando';
      case 'EM_PREPARO':
        return 'Em preparo';
      case 'PRONTO':
        return 'Pronto';
      case 'ENTREGUE':
        return 'Entregue';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return situacao;
    }
  }

  @override
  Widget build(BuildContext context) {
    final podeCancelar = pedido.situacao == 'AGUARDANDO';

    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Pedido #${pedido.idItemPedido}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: vinho,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: corSituacao(pedido.situacao)
                        .withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    textoSituacao(pedido.situacao),
                    style: TextStyle(
                      color: corSituacao(pedido.situacao),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            Text(
              pedido.nomeItem,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),

            const SizedBox(height: 6),

            Text('Quantidade: ${pedido.quantidade}'),

            Text(
              'Valor unitário: R\$ '
              '${pedido.valorUnitario.toStringAsFixed(2)}',
            ),

            if (pedido.observacao != null &&
                pedido.observacao!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text('Observação: ${pedido.observacao}'),
            ],

            const SizedBox(height: 8),

            Text(
              'Data: '
              '${pedido.dataPedido.day.toString().padLeft(2, '0')}/'
              '${pedido.dataPedido.month.toString().padLeft(2, '0')}/'
              '${pedido.dataPedido.year}',
              style: const TextStyle(
                color: Color(0xFF786C6C),
                fontSize: 12,
              ),
            ),

            if (podeCancelar) ...[
              const SizedBox(height: 14),

              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: cancelando ? null : onCancelar,
                  icon: cancelando
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                          ),
                        )
                      : const Icon(Icons.cancel_outlined),
                  label: Text(
                    cancelando
                        ? 'Cancelando...'
                        : 'Cancelar pedido',
                  ),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
