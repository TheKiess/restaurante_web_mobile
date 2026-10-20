
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";

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

export default function EntregasPage() {
  const [pedidos, setPedidos] = useState<ItemPedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [pedidoAtualizando, setPedidoAtualizando] = useState<number | null>(
    null
  );
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarPedidos = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const dados = await apiGet<ItemPedido[]>(
        "itens-pedido?id_situacao=PRONTO"
      );

      setPedidos(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao carregar pedidos prontos:", error);
      setErro("Não foi possível carregar os pedidos. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarPedidos();
  }, [carregarPedidos]);

  async function marcarComoEntregue(idItemPedido: number) {
    setPedidoAtualizando(idItemPedido);
    setErro("");
    setSucesso("");

    try {
      await apiPatch(
        `itens-pedido/${idItemPedido}/situacao`,
        { id_situacao: "ENTREGUE" }
      );

      setPedidos((anteriores) =>
        anteriores.filter(
          (pedido) => pedido.id_item_pedido !== idItemPedido
        )
      );

      setSucesso("Pedido marcado como entregue com sucesso.");
    } catch (error) {
      console.error("Erro ao registrar entrega:", error);
      setErro("Não foi possível registrar a entrega. Tente novamente.");
    } finally {
      setPedidoAtualizando(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 pb-12 pt-8 text-[#352A2C] sm:px-6 lg:px-8">
      <header className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#786C6C]">
            Área do garçom
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#6F2438]">
            Entregas
          </h1>

          <p className="mt-2 text-sm text-[#786C6C]">
            Confira os pedidos prontos e registre a entrega à mesa.
          </p>
        </div>

        <Link
          href="/garcom"
          className="inline-flex items-center gap-2 rounded-xl border border-[#E2D5CD] bg-white px-4 py-2.5 text-sm font-semibold text-[#6F2438] transition hover:bg-[#F8F0F1]"
        >
          <span aria-hidden="true">←</span>
          Voltar ao início
        </Link>
      </header>

      <section className="rounded-2xl border border-[#E9DED6] bg-[#FFFCF9] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-[#6F2438]">
              Pedidos prontos
            </h2>

            <p className="mt-1 text-sm text-[#786C6C]">
              Pedidos aguardando entrega aos clientes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void carregarPedidos()}
            disabled={carregando}
            className="inline-flex items-center justify-center rounded-xl border border-[#E2D5CD] bg-white px-4 py-2.5 text-sm font-semibold text-[#6F2438] transition hover:bg-[#F8F0F1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? "Atualizando..." : "Atualizar pedidos"}
          </button>
        </div>

        {erro && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {erro}
          </div>
        )}

        {sucesso && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {sucesso}
          </div>
        )}

        {carregando ? (
          <div className="py-12 text-center text-sm text-[#786C6C]">
            Carregando pedidos...
          </div>
        ) : pedidos.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-[#E2D5CD] bg-white px-5 py-12 text-center">
            <div className="text-3xl" aria-hidden="true">
              ✓
            </div>

            <h3 className="mt-3 font-semibold text-[#6F2438]">
              Nenhum pedido pronto
            </h3>

            <p className="mt-2 text-sm text-[#786C6C]">
              Quando a cozinha finalizar um pedido, ele aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {pedidos.map((pedido) => (
              <article
                key={pedido.id_item_pedido}
                className="rounded-xl border border-[#E9DED6] bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#786C6C]">
                      Pedido #{pedido.id_item_pedido}
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-[#6F2438]">
                      {pedido.item_cardapio?.nm_item ??
                        "Item do cardápio"}
                    </h3>
                  </div>

                  <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                    Pronto
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Mesa: </span>
                    {pedido.comanda?.mesa?.nr_mesa ?? "Não informada"}
                  </p>

                  <p>
                    <span className="font-semibold">Comanda: </span>
                    {pedido.comanda?.id_comanda ?? "Não informada"}
                  </p>

                  <p>
                    <span className="font-semibold">Quantidade: </span>
                    {pedido.qt_quantidade}
                  </p>

                  {pedido.ds_observacao && (
                    <p className="rounded-lg bg-[#F8F4EF] p-3 text-[#786C6C]">
                      <span className="font-semibold text-[#352A2C]">
                        Observação:{" "}
                      </span>
                      {pedido.ds_observacao}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void marcarComoEntregue(pedido.id_item_pedido)
                  }
                  disabled={pedidoAtualizando !== null}
                  className="mt-5 w-full rounded-xl bg-[#6F2438] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#541A2A] disabled:cursor-not-allowed disabled:opacity-50"
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
    </main>
  );
}