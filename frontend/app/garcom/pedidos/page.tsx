"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

type Mesa = {
  id_mesa: number;
  nr_mesa: number;
  qt_lugares: number;
};

type Comanda = {
  id_comanda: number;
  id_situacao: string;
  mesa?: Mesa | null;
};

type ItemCardapio = {
  id_item_cardapio: number;
  nm_item: string;
  ds_item: string | null;
  vl_unitario: number | string;
  tipo_item: "PREPARADO" | "REVENDA";
  disponivel: boolean;
};

type ItemPedido = {
  id_item_pedido: number;
  id_comanda: number;
  id_item_cardapio: number;
  qt_quantidade: number;
  ds_observacao?: string | null;
  vl_unitario: number | string;
  id_situacao: string;
  item_cardapio?: {
    nm_item: string;
  };
};

type TipoAtendimento = "MESA" | "RETIRADA";

function formatarPreco(valor: number | string) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function obterSubtotal(item: ItemPedido) {
  return Number(item.vl_unitario) * item.qt_quantidade;
}

export default function PedidosPage() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [itens, setItens] = useState<ItemCardapio[]>([]);
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([]);

  const [tipoAtendimento, setTipoAtendimento] =
    useState<TipoAtendimento>("MESA");

  const [mesaSelecionada, setMesaSelecionada] = useState("");
  const [comandaSelecionada, setComandaSelecionada] =
    useState<number | null>(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [observacao, setObservacao] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [carregandoItensPedido, setCarregandoItensPedido] =
    useState(false);
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const [dadosComandas, dadosItens, dadosMesas] =
        await Promise.all([
          apiGet<Comanda[]>("comandas?id_situacao=ABERTA"),
          apiGet<ItemCardapio[]>("itens-cardapio"),
          apiGet<Mesa[]>("mesas"),
        ]);

      setComandas(dadosComandas);

      setMesas(
        [...dadosMesas].sort((a, b) => a.nr_mesa - b.nr_mesa)
      );

      setItens(
        dadosItens
          .filter((item) => item.disponivel)
          .sort((a, b) =>
            a.nm_item.localeCompare(b.nm_item, "pt-BR")
          )
      );

      setMesaSelecionada((selecionada) => {
        const mesaAtual = dadosMesas.find(
          (mesa) => String(mesa.id_mesa) === selecionada
        );

        if (!mesaAtual) return selecionada;

        const ocupada = dadosComandas.some(
          (comanda) =>
            comanda.mesa?.id_mesa === mesaAtual.id_mesa
        );

        return ocupada ? "" : selecionada;
      });

      setComandaSelecionada((selecionada) => {
        if (
          selecionada !== null &&
          !dadosComandas.some(
            (comanda) => comanda.id_comanda === selecionada
          )
        ) {
          setItensPedido([]);
          return null;
        }

        return selecionada;
      });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os dados."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  const carregarItensPedido = useCallback(async (idComanda: number) => {
    setCarregandoItensPedido(true);
    setErro("");
    setSucesso("");

    try {
      const dados = await apiGet<ItemPedido[]>(
        `itens-pedido?id_comanda=${idComanda}`
      );

      setItensPedido(dados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os itens da comanda."
      );
      setItensPedido([]);
    } finally {
      setCarregandoItensPedido(false);
    }
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  const mesasOcupadas = new Set(
    comandas
      .map((comanda) => comanda.mesa?.id_mesa)
      .filter((id): id is number => id !== undefined)
  );

  const mesasDisponiveis = mesas.filter(
    (mesa) => !mesasOcupadas.has(mesa.id_mesa)
  );

  const produtoEscolhido = itens.find(
    (item) => String(item.id_item_cardapio) === produtoSelecionado
  );

  const totalComanda = itensPedido.reduce(
    (total, item) => total + obterSubtotal(item),
    0
  );

  function alterarTipoAtendimento(tipo: TipoAtendimento) {
    setTipoAtendimento(tipo);
    setMesaSelecionada("");
    setErro("");
    setSucesso("");
  }

  function prepararAbertura() {
    setErro("");
    setSucesso("");

    if (tipoAtendimento === "MESA" && !mesaSelecionada) {
      setErro("Selecione uma mesa disponível.");
      return;
    }
  }

  async function selecionarComanda(comanda: Comanda) {
    setComandaSelecionada(comanda.id_comanda);
    setProdutoSelecionado("");
    setQuantidade("1");
    setObservacao("");
    setItensPedido([]);
    setErro("");
    setSucesso("");

    await carregarItensPedido(comanda.id_comanda);
  }

  async function adicionarItem() {
    setErro("");
    setSucesso("");

    if (comandaSelecionada === null) {
      setErro("Selecione uma comanda aberta antes de lançar um item.");
      return;
    }

    if (!produtoSelecionado) {
      setErro("Selecione um produto do cardápio.");
      return;
    }

    const quantidadeNumero = Number(quantidade);

    if (
      !Number.isInteger(quantidadeNumero) ||
      quantidadeNumero < 1 ||
      quantidadeNumero > 99
    ) {
      setErro("A quantidade deve ser um número inteiro entre 1 e 99.");
      return;
    }

    if (observacao.trim().length > 200) {
      setErro("A observação deve ter no máximo 200 caracteres.");
      return;
    }

    setEnviandoPedido(true);

    try {
      const novoItem = await apiPost<ItemPedido>("itens-pedido", {
        id_comanda: comandaSelecionada,
        id_item_cardapio: Number(produtoSelecionado),
        qt_quantidade: quantidadeNumero,
        ...(observacao.trim()
          ? { ds_observacao: observacao.trim() }
          : {}),
      });

      setItensPedido((atuais) => [...atuais, novoItem]);
      setProdutoSelecionado("");
      setQuantidade("1");
      setObservacao("");
      setSucesso("Item adicionado à comanda com sucesso!");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar o item à comanda."
      );
    } finally {
      setEnviandoPedido(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 pb-12 text-[#352A2C] sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#87364D]">
          Atendimento
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Pedidos
        </h1>

        <p className="mt-2 text-sm text-[#786C6C]">
          Consulte as comandas abertas e registre os itens dos pedidos.
        </p>

        <div className="mt-4">
          <Link
            href="/garcom"
            className="inline-flex items-center gap-2 rounded-xl border border-[#E2D5CD] bg-white px-4 py-2.5 text-sm font-semibold text-[#6F2438] transition hover:bg-[#F8F0F1]"
          >
            <span aria-hidden="true">←</span>
            Voltar ao início
          </Link>
        </div>
      </header>

      {erro && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {erro}
          <button
            type="button"
            onClick={() => void carregarDados()}
            className="ml-3 font-semibold underline"
          >
            Atualizar dados
          </button>
        </div>
      )}

      {sucesso && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {sucesso}
        </div>
      )}

      {carregando ? (
        <div className="rounded-2xl border border-[#E9DED6] bg-white p-10 text-center text-[#786C6C]">
          Carregando comandas, mesas e cardápio...
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-[#E9DED6] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Nova comanda</h2>

            <p className="mt-1 text-sm text-[#786C6C]">
              Escolha o tipo de atendimento para preparar a abertura.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => alterarTipoAtendimento("MESA")}
                aria-pressed={tipoAtendimento === "MESA"}
                className={`rounded-xl border p-4 text-left transition ${
                  tipoAtendimento === "MESA"
                    ? "border-[#6F2438] bg-[#F8F0F1] ring-1 ring-[#6F2438]"
                    : "border-[#E9DED6] hover:bg-[#FFFCF9]"
                }`}
              >
                <span className="block font-semibold">
                  Atendimento em mesa
                </span>
                <span className="mt-1 block text-sm text-[#786C6C]">
                  Escolher uma mesa disponível.
                </span>
              </button>

              <button
                type="button"
                onClick={() => alterarTipoAtendimento("RETIRADA")}
                aria-pressed={tipoAtendimento === "RETIRADA"}
                className={`rounded-xl border p-4 text-left transition ${
                  tipoAtendimento === "RETIRADA"
                    ? "border-[#6F2438] bg-[#F8F0F1] ring-1 ring-[#6F2438]"
                    : "border-[#E9DED6] hover:bg-[#FFFCF9]"
                }`}
              >
                <span className="block font-semibold">
                  Retirada / sem mesa
                </span>
                <span className="mt-1 block text-sm text-[#786C6C]">
                  Pedido sem vínculo com uma mesa.
                </span>
              </button>
            </div>

            {tipoAtendimento === "MESA" && (
              <div className="mt-5">
                <label
                  htmlFor="mesa"
                  className="mb-2 block text-sm font-medium"
                >
                  Mesa disponível
                </label>

                <select
                  id="mesa"
                  value={mesaSelecionada}
                  onChange={(evento) =>
                    setMesaSelecionada(evento.target.value)
                  }
                  className="w-full rounded-xl border border-[#E2D5CD] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#87364D] sm:max-w-md"
                >
                  <option value="">Selecione uma mesa</option>

                  {mesasDisponiveis.map((mesa) => (
                    <option
                      key={mesa.id_mesa}
                      value={mesa.id_mesa}
                    >
                      Mesa {mesa.nr_mesa} — {mesa.qt_lugares} lugares
                    </option>
                  ))}
                </select>

                {mesasDisponiveis.length === 0 && (
                  <p className="mt-2 text-sm text-amber-700">
                    Não há mesas aparentemente disponíveis. Você ainda
                    pode selecionar retirada.
                  </p>
                )}
              </div>
            )}

            {tipoAtendimento === "RETIRADA" && (
              <p className="mt-5 rounded-xl bg-[#FFFCF9] p-4 text-sm text-[#786C6C]">
                A comanda será criada sem informar o campo id_mesa.
              </p>
            )}

            <button
              type="button"
              onClick={prepararAbertura}
              className="mt-5 rounded-xl bg-[#6F2438] px-5 py-3 font-semibold text-white transition hover:bg-[#87364D]"
            >
              Preparar abertura da comanda
            </button>
          </section>

          <section className="rounded-2xl border border-[#E9DED6] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Comandas abertas</h2>
                <p className="mt-1 text-sm text-[#786C6C]">
                  {comandas.length} comanda(s) encontrada(s)
                </p>
              </div>

              <button
                type="button"
                onClick={() => void carregarDados()}
                disabled={carregando}
                className="rounded-xl border border-[#E2D5CD] px-4 py-2 text-sm font-semibold hover:bg-[#FAF7F2] disabled:opacity-60"
              >
                Atualizar
              </button>
            </div>

            {comandas.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-[#DCCBC1] bg-[#FFFCF9] p-8 text-center">
                <h3 className="text-lg font-semibold">
                  Nenhuma comanda aberta
                </h3>
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {comandas.map((comanda) => {
                  const selecionada =
                    comandaSelecionada === comanda.id_comanda;

                  return (
                    <article
                      key={comanda.id_comanda}
                      className={`rounded-xl border p-4 transition ${
                        selecionada
                          ? "border-[#6F2438] bg-[#F8F0F1] ring-1 ring-[#6F2438]"
                          : "border-[#E9DED6]"
                      }`}
                    >
                      <p className="font-semibold">
                        Comanda #{comanda.id_comanda}
                      </p>

                      <p className="mt-1 text-sm text-[#786C6C]">
                        {comanda.mesa
                          ? `Mesa ${comanda.mesa.nr_mesa}`
                          : "Retirada / sem mesa"}
                      </p>

                      <button
                        type="button"
                        onClick={() => void selecionarComanda(comanda)}
                        disabled={carregandoItensPedido}
                        className="mt-4 w-full rounded-lg bg-[#6F2438] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#87364D] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {selecionada
                          ? "Comanda selecionada"
                          : "Selecionar comanda"}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {comandaSelecionada !== null && (
            <section className="rounded-2xl border border-[#E9DED6] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">
                Lançar itens — Comanda #{comandaSelecionada}
              </h2>

              <p className="mt-1 text-sm text-[#786C6C]">
                Escolha o produto, informe a quantidade e, se necessário,
                adicione uma observação para a cozinha.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="produto"
                    className="mb-2 block text-sm font-medium"
                  >
                    Produto
                  </label>

                  <select
                    id="produto"
                    value={produtoSelecionado}
                    onChange={(evento) =>
                      setProdutoSelecionado(evento.target.value)
                    }
                    className="w-full rounded-xl border border-[#E2D5CD] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#87364D]"
                  >
                    <option value="">Selecione um produto</option>

                    {itens.map((item) => (
                      <option
                        key={item.id_item_cardapio}
                        value={item.id_item_cardapio}
                      >
                        {item.nm_item} — {formatarPreco(item.vl_unitario)}
                      </option>
                    ))}
                  </select>
                </div>

                {produtoEscolhido && (
                  <div className="rounded-xl bg-[#FFFCF9] p-4 md:col-span-2">
                    <p className="font-semibold">
                      {produtoEscolhido.nm_item}
                    </p>
                    <p className="mt-1 text-sm text-[#786C6C]">
                      Preço unitário:{" "}
                      {formatarPreco(produtoEscolhido.vl_unitario)}
                    </p>
                    <p className="mt-1 text-sm text-[#786C6C]">
                      {produtoEscolhido.tipo_item === "PREPARADO"
                        ? "Será enviado para preparação na cozinha."
                        : "Item registrado como pronto."}
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="quantidade"
                    className="mb-2 block text-sm font-medium"
                  >
                    Quantidade
                  </label>

                  <input
                    id="quantidade"
                    type="number"
                    min={1}
                    max={99}
                    step={1}
                    value={quantidade}
                    onChange={(evento) =>
                      setQuantidade(evento.target.value)
                    }
                    className="w-full rounded-xl border border-[#E2D5CD] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#87364D]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="observacao"
                    className="mb-2 block text-sm font-medium"
                  >
                    Observação (opcional)
                  </label>

                  <input
                    id="observacao"
                    type="text"
                    maxLength={200}
                    value={observacao}
                    onChange={(evento) =>
                      setObservacao(evento.target.value)
                    }
                    placeholder="Ex.: sem cebola"
                    className="w-full rounded-xl border border-[#E2D5CD] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#87364D]"
                  />

                  <p className="mt-1 text-xs text-[#786C6C]">
                    {observacao.length}/200 caracteres
                  </p>
                </div>
              </div>

              {produtoEscolhido && (
                <p className="mt-4 text-right text-sm text-[#786C6C]">
                  Subtotal estimado:{" "}
                  <span className="font-bold text-[#6F2438]">
                    {formatarPreco(
                      Number(produtoEscolhido.vl_unitario) *
                        (Number(quantidade) || 0)
                    )}
                  </span>
                </p>
              )}

              <button
                type="button"
                onClick={() => void adicionarItem()}
                disabled={enviandoPedido || carregandoItensPedido}
                className="mt-5 rounded-xl bg-[#6F2438] px-5 py-3 font-semibold text-white transition hover:bg-[#87364D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviandoPedido
                  ? "Adicionando item..."
                  : "Adicionar à comanda"}
              </button>

              <div className="mt-8 border-t border-[#E9DED6] pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold">Itens lançados</h3>

                  <button
                    type="button"
                    onClick={() =>
                      void carregarItensPedido(comandaSelecionada)
                    }
                    disabled={carregandoItensPedido}
                    className="rounded-lg border border-[#E2D5CD] px-3 py-2 text-sm font-semibold hover:bg-[#FAF7F2] disabled:opacity-60"
                  >
                    Atualizar itens
                  </button>
                </div>

                {carregandoItensPedido ? (
                  <p className="mt-4 text-sm text-[#786C6C]">
                    Carregando itens da comanda...
                  </p>
                ) : itensPedido.length === 0 ? (
                  <p className="mt-4 rounded-xl bg-[#FFFCF9] p-5 text-center text-sm text-[#786C6C]">
                    Nenhum item foi lançado nesta comanda.
                  </p>
                ) : (
                  <>
                    <div className="mt-4 space-y-3">
                      {itensPedido.map((item) => (
                        <article
                          key={item.id_item_pedido}
                          className="flex flex-col gap-3 rounded-xl border border-[#E9DED6] p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <h4 className="font-semibold">
                              {item.item_cardapio?.nm_item ??
                                `Item #${item.id_item_cardapio}`}
                            </h4>

                            <p className="mt-1 text-sm text-[#786C6C]">
                              {item.qt_quantidade} ×{" "}
                              {formatarPreco(item.vl_unitario)}
                            </p>

                            {item.ds_observacao && (
                              <p className="mt-1 text-sm text-[#786C6C]">
                                Observação: {item.ds_observacao}
                              </p>
                            )}

                            <p className="mt-1 text-xs text-[#786C6C]">
                              Situação:{" "}
                              {item.id_situacao.replaceAll("_", " ")}
                            </p>
                          </div>

                          <p className="font-bold text-[#6F2438]">
                            {formatarPreco(obterSubtotal(item))}
                          </p>
                        </article>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-xl bg-[#F8F0F1] p-4">
                      <span className="font-semibold">
                        Total dos itens lançados
                      </span>
                      <span className="text-lg font-bold text-[#6F2438]">
                        {formatarPreco(totalComanda)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-[#E9DED6] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Cardápio disponível</h2>

            <p className="mt-1 text-sm text-[#786C6C]">
              Produtos disponíveis para lançamento em uma comanda.
            </p>

            {itens.length === 0 ? (
              <p className="mt-5 rounded-xl bg-[#FFFCF9] p-6 text-center text-sm text-[#786C6C]">
                Nenhum item disponível no momento.
              </p>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {itens.map((item) => (
                  <article
                    key={item.id_item_cardapio}
                    className="rounded-xl border border-[#E9DED6] p-4"
                  >
                    <h3 className="font-semibold">{item.nm_item}</h3>

                    {item.ds_item && (
                      <p className="mt-2 text-sm text-[#786C6C]">
                        {item.ds_item}
                      </p>
                    )}

                    <p className="mt-4 font-bold text-[#6F2438]">
                      {formatarPreco(item.vl_unitario)}
                    </p>

                    <p className="mt-1 text-xs text-[#786C6C]">
                      {item.tipo_item === "PREPARADO"
                        ? "Preparado na cozinha"
                        : "Item para revenda"}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setProdutoSelecionado(
                          String(item.id_item_cardapio)
                        )
                      }
                      disabled={comandaSelecionada === null}
                      className="mt-4 w-full rounded-lg border border-[#6F2438] px-3 py-2 text-sm font-semibold text-[#6F2438] transition hover:bg-[#F8F0F1] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {comandaSelecionada === null
                        ? "Selecione uma comanda primeiro"
                        : "Escolher este produto"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
