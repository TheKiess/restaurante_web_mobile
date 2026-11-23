// Endereço do backend. Para trocar sem mexer no código:
// flutter run --dart-define=API_URL=http://192.168.0.10:3000
// Emulador Android: 10.0.2.2 | celular físico: IP do computador na rede.
class ApiConfig {
  static const String baseUrl = String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:3000');
}
