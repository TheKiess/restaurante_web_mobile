/**
 * Desenvolvimento da pagina do cliente, pode ser acessada por /cliente
 * Template base: Next Shadcn Admin (reoring/next-shadcn-admin).
 * Utilizado template base do repositório acima
 * Utilizado IA para manter principalmente as consistências visuais e o padrão das interfaces
 * Realizadas modiificações necessárias para cada interface
 * Boa parte das interfaces foram reutilizadas em outras páginas para manter o padrão
 */
import Link                                    from "next/link";
import { ArrowRight, ClipboardList, Utensils } from "lucide-react";
import estilos                                 from "@/componentes/Painel/Painel.module.css";

const ARR_ATALHOS = [
  {
    href: "/cliente/cardapio",
    titulo: "Nosso cardápio",
    descricao: "Conheça nossos produtos, consulte os preços e monte seu carrinho.",
    acao: "Explorar cardápio",
    Icone: Utensils,
  },
  {
    href: "/cliente/pedidos",
    titulo: "Meus pedidos",
    descricao:
      "Consulte seus pedidos e acompanhe o andamento quando a integração estiver disponível.",
    acao: "Consultar pedidos",
    Icone: ClipboardList,
  },
];

export default function ClientePage()
{
  return (
    <div className={estilos.pagina}>
      <section className={estilos.destaque}>
        <p className="sobretitulo">Seja bem-vindo!</p>

        <h1 className={`${estilos.titulo} ${estilos.tituloGrande}`}>
          Seu próximo prato favorito está aqui.
        </h1>

        <p className={estilos.destaqueTexto}>
          Explore nosso cardápio, escolha seus favoritos e prepare seu pedido
          com praticidade.
        </p>

        <Link
          href="/cliente/cardapio"
          className={`${estilos.botao} ${estilos.botaoClaro} ${estilos.botaoComIcone}`}
        >
          Ver cardápio
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <section className={estilos.secaoPainel}>
        <div>
          <h2 className={estilos.tituloCartao}>O que você deseja fazer?</h2>
          <p className={estilos.subtituloCartao}>
            Acesse rapidamente as opções do restaurante.
          </p>
        </div>

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

      <section className={estilos.cartao}>
        <h2 className={estilos.tituloCartao}>Uma experiência feita para você</h2>

        <p className={`${estilos.subtituloCartao} ${estilos.espacoTopo}`}>
          Navegue pelo cardápio e escolha o que mais combina com você. Estamos
          preparando uma experiência simples para facilitar seus pedidos, seja
          no restaurante ou para entrega.
        </p>
      </section>
    </div>
  );
}
