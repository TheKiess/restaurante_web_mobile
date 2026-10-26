import Link                                                         from "next/link";
import { ClipboardList, Clock, ArrowRight, ShoppingBag, ArrowLeft } from "lucide-react";
import estilos                                                      from "@/componentes/Painel/Painel.module.css";
import estilosPagina                                                from "./page.module.css";

export default function PedidosClientePage()
{
  return (
    <div className={estilos.pagina}>
      <section className={estilos.destaque}>
        <div className={estilosPagina.titulosHero}>
          <ClipboardList size={32} aria-hidden="true" />

          <div>
            <p className="sobretitulo">Área do cliente</p>
            <h1 className={estilos.titulo}>Meus pedidos</h1>
          </div>
        </div>
      </section>

      <div>
        <Link
          href="/cliente"
          className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno} ${estilos.botaoComIcone}`}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar para o início
        </Link>
      </div>

      <div className={estilos.cabecalhoComAcao}>
        <div>
          <h2 className={estilos.tituloCartao}>Histórico de pedidos</h2>
          <p className={estilos.subtituloCartao}>
            Seus pedidos aparecerão nesta área.
          </p>
        </div>

        <Link
          href="/cliente/cardapio"
          className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.botaoComIcone}`}
        >
          <ShoppingBag size={16} aria-hidden="true" />
          Fazer pedido
        </Link>
      </div>

      <section className={`${estilos.cartao} ${estilos.vazio}`}>
        <div className={estilosPagina.iconeGrande}>
          <ClipboardList size={32} aria-hidden="true" />
        </div>

        <h3 className={estilos.vazioTitulo}>Nenhum pedido por enquanto</h3>

        <Link
          href="/cliente/cardapio"
          className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.botaoComIcone} ${estilos.espacoTopo}`}
        >
          Explorar cardápio
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <div className={estilos.gradeCartoes}>
        <div className={estilosPagina.cartaoInfo}>
          <span className={estilos.icone}>
            <Clock size={20} aria-hidden="true" />
          </span>

          <div>
            <h3 className={estilos.tituloItem}>Acompanhe o andamento</h3>
            <p className={estilos.subtituloCartao}>
              Acompanhe o status de seus pedidos.
            </p>
          </div>
        </div>

        <div className={estilosPagina.cartaoInfo}>
          <span className={estilos.icone}>
            <ShoppingBag size={20} aria-hidden="true" />
          </span>

          <div>
            <h3 className={estilos.tituloItem}>Faça seu próximo pedido</h3>
            <p className={estilos.subtituloCartao}>
              Explore as opções do cardápio e escolha seus produtos favoritos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
