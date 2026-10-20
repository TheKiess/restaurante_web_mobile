
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";

type Situacao =
  | "AGUARDANDO"
  | "EM_PREPARO"
  | "PRONTO"
  | "ENTREGUE"
  | "CANCELADO";

type ItemPedido = {
  id_item_pedido: number;
  id_comanda: number;
  qt_quantidade: number;
  vl_unitario: number | string;
  id_situacao: Situacao;
  dt_pedido: string;
  ds_observacao?: string | null;
  item_cardapio?: {
    nm_item: string;
  } | null;
  comanda?: {
    id_comanda: number;
    mesa?: {
      nr_mesa: number;
    } | null;
  } | null;
};

const situacoes: Situacao[] = [
  "AGUARDANDO",
  "EM_PREPARO",
  "PRONTO",
  "ENTREGUE",
  "CANCELADO",
];

const nomesSituacao: Record<Situacao, string> = {
  AGUARDANDO: "Aguardando",
  EM_PREPARO: "Em preparo",
  PRONTO: "Pronto",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const estilosSituacao: Record<Situacao, string> = {
  AGUARDANDO: "bg-amber-100 text-amber-800",
  EM_PREPARO: "bg-blue-100 text-blue-800",
  PRONTO: "bg-emerald-100 text-emerald-800",
  ENTREGUE: "bg-stone-200 text-stone-700",
  CANCELADO: "bg-red-100 text-red-800",
};

const proximasSituacoes: Record<Situacao, Situacao[]> = {
  AGUARDANDO: ["EM_PREPARO", "CANCELADO"],
  EM_PREPARO: ["PRONTO"],
  PRONTO: ["ENTREGUE", "CANCELADO"],
  ENTREGUE: [],
  CANCELADO: [],
};

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dataHora(valor: string) {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data indisponível";
  }

  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function erroTexto(erro: unknown) {
  return erro instanceof Error
    ? erro.message
    : "Ocorreu um erro inesperado.";
}

export default function PedidosPage() {
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [filtro, setFiltro] = useState<"TODOS" | Situacao>("TODOS");
  const [carregando, setCarregando] = useState(true);
  const [itemAtualizando, setItemAtualizando] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarPedidos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");

      const dados = await apiGet<ItemPedido[]>("itens-pedido");
      setItens(dados);
    } catch (error) {
      setErro(erroTexto(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarPedidos();
  }, [carregarPedidos]);

  async function alterarSituacao(
    item: ItemPedido,
    novaSituacao: Situacao
  ) {
    const permitidas = proximasSituacoes[item.id_situacao];

    if (!permitidas.includes(novaSituacao)) {
      setErro("Essa alteração de situação não é permitida.");
      return;
    }

    try {
      setItemAtualizando(item.id_item_pedido);
      setErro("");
      setSucesso("");

      await apiPatch<ItemPedido>(
        `itens-pedido/${item.id_item_pedido}/situacao`,
        { id_situacao: novaSituacao }
      );

      setSucesso(
        `Item #${item.id_item_pedido} atualizado para ${nomesSituacao[novaSituacao]}.`
      );

      await carregarPedidos();
    } catch (error) {
      setErro(erroTexto(error));
    } finally {
      setItemAtualizando(null);
    }
  }

  const itensFiltrados =
    filtro === "TODOS"
      ? itens
      : itens.filter((item) => item.id_situacao === filtro);

  const grupos = new Map<number, ItemPedido[]>();

  for (const item of itensFiltrados) {
    const idComanda = item.comanda?.id_comanda ?? item.id_comanda;
    const grupo = grupos.get(idComanda) ?? [];
    grupo.push(item);
    grupos.set(idComanda, grupo);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wider text-[#9B6875]">
            OPERAÇÃO DO RESTAURANTE
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#6F2438]">
            Pedidos
          </h1>

          <p className="mt-2 text-[#77685E]">
            Consulte os pedidos e atualize a situação de cada item.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void carregarPedidos()}
          disabled={carregando}
          className="rounded-lg border border-[#D7C3B8] bg-white px-4 py-3 font-medium text-[#6F2438] transition hover:bg-[#F5E9EC] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {carregando ? "Atualizando..." : "↻ Atualizar pedidos"}
        </button>
      </header>

      {erro && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="font-semibold">Não foi possível concluir a operação.</p>
          <p className="mt-1 break-words">{erro}</p>
        </div>
      )}

      {sucesso && (
        <div
          role="status"
          className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {sucesso}
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-[#49352F]">
          Situação dos itens
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {situacoes.map((situacao) => {
            const quantidade = itens.filter(
              (item) => item.id_situacao === situacao
            ).length;

            return (
              <button
                key={situacao}
                type="button"
                onClick={() =>
                  setFiltro(filtro === situacao ? "TODOS" : situacao)
                }
                className={`rounded-xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md ${
                  filtro === situacao
                    ? "border-[#6F2438] ring-2 ring-[#6F2438]/20"
                    : "border-[#E4D7CB]"
                }`}
              >
                <p className="text-sm text-[#77685E]">
                  {nomesSituacao[situacao]}
                </p>

                <p className="mt-2 text-3xl font-bold text-[#6F2438]">
                  {carregando ? "—" : quantidade}
                </p>

                <span
                  className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${estilosSituacao[situacao]}`}
                >
                  {filtro === situacao ? "Filtro ativo" : "Ver itens"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#6F2438]">
              Lista de pedidos
            </h2>
            <p className="mt-1 text-sm text-[#77685E]">
              Os itens estão agrupados por comanda.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-[#49352F]">
            Filtrar situação
            <select
              value={filtro}
              onChange={(event) =>
                setFiltro(event.target.value as "TODOS" | Situacao)
              }
              className="rounded-lg border border-[#D7C3B8] bg-white px-3 py-2"
            >
              <option value="TODOS">Todas</option>
              {situacoes.map((situacao) => (
                <option key={situacao} value={situacao}>
                  {nomesSituacao[situacao]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {carregando ? (
          <div className="rounded-xl border border-[#E4D7CB] bg-white p-10 text-center text-[#77685E]">
            Carregando pedidos da API...
          </div>
        ) : itensFiltrados.length === 0 ? (
          <div className="rounded-xl border border-[#E4D7CB] bg-white p-10 text-center">
            <p className="text-lg font-semibold text-[#6F2438]">
              Nenhum item encontrado
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {Array.from(grupos.entries()).map(([idComanda, itensComanda]) => {
              const primeiro = itensComanda[0];
              const numeroMesa = primeiro.comanda?.mesa?.nr_mesa;
              const total = itensComanda.reduce(
                (soma, item) =>
                  soma +
                  (Number(item.vl_unitario) || 0) *
                    (Number(item.qt_quantidade) || 0),
                0
              );

              return (
                <article
                  key={idComanda}
                  className="overflow-hidden rounded-xl border border-[#E4D7CB] bg-white shadow-sm"
                >
                  <header className="flex flex-col gap-3 border-b border-[#EDE3DA] bg-[#F7F0E9] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#6F2438]">
                        Comanda #{idComanda}
                      </h3>
                      <p className="mt-1 text-sm text-[#77685E]">
                        {numeroMesa != null
                          ? `Mesa ${numeroMesa}`
                          : "Mesa não informada"}{" "}
                        · {itensComanda.length}{" "}
                        {itensComanda.length === 1 ? "item" : "itens"}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs text-[#77685E]">
                        Total dos itens exibidos
                      </p>
                      <p className="mt-1 text-xl font-bold text-[#6F2438]">
                        {moeda(total)}
                      </p>
                    </div>
                  </header>

                  <div className="divide-y divide-[#EDE3DA]">
                    {itensComanda.map((item) => {
                      const permitidas = proximasSituacoes[item.id_situacao];

                      return (
                        <div
                          key={item.id_item_pedido}
                          className="p-5"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-semibold text-[#49352F]">
                                  {item.item_cardapio?.nm_item ??
                                    `Item #${item.id_item_pedido}`}
                                </h4>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${estilosSituacao[item.id_situacao]}`}
                                >
                                  {nomesSituacao[item.id_situacao]}
                                </span>
                              </div>

                              <p className="mt-2 text-sm text-[#77685E]">
                                Pedido #{item.id_item_pedido} · Quantidade:{" "}
                                {item.qt_quantidade} · Unitário:{" "}
                                {moeda(Number(item.vl_unitario) || 0)}
                              </p>

                              <p className="mt-1 text-sm text-[#77685E]">
                                {dataHora(item.dt_pedido)}
                              </p>

                              {item.ds_observacao && (
                                <p className="mt-2 rounded-lg bg-[#FAF7F2] p-3 text-sm text-[#49352F]">
                                  <strong>Observação:</strong>{" "}
                                  {item.ds_observacao}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                              {permitidas.length === 0 ? (
                                <span className="text-sm text-[#77685E]">
                                  Sem próximas ações
                                </span>
                              ) : (
                                permitidas.map((novaSituacao) => (
                                  <button
                                    key={novaSituacao}
                                    type="button"
                                    disabled={
                                      itemAtualizando === item.id_item_pedido
                                    }
                                    onClick={() =>
                                      void alterarSituacao(item, novaSituacao)
                                    }
                                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                      novaSituacao === "CANCELADO"
                                        ? "border border-red-200 text-red-700 hover:bg-red-50"
                                        : "bg-[#6F2438] text-white hover:bg-[#87364D]"
                                    }`}
                                  >
                                    {itemAtualizando === item.id_item_pedido
                                      ? "Salvando..."
                                      : novaSituacao === "EM_PREPARO"
                                        ? "Iniciar preparo"
                                        : novaSituacao === "PRONTO"
                                          ? "Marcar pronto"
                                          : novaSituacao === "ENTREGUE"
                                            ? "Marcar entregue"
                                            : "Cancelar item"}
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
