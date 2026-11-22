
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

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  pedido.nomeItem,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: vinho,
                  ),
                ),
              ),
              const SizedBox(width: 8),
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

          const SizedBox(height: 10),

          Text('Quantidade: ${pedido.quantidade}'),

          const SizedBox(height: 4),

          Text(
            'Valor unitário: R\$ '
            '${pedido.valorUnitario.toStringAsFixed(2).replaceAll('.', ',')}',
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
            const SizedBox(height: 12),

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
                      : 'Cancelar produto',
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red),
                ),
              ),
            ),
          ],

          const Divider(height: 24),
        ],
      ),
    );
  }
}
