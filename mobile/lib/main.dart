
import 'package:material_ui/material_ui.dart';
import 'screens/principal_screen.dart';

void main() {
  runApp(const RestauranteApp());
}

class RestauranteApp extends StatelessWidget {
  const RestauranteApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Restaurante',
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF6F2438),
      ),
      home: const PrincipalScreen(),
    );
  }
}
