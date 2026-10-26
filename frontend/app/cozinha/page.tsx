/**
 * Desenvolvimento da pagina da cozinha, pode ser acessada por /cozinha
 * Template base: Next Shadcn Admin (reoring/next-shadcn-admin).
 * Utilizado template base do repositório acima
 * Utilizado IA para manter principalmente as consistências visuais e o padrão das interfaces
 * Realizadas modiificações necessárias para cada interface
 * Boa parte das interfaces foram reutilizadas em outras páginas para manter o padrão
 */
"use client";

import { useCallback, useEffect, useState }                  from "react";
import { apiGet, apiPatch }                                  from "@/lib/api";
import estilos                                               from "@/componentes/Painel/Painel.module.css";
import { ChefHat, Clock, RefreshCw, CheckCircle2, Utensils } from "lucide-react";

type SituacaoItem =
  | "AGUARDANDO"
  | "EM_PREPARO"
  | "PRONTO"
  | "ENTREGUE"
  | "CANCELADO";

interface ItemPedido {
  id_item_pedido: number;
  id_situacao: SituacaoItem;
  qt_quantidade: number;
  ds_observacao: string | null;
  dt_pedido: string;
  item_cardapio: {
    nm_item: string;
  };
  comanda: {
    id_comanda: number;
    mesa: {
      nr_mesa: number;
    } | null;
  };
}

function formatarHorario(data: string)
{
  const dataPedido = new Date(data);

  if (Number.isNaN(dataPedido.getTime()))
    return "Horário indisponível";

  return dataPedido.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CozinhaPage()
{
  const [pedidos, setPedidos]                     = useState<ItemPedido[]>([]);
  const [carregando, setCarregando]               = useState(true);
  const [atualizando, setAtualizando]             = useState(false);
  const [itemEmAtualizacao, setItemEmAtualizacao] = useState<number | null>(null);
  const [erro, setErro]                           = useState("");
  const carregarPedidos                           = useCallback(async () => {
    try
    {
      setErro("");
      setAtualizando(true);

      const dados = await apiGet<ItemPedido[]>("itens-pedido/fila");

      setPedidos(dados);
    }
    catch (error)
    {
      setErro(error instanceof Error
        ? error.message
        : "Não foi possível carregar a fila da cozinha."
      );
    }
    finally
    {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    void carregarPedidos();
  }, [carregarPedidos]);

  async function alterarSituacao(
    item: ItemPedido,
    novaSituacao: SituacaoItem
  )
  {
    try
    {
      setErro("");
      setItemEmAtualizacao(item.id_item_pedido);

      await apiPatch<ItemPedido>(
        `itens-pedido/${item.id_item_pedido}/situacao`,
        { id_situacao: novaSituacao }
      );

      await carregarPedidos();
    }
    catch (error)
    {
      setErro(error instanceof Error
        ? error.message
        : "Não foi possível alterar o status do pedido."
      );
    }
    finally
    {
      setItemEmAtualizacao(null);
    }
  }

  const aguardando = pedidos.filter((item) => item.id_situacao === "AGUARDANDO");
  const emPreparo  = pedidos.filter((item) => item.id_situacao === "EM_PREPARO");

  function renderizarPedido(item: ItemPedido) {
    const processando = itemEmAtualizacao === item.id_item_pedido;

    return (
      <article key={item.id_item_pedido} className={estilos.cartaoInterno}>
        <div className={estilos.linhaCabecalho}>
          <div>
            <p className={estilos.subtituloCartao}>
              Comanda #{item.comanda.id_comanda}
            </p>

            <h3 className={estilos.tituloItem}>
              {item.item_cardapio.nm_item}
            </h3>
          </div>

          <span className={`${estilos.seloEstado} ${estilos.seloNeutro}`}>
            {item.qt_quantidade} un.
          </span>
        </div>

        <div className={estilos.dadosLista}>
          <p className={estilos.linhaIcone}>
            <Clock size={16} aria-hidden="true" />
            Recebido às {formatarHorario(item.dt_pedido)}
          </p>

          <p className={estilos.linhaIcone}>
            <Utensils size={16} aria-hidden="true" />
            {item.comanda.mesa
              ? `Mesa ${item.comanda.mesa.nr_mesa}`
              : "Mesa não informada"}
          </p>
        </div>

        {item.ds_observacao && (
          <div className={estilos.observacao}>
            <p className={estilos.rotuloPequeno}>Observações</p>
            <p>{item.ds_observacao}</p>
          </div>
        )}

        <button
          type="button"
          className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.botaoComIcone} ${estilos.larguraCompleta} ${estilos.espacoTopo}`}
          disabled={processando}
          onClick={() =>
            void alterarSituacao(
              item,
              item.id_situacao === "AGUARDANDO"
                ? "EM_PREPARO"
                : "PRONTO"
            )
          }
        >
          {processando ? (
            "Atualizando..."
          ) : item.id_situacao === "AGUARDANDO" ? (
            <>
              <ChefHat size={16} aria-hidden="true" />
              Iniciar preparo
            </>
          ) : (
            <>
              <CheckCircle2 size={16} aria-hidden="true" />
              Marcar como pronto
            </>
          )}
        </button>
      </article>
    );
  }

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecalhoComAcao}>
        <div>
          <p className="sobretitulo">Painel operacional</p>
          <h1 className={estilos.titulo}>Cozinha</h1>
          <p className={estilos.descricao}>
            Acompanhe os pedidos e atualize o preparo dos pratos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void carregarPedidos()}
          disabled={atualizando}
          className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoComIcone}`}
        >
          <RefreshCw size={16} aria-hidden="true" />
          Atualizar fila
        </button>
      </header>

      {erro && (
        <div role="alert" className={`${estilos.alerta} ${estilos.alertaErro}`}>
          {erro}
        </div>
      )}

      {carregando ? (
        <div className={`${estilos.cartao} ${estilos.carregando}`}>
          Carregando pedidos...
        </div>
      ) : pedidos.length === 0 ? (
        <div className={`${estilos.cartao} ${estilos.vazio}`}>
          <ChefHat size={48} className={estilos.iconeDestaque} aria-hidden="true" />
          <h2 className={estilos.vazioTitulo}>Nenhum pedido na fila</h2>
          <p className={estilos.vazioTexto}>
            Quando houver itens aguardando preparo ou em preparo, eles
            aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className={estilos.colunasDuplas}>
          <section className={estilos.colunaFila}>
            <div className={estilos.linhaCabecalho}>
              <h2 className={estilos.tituloCartao}>Aguardando preparo</h2>
              <span className={`${estilos.seloEstado} ${estilos.seloAguardando}`}>
                {aguardando.length}
              </span>
            </div>

            {aguardando.length === 0 ? (
              <p className={estilos.textoSuave}>Nenhum item aguardando.</p>
            ) : (
              aguardando.map(renderizarPedido)
            )}
          </section>

          <section className={estilos.colunaFila}>
            <div className={estilos.linhaCabecalho}>
              <h2 className={estilos.tituloCartao}>Em preparo</h2>
              <span className={`${estilos.seloEstado} ${estilos.seloEmPreparo}`}>
                {emPreparo.length}
              </span>
            </div>

            {emPreparo.length === 0 ? (
              <p className={estilos.textoSuave}>Nenhum item em preparo.</p>
            ) : (
              emPreparo.map(renderizarPedido)
            )}
          </section>
        </div>
      )}
    </div>
  );
}
