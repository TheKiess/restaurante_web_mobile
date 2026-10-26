
"use client";

import Link                                 from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPatch }                 from "@/lib/api";
import estilos                              from "@/componentes/Painel/Painel.module.css";

type ItemPedido = {
  id_item_pedido: number;
  id_situacao: string;
  qt_quantidade: number;
  ds_observacao?: string | null;
  dt_criacao?: string;
  item_cardapio?: {
    nm_item: string;
  };
  comanda?: {
    id_comanda: number;
    mesa?: {
      nr_mesa: number;
    };
  };
};

export default function EntregasPage()
{
  const [pedidos, setPedidos]                     = useState<ItemPedido[]>([]);
  const [carregando, setCarregando]               = useState(true);
  const [pedidoAtualizando, setPedidoAtualizando] = useState<number | null>(null);
  const [erro, setErro]                           = useState("");
  const [sucesso, setSucesso]                     = useState("");
  const carregarPedidos                           = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try
    {
      const dados = await apiGet<ItemPedido[]>(
        "itens-pedido?id_situacao=PRONTO"
      );

      setPedidos(Array.isArray(dados) ? dados : []);
    }
    catch (error)
    {
      console.error("Erro ao carregar pedidos prontos:", error);
      setErro("Não foi possível carregar os pedidos. Tente novamente.");
    }
    finally
    {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarPedidos();
  }, [carregarPedidos]);

  async function marcarComoEntregue(idItemPedido: number)
  {
    setPedidoAtualizando(idItemPedido);
    setErro("");
    setSucesso("");

    try
    {
      await apiPatch(
        `itens-pedido/${idItemPedido}/situacao`,
        { id_situacao: "ENTREGUE" }
      );

      setPedidos((anteriores) => anteriores.filter((pedido) => pedido.id_item_pedido !== idItemPedido));
      setSucesso("Pedido marcado como entregue com sucesso.");
    }
    catch (error)
    {
      console.error("Erro ao registrar entrega:", error);
      setErro("Não foi possível registrar a entrega. Tente novamente.");
    }
    finally
    {
      setPedidoAtualizando(null);
    }
  }

  return (
    <div className={estilos.pagina}>
      <header>
        <p className="sobretitulo">Área do garçom</p>
        <h1 className={estilos.titulo}>Entregas</h1>
        <p className={estilos.descricao}>
          Confira os pedidos prontos e registre a entrega à mesa.
        </p>

        <div className={estilos.espacoTopo}>
          <Link
            href="/garcom"
            className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
          >
            <span aria-hidden="true">←</span> Voltar ao início
          </Link>
        </div>
      </header>

      <section className={estilos.cartao}>
        <div className={estilos.linhaCabecalho}>
          <div>
            <h2 className={estilos.tituloCartao}>Pedidos prontos</h2>
            <p className={estilos.subtituloCartao}>
              Pedidos aguardando entrega aos clientes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void carregarPedidos()}
            disabled={carregando}
            className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
          >
            {carregando ? "Atualizando..." : "Atualizar pedidos"}
          </button>
        </div>

        {erro && (
          <div role="alert" className={`${estilos.alerta} ${estilos.alertaErro} ${estilos.espacoTopo}`}>
            {erro}
          </div>
        )}

        {sucesso && (
          <div role="status" className={`${estilos.alerta} ${estilos.alertaSucesso} ${estilos.espacoTopo}`}>
            {sucesso}
          </div>
        )}

        {carregando ? (
          <p className={estilos.carregando}>Carregando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <div className={`${estilos.vazio} ${estilos.vazioBorda} ${estilos.espacoTopo}`}>
            <div className={estilos.vazioTitulo} aria-hidden="true">
              ✓
            </div>

            <h3 className={estilos.vazioTitulo}>Nenhum pedido pronto</h3>

            <p className={estilos.vazioTexto}>
              Quando a cozinha finalizar um pedido, ele aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className={estilos.gradeCartoes}>
            {pedidos.map((pedido) => (
              <article key={pedido.id_item_pedido} className={estilos.cartaoInterno}>
                <div className={estilos.linhaCabecalho}>
                  <div>
                    <p className={estilos.rotuloPequeno}>
                      Pedido #{pedido.id_item_pedido}
                    </p>

                    <h3 className={estilos.tituloCartao}>
                      {pedido.item_cardapio?.nm_item ?? "Item do cardápio"}
                    </h3>
                  </div>

                  <span className={`${estilos.seloEstado} ${estilos.seloPronto}`}>
                    Pronto
                  </span>
                </div>

                <div className={estilos.dadosLista}>
                  <p>
                    <span className={estilos.negrito}>Mesa: </span>
                    {pedido.comanda?.mesa?.nr_mesa ?? "Não informada"}
                  </p>

                  <p>
                    <span className={estilos.negrito}>Comanda: </span>
                    {pedido.comanda?.id_comanda ?? "Não informada"}
                  </p>

                  <p>
                    <span className={estilos.negrito}>Quantidade: </span>
                    {pedido.qt_quantidade}
                  </p>

                  {pedido.ds_observacao && (
                    <p className={estilos.observacao}>
                      <span className={estilos.negrito}>Observação: </span>
                      {pedido.ds_observacao}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => void marcarComoEntregue(pedido.id_item_pedido)}
                  disabled={pedidoAtualizando !== null}
                  className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.larguraCompleta} ${estilos.espacoTopo}`}
                >
                  {pedidoAtualizando === pedido.id_item_pedido
                    ? "Registrando entrega..."
                    : "Marcar como entregue"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}