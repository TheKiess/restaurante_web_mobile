
import 'package:material_ui/material_ui.dart';

class BarraSuperior extends StatelessWidget
    implements PreferredSizeWidget {
  final String titulo;
  final List<Widget>? acoes;
  final Widget? leading;
  final bool automaticamenteImplyLeading;

  const BarraSuperior({
    super.key,
    required this.titulo,
    this.acoes,
    this.leading,
    this.automaticamenteImplyLeading = true,
  });

  static const Color vinho = Color(0xFF6F2438);
  static const Color bege = Color(0xFFF8F4EF);

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      toolbarHeight: 56,
      backgroundColor: vinho,
      foregroundColor: bege,
      elevation: 0,
      centerTitle: false,
      titleSpacing: 16,
      automaticallyImplyLeading: automaticamenteImplyLeading,
      leading: leading,
      title: Text(
        titulo,
        style: const TextStyle(
          color: bege,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      actions: acoes,
    );
  }
}
