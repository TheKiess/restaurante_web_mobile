export const NM_RESTAURANTE = "Comanda e Pedidos";
export const DS_RESTAURANTE = "Conheça nosso restaurante, veja o cardápio e reserve sua mesa.";
export const DS_CHAMADA     = "Sabor de verdade, servido com carinho.";

export const DS_ENDERECO = "Rua Exemplo, 000, Centro";
export const DS_TELEFONE = "(00) 0000-0000";
export const DS_EMAIL    = "contato@exemplo.com.br";

export const ARR_HORARIOS = [
  { nmDias: "Terça a quinta", dsHorario: "18h às 23h" },
  { nmDias: "Sexta e sábado", dsHorario: "12h às 00h" },
  { nmDias: "Domingo",        dsHorario: "12h às 17h" }
];

export const ARR_LINKS_NAVEGACAO = [
  { nmRotulo: "Início",   dsCaminho: "/" },
  { nmRotulo: "Sobre",    dsCaminho: "/#sobre" },
  { nmRotulo: "Cardápio", dsCaminho: "/#cardapio" },
  { nmRotulo: "Horários", dsCaminho: "/#horarios" },
  { nmRotulo: "Contato",  dsCaminho: "/#contato" }
];

export const ARR_CATEGORIAS_CARDAPIO = [
  { nmCategoria: "Entradas",          dsCategoria: "Porções e petiscos para começar a refeição com calma." },
  { nmCategoria: "Pratos principais", dsCategoria: "Pratos preparados na hora, com opções para todos os gostos." },
  { nmCategoria: "Sobremesas",        dsCategoria: "Doces para fechar a refeição com um toque especial." },
  { nmCategoria: "Bebidas",           dsCategoria: "Sucos, refrigerantes, cervejas e vinhos para acompanhar." }
];

export const ARR_DIFERENCIAIS = [
  { nmTitulo: "Ingredientes frescos",  dsTexto: "Pratos feitos na hora, com ingredientes selecionados." },
  { nmTitulo: "Ambiente acolhedor",    dsTexto: "Um espaço confortável para reunir família e amigos." },
  { nmTitulo: "Atendimento atencioso", dsTexto: "Uma equipe pronta para cuidar de cada detalhe do seu pedido." }
];

export const ARR_LINKS_GERENTE = [
  { nmRotulo: "Início",       dsCaminho: "/gerente" },
  { nmRotulo: "Pedidos",      dsCaminho: "/gerente/pedidos" },
  { nmRotulo: "Salão",        dsCaminho: "/gerente/salao" },
  { nmRotulo: "Mesas",        dsCaminho: "/gerente/mesas" },
  { nmRotulo: "Reservas",     dsCaminho: "/gerente/reservas" },
  { nmRotulo: "Cardápio",     dsCaminho: "/gerente/cardapio" },
  { nmRotulo: "Categorias",   dsCaminho: "/gerente/categorias" },
  { nmRotulo: "Estoque",      dsCaminho: "/gerente/insumos" },
  { nmRotulo: "Receitas",     dsCaminho: "/gerente/receitas" },
  { nmRotulo: "Funcionários", dsCaminho: "/gerente/funcionarios" },
  { nmRotulo: "Relatórios",   dsCaminho: "/gerente/relatorios" }
];

export const ARR_LINKS_GARCOM = [
  { nmRotulo: "Início",     dsCaminho: "/garcom" },
  { nmRotulo: "Pedidos",    dsCaminho: "/garcom/pedidos" },
  { nmRotulo: "Salão",      dsCaminho: "/garcom/salao" },
  { nmRotulo: "Entregas",   dsCaminho: "/garcom/entregas" },
  { nmRotulo: "Comandas",   dsCaminho: "/garcom/comandas" },
  { nmRotulo: "Pagamentos", dsCaminho: "/garcom/pagamentos" }
];

export const ARR_LINKS_COZINHA = [
  { nmRotulo: "Fila de preparo", dsCaminho: "/cozinha" }
];

export const ARR_LINKS_CLIENTE = [
  { nmRotulo: "Início",       dsCaminho: "/cliente" },
  { nmRotulo: "Cardápio",     dsCaminho: "/cliente/cardapio" },
  { nmRotulo: "Meus pedidos", dsCaminho: "/cliente/pedidos" }
];

export type Perfil = "GERENCIA" | "GARCOM" | "COZINHA" | "CLIENTE";

export const NM_COOKIE_SESSAO = "restaurante_token";

export const OBJ_ROTA_POR_PERFIL: Record<Perfil, string> = {
  GERENCIA: "/gerente",
  GARCOM: "/garcom",
  COZINHA: "/cozinha",
  CLIENTE: "/cliente",
};

export const OBJ_PERFIS_POR_AREA: Record<string, Perfil[]> = {
  "/gerente": ["GERENCIA"],
  "/garcom": ["GARCOM"],
  "/cozinha": ["COZINHA"],
  "/cliente": ["CLIENTE"],
};

export const OBJ_NOMES_SITUACAO_ITEM: Record<string, string> = {
  AGUARDANDO: "Aguardando",
  EM_PREPARO: "Em preparo",
  PRONTO: "Pronto",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado"
};

export const OBJ_NOMES_SITUACAO_PAGAMENTO: Record<string, string> = {
  PENDENTE: "Pendente",
  CONFIRMADO: "Confirmado",
  RECUSADO: "Recusado"
};

export const OBJ_NOMES_FORMA_PAGAMENTO: Record<string, string> = {
  DINHEIRO: "Dinheiro",
  CARTAO: "Cartão",
  PIX: "Pix"
};

export const OBJ_ROTULOS_UNIDADE: Record<string, string> = {
  UN: "un",
  KG: "kg",
  G: "g",
  L: "L",
  ML: "mL"
};

export const OBJ_NOMES_TIPO_MOVIMENTO: Record<string, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  PERDA: "Perda"
};

export const OBJ_NOMES_SITUACAO_RESERVA: Record<string, string> = {
  CONFIRMADA: "Confirmada",
  CHECKIN: "Check-in feito",
  CANCELADA: "Cancelada",
  EXPIRADA: "Expirada"
};

export const OBJ_NOMES_TIPO_ITEM: Record<string, string> = {
  PREPARADO: "Preparado",
  REVENDA: "Revenda"
};

export const OBJ_NOMES_PERFIL: Record<string, string> = {
  GERENCIA: "Gerência",
  GARCOM: "Garçom",
  COZINHA: "Cozinha",
  CLIENTE: "Cliente"
};
