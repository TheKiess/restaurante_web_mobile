
import 'package:material_ui/material_ui.dart';

import '../models/item_pedido.dart';
import '../models/comanda.dart';
import '../services/pedido_service.dart';
import '../services/sessao_service.dart';
import '../widgets/pedido_card.dart';
import '../widgets/barra_superior.dart';

class PedidosScreen extends StatefulWidget {
  final String? token;

  const PedidosScreen({
    super.key,
    this.token,
  });

  @override
  State<PedidosScreen> createState() => _PedidosScreenState();
}

class _PedidosScreenState extends State<PedidosScreen> {
  static const Color vinho = Color(0xFF6F2438);
  static const Color creme = Color(0xFFF8F4EF);

  final PedidoService pedidoService = PedidoService();

  List<Comanda> comandas = [];
  bool carregando = false;
  String? erro;

  final Set<int> itensCancelando = {};

  int requisicaoAtual = 0;

  String? get tokenAtual {
    return SessaoService.token;
  }

  @override
  void initState() {
    super.initState();

    SessaoService.tokenNotifier.addListener(aoAlterarSessao);

    final token = tokenAtual;

    if (token != null && token.isNotEmpty) {
      carregarPedidos(token);
    }
  }

  @override
  void dispose() {
    SessaoService.tokenNotifier.removeListener(aoAlterarSessao);
    super.dispose();
  }

  void aoAlterarSessao() {
    final token = tokenAtual;

    if (token == null || token.isEmpty) {
      requisicaoAtual++;

      setState(() {
        comandas = [];
        erro = null;
        carregando = false;
        itensCancelando.clear();
      });

      return;
    }

    carregarPedidos(token);
  }

  @override
  void didUpdateWidget(covariant PedidosScreen oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.token != oldWidget.token &&
        SessaoService.token == null) {
      final token = widget.token;

      if (token != null && token.isNotEmpty) {
        carregarPedidos(token);
      }
    }
  }

  Future<void> carregarPedidos(String token) async {
    final numeroRequisicao = ++requisicaoAtual;

    setState(() {
      carregando = true;
      erro = null;
    });

    try {
      final resultado = await pedidoService.listarMinhasComandas(
        token: token,
      );

      if (!mounted || numeroRequisicao != requisicaoAtual) return;

      setState(() {
        comandas = resultado;
      });
    } catch (e) {
      if (!mounted || numeroRequisicao != requisicaoAtual) return;

      setState(() {
        erro = e.toString();
      });
    } finally {
      if (mounted && numeroRequisicao == requisicaoAtual) {
        setState(() {
          carregando = false;
        });
      }
    }
  }

  Future<void> atualizarPedidos() async {
    final token = tokenAtual;

    if (token == null || token.isEmpty) return;

    await carregarPedidos(token);
  }

  Future<void> cancelarPedido(ItemPedido pedido) async {
    final token = tokenAtual;

    if (token == null || token.isEmpty) return;

    if (pedido.situacao != 'AGUARDANDO') return;

    final confirmar = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancelar pedido?'),
        content: Text(
          'Deseja realmente cancelar o produto '
          '${pedido.nomeItem}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Voltar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Confirmar cancelamento'),
          ),
        ],
      ),
    );

    if (confirmar != true || !mounted) return;

    setState(() {
      itensCancelando.add(pedido.idItemPedido);
    });

    try {
      await pedidoService.cancelarPedido(
        token: token,
        idItemPedido: pedido.idItemPedido,
        idComanda: pedido.idComanda,
      );

      if (!mounted) return;

      await atualizarPedidos();

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pedido cancelado com sucesso!'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            e.toString().replaceFirst('Exception: ', ''),
          ),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          itensCancelando.remove(pedido.idItemPedido);
        });
      }
    }
  }

  Widget construirComanda(Comanda comanda) {
    return Card(
      margin: const EdgeInsets.only(bottom: 18),
      color: Colors.white,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.receipt_long,
                  color: vinho,
                  size: 25,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Comanda #${comanda.idComanda}',
                    style: const TextStyle(
                      color: vinho,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            ...comanda.itens.map((pedido) {
              return PedidoCard(
                pedido: pedido,
                cancelando: itensCancelando.contains(
                  pedido.idItemPedido,
                ),
                onCancelar: () => cancelarPedido(pedido),
              );
            }),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total da comanda',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: vinho,
                  ),
                ),
                Text(
                  'R\$ ${comanda.valorTotal.toStringAsFixed(2).replaceAll('.', ',')}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: vinho,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final token = tokenAtual;
    final possuiToken = token != null && token.isNotEmpty;

    return Scaffold(
      backgroundColor: creme,
      appBar: BarraSuperior(
        titulo: 'Meus pedidos',
        automaticamenteImplyLeading: false,
        acoes: [
          if (possuiToken)
            IconButton(
              onPressed: carregando ? null : atualizarPedidos,
              icon: const Icon(Icons.refresh),
              tooltip: 'Atualizar pedidos',
            ),
        ],
      ),
      body: !possuiToken
          ? const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.lock_outline,
                      size: 70,
                      color: vinho,
                    ),
                    SizedBox(height: 16),
                    Text(
                      'Entre na sua conta',
                      style: TextStyle(
                        fontSize: 19,
                        fontWeight: FontWeight.bold,
                        color: vinho,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Faça login para acompanhar seus pedidos.',
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            )
          : carregando
              ? const Center(
                  child: CircularProgressIndicator(
                    color: vinho,
                  ),
                )
              : erro != null
                  ? Center(
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
                              'Não foi possível carregar os pedidos.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 16),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              erro!,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: atualizarPedidos,
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
                    )
                  : comandas.isEmpty
                      ? const Center(
                          child: Padding(
                            padding: EdgeInsets.all(24),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.receipt_long_outlined,
                                  size: 75,
                                  color: vinho,
                                ),
                                SizedBox(height: 16),
                                Text(
                                  'Você ainda não possui pedidos.',
                                  style: TextStyle(
                                    fontSize: 17,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                SizedBox(height: 8),
                                Text(
                                  'Seus pedidos aparecerão aqui '
                                  'para você acompanhar o andamento.',
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        )
                      : RefreshIndicator(
                          color: vinho,
                          onRefresh: atualizarPedidos,
                          child: ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: comandas.length,
                            itemBuilder: (context, index) {
                              final comanda = comandas[index];

                              return construirComanda(comanda);
                            },
                          ),
                        ),
    );
  }
}
