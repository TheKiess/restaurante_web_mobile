
import 'package:material_ui/material_ui.dart';

import '../models/item_carrinho.dart';
import '../services/carrinho_service.dart';
import '../services/pedido_service.dart';
import '../widgets/barra_superior.dart';

class FinalizacaoPedidoScreen extends StatefulWidget {
  final String token;
  final List<ItemCarrinho> itens;
  final num valorTotal;
  final void Function(int) onSelecionarPagina;

  const FinalizacaoPedidoScreen({
    super.key,
    required this.token,
    required this.itens,
    required this.valorTotal,
    required this.onSelecionarPagina,
  });

  @override
  State<FinalizacaoPedidoScreen> createState() =>
      _FinalizacaoPedidoScreenState();
}

class _FinalizacaoPedidoScreenState
    extends State<FinalizacaoPedidoScreen> {
  static const Color vinho = Color(0xFF6F2438);
  static const Color creme = Color(0xFFF8F4EF);

  final PedidoService pedidoService = PedidoService();
  final TextEditingController trocoController = TextEditingController();

  String formaPagamento = 'PIX';
  String tipoCartao = 'CREDITO';

  bool precisaTroco = false;
  bool enviandoPedido = false;

  // Guarda a comanda criada caso o registro do pagamento falhe.
  int? idComandaCriada;

  @override
  void dispose() {
    trocoController.dispose();
    super.dispose();
  }

  String formatarPreco(num valor) {
    return 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  num get valorTroco {
    final valor = num.tryParse(
          trocoController.text.replaceAll(',', '.'),
        ) ??
        0;

    return valor - widget.valorTotal;
  }

  Future<void> finalizarPedido() async {
    // Validação do pagamento em dinheiro.
    if (formaPagamento == 'DINHEIRO' && precisaTroco) {
      final valorInformado = num.tryParse(
        trocoController.text.replaceAll(',', '.'),
      );

      if (valorInformado == null ||
          valorInformado < widget.valorTotal) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Informe um valor igual ou superior ao total do pedido.',
            ),
          ),
        );
        return;
      }
    }

    setState(() {
      enviandoPedido = true;
    });

    try {
      // 1. Cria a comanda e registra os itens.
      // Se já existir uma comanda criada nesta tela,
      // reutiliza o mesmo ID para evitar duplicação.
      final int idComanda = idComandaCriada ??
          await pedidoService.finalizarPedido(
            token: widget.token,
            itens: widget.itens,
          );

      idComandaCriada ??= idComanda;

      // 2. Registra o pagamento no backend.
      await pedidoService.registrarPagamento(
        token: widget.token,
        idComanda: idComanda,
        valorTotal: widget.valorTotal.toDouble(),
        formaPagamento: formaPagamento,
      );

      // 3. Pagamento registrado com sucesso.
      idComandaCriada = null;

      if (!mounted) return;

      // Limpa o carrinho somente após o pagamento ser registrado.
      CarrinhoService.instance.limpar();

      setState(() {
        enviandoPedido = false;
      });

      // Monta a descrição da forma de pagamento.
      final String descricaoPagamento;

      if (formaPagamento == 'PIX') {
        descricaoPagamento =
            'Pix (pagamento simulado no aplicativo)';
      } else if (formaPagamento == 'CARTAO') {
        descricaoPagamento = tipoCartao == 'CREDITO'
            ? 'Cartão de crédito - pagamento na retirada'
            : 'Cartão de débito - pagamento na retirada';
      } else {
        descricaoPagamento = precisaTroco
            ? 'Dinheiro - troco de ${formatarPreco(valorTroco)}'
            : 'Dinheiro - sem necessidade de troco';
      }

      // 4. Exibe a confirmação.
      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) {
          return AlertDialog(
            icon: const Icon(
              Icons.check_circle_outline,
              color: Colors.green,
              size: 55,
            ),
            title: const Text('Pedido realizado!'),
            content: Text(
              'Seu pedido foi registrado com sucesso.\n\n'
              'Comanda: $idComanda\n\n'
              'Pagamento: $descricaoPagamento\n\n'
              'Acompanhe seu pedido pela aba Meus pedidos.',
              textAlign: TextAlign.center,
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: const Text(
                  'Entendi',
                  style: TextStyle(color: vinho),
                ),
              ),
            ],
          );
        },
      );

      if (!mounted) return;

      Navigator.pop(context);
      widget.onSelecionarPagina(1);
    } catch (erro) {
      if (!mounted) return;

      setState(() {
        enviandoPedido = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Não foi possível finalizar: $erro'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 5),
        ),
      );
    }
  }

  Widget opcaoPagamento({
    required String valor,
    required String titulo,
    required String descricao,
    required IconData icone,
  }) {
    final selecionado = formaPagamento == valor;

    return Card(
      color: selecionado ? const Color(0xFFF0E4E7) : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: selecionado ? vinho : Colors.grey.shade300,
          width: selecionado ? 2 : 1,
        ),
      ),
      child: RadioListTile<String>(
        value: valor,
        groupValue: formaPagamento,
        activeColor: vinho,
        onChanged: enviandoPedido
            ? null
            : (value) {
                if (value == null) return;

                setState(() {
                  formaPagamento = value;
                });
              },
        secondary: Icon(icone, color: vinho),
        title: Text(
          titulo,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(descricao),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: creme,
      appBar: const BarraSuperior(
        titulo: 'Finalizar pedido',
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Resumo do pedido',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: vinho,
            ),
          ),
          const SizedBox(height: 12),

          Card(
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                children: [
                  ...widget.itens.map((item) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        mainAxisAlignment:
                            MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              '${item.quantidade}x ${item.produto.nome}',
                            ),
                          ),
                          Text(formatarPreco(item.subtotal)),
                        ],
                      ),
                    );
                  }),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        formatarPreco(widget.valorTotal),
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: vinho,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),

          const Text(
            'Forma de pagamento',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: vinho,
            ),
          ),
          const SizedBox(height: 10),

          opcaoPagamento(
            valor: 'PIX',
            titulo: 'Pix',
            descricao: 'Pagamento simulado pelo aplicativo',
            icone: Icons.pix,
          ),

          opcaoPagamento(
            valor: 'CARTAO',
            titulo: 'Cartão',
            descricao: 'Pagamento realizado na retirada',
            icone: Icons.credit_card,
          ),

          if (formaPagamento == 'CARTAO') ...[
            const Padding(
              padding: EdgeInsets.only(left: 12, top: 8),
              child: Text(
                'Selecione o tipo de cartão:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            RadioListTile<String>(
              value: 'CREDITO',
              groupValue: tipoCartao,
              activeColor: vinho,
              title: const Text('Crédito'),
              onChanged: enviandoPedido
                  ? null
                  : (value) {
                      if (value == null) return;

                      setState(() {
                        tipoCartao = value;
                      });
                    },
            ),
            RadioListTile<String>(
              value: 'DEBITO',
              groupValue: tipoCartao,
              activeColor: vinho,
              title: const Text('Débito'),
              onChanged: enviandoPedido
                  ? null
                  : (value) {
                      if (value == null) return;

                      setState(() {
                        tipoCartao = value;
                      });
                    },
            ),
          ],

          opcaoPagamento(
            valor: 'DINHEIRO',
            titulo: 'Dinheiro',
            descricao: 'Pagamento realizado na retirada',
            icone: Icons.payments_outlined,
          ),

          if (formaPagamento == 'DINHEIRO') ...[
            const SizedBox(height: 12),
            const Text(
              'Precisa de troco?',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              activeThumbColor: vinho,
              title: const Text('Sim, preciso de troco'),
              value: precisaTroco,
              onChanged: enviandoPedido
                  ? null
                  : (value) {
                      setState(() {
                        precisaTroco = value;
                        trocoController.clear();
                      });
                    },
            ),
            if (precisaTroco) ...[
              TextField(
                controller: trocoController,
                enabled: !enviandoPedido,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                decoration: const InputDecoration(
                  labelText: 'Vou pagar com quanto?',
                  prefixText: 'R\$ ',
                  border: OutlineInputBorder(),
                  hintText: 'Ex.: 50,00',
                ),
                onChanged: (_) {
                  setState(() {});
                },
              ),
              const SizedBox(height: 10),
              if (valorTroco >= 0)
                Text(
                  'Troco: ${formatarPreco(valorTroco)}',
                  style: const TextStyle(
                    color: vinho,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
            ],
          ],

          const SizedBox(height: 24),

          SizedBox(
            height: 52,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: vinho,
                foregroundColor: Colors.white,
              ),
              onPressed: enviandoPedido ? null : finalizarPedido,
              child: enviandoPedido
                  ? const CircularProgressIndicator(
                      color: Colors.white,
                    )
                  : const Text(
                      'Confirmar pedido',
                      style: TextStyle(fontSize: 16),
                    ),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
