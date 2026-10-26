import Link                                                            from "next/link";
import { ArrowRight, ClipboardList, Utensils, PackageCheck, Banknote } from "lucide-react";
import estilos                                                         from "@/componentes/Painel/Painel.module.css";

const ARR_ATALHOS = [
  {
    href: "/garcom/pedidos",
    titulo: "Pedidos",
    descricao: "Cadastre um novo pedido e consulte os já existentes aqui.",
    acao: "Cadastro de Pedidos",
    Icone: Utensils,
  },
  {
    href: "/garcom/entregas",
    titulo: "Entregas",
    descricao: "Confira os itens já prontos para entrega ou entregues.",
    acao: "Consultar entregas",
    Icone: PackageCheck,
  },
  {
    href: "/garcom/pagamentos",
    titulo: "Pagamentos",
    descricao: "Confira e finalize as comandas aqui.",
    acao: "Realizar pagamento",
    Icone: Banknote,
  },
  {
    href: "/garcom/comandas",
    titulo: "Comandas",
    descricao: "Confira as comandas em aberto e já finalizadas aqui.",
    acao: "Consultar comandas",
    Icone: ClipboardList,
  },
];

export default function GarcomPage()
{
  return (
    <div className={estilos.pagina}>
      <section className={estilos.destaque}>
        <p className="sobretitulo">Painel operacional</p>
        <h1 className={estilos.titulo}>Garçom</h1>
        <p className={estilos.descricao}>
          Registre pedidos, acompanhe comandas, finalize pagamentos.
        </p>
      </section>

      <section className={estilos.secaoPainel}>
        <h2 className={estilos.tituloCartao}>O que você deseja fazer?</h2>

        <div className={estilos.gradeAtalhos}>
          {ARR_ATALHOS.map(({ href, titulo, descricao, acao, Icone }) => (
            <Link key={href} href={href} className={estilos.atalho}>
              <div className={estilos.atalhoTopo}>
                <span className={estilos.icone}>
                  <Icone size={22} aria-hidden="true" />
                </span>
                <ArrowRight size={20} className={estilos.atalhoSeta} aria-hidden="true" />
              </div>

              <h3 className={estilos.atalhoTitulo}>{titulo}</h3>
              <p className={estilos.atalhoTexto}>{descricao}</p>
              <span className={estilos.atalhoAcao}>{acao} →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
