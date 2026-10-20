
"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Categoria {
  id_categoria: number;
  nm_categoria: string;
}

interface ItemCardapio {
  id_item_cardapio: number;
  nm_item: string;
  ds_item: string | null;
  vl_unitario: number | string;
  disponivel: boolean;
  categoria: Categoria;
}

interface ItemCarrinho {
  item: ItemCardapio;
  quantidade: number;
}

function formatarPreco(valor: number | string) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function CardapioClientePage() {
  const [itens, setItens] = useState<ItemCardapio[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState("Todas");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarCardapio() {
      try {
        setErro("");

        const dados =
          await apiGet<ItemCardapio[]>("itens-cardapio");

        setItens(dados);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o cardápio."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarCardapio();
  }, []);

  const categorias = useMemo(() => {
    return Array.from(
      new Set(
        itens
          .filter((item) => item.disponivel)
          .map((item) => item.categoria.nm_categoria)
      )
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [itens]);

  const itensFiltrados = useMemo(() => {
    return itens.filter((item) => {
      const correspondeBusca =
        item.nm_item
          .toLocaleLowerCase("pt-BR")
          .includes(busca.toLocaleLowerCase("pt-BR")) ||
        (item.ds_item ?? "")
          .toLocaleLowerCase("pt-BR")
          .includes(busca.toLocaleLowerCase("pt-BR"));

      const correspondeCategoria =
        categoriaSelecionada === "Todas" ||
        item.categoria.nm_categoria === categoriaSelecionada;

      return (
        item.disponivel &&
        correspondeBusca &&
        correspondeCategoria
      );
    });
  }, [itens, busca, categoriaSelecionada]);

  const totalItens = carrinho.reduce(
    (total, linha) => total + linha.quantidade,
    0
  );

  const valorTotal = carrinho.reduce(
    (total, linha) =>
      total +
      Number(linha.item.vl_unitario) * linha.quantidade,
    0
  );

  function adicionarAoCarrinho(item: ItemCardapio) {
    setCarrinho((atual) => {
      const existente = atual.find(
        (linha) =>
          linha.item.id_item_cardapio === item.id_item_cardapio
      );

      if (existente) {
        return atual.map((linha) =>
          linha.item.id_item_cardapio === item.id_item_cardapio
            ? { ...linha, quantidade: linha.quantidade + 1 }
            : linha
        );
      }

      return [...atual, { item, quantidade: 1 }];
    });
  }

  function alterarQuantidade(id: number, variacao: number) {
    setCarrinho((atual) =>
      atual
        .map((linha) =>
          linha.item.id_item_cardapio === id
            ? {
                ...linha,
                quantidade: linha.quantidade + variacao,
              }
            : linha
        )
        .filter((linha) => linha.quantidade > 0)
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F4EF] px-4 py-8 text-[#3F302D] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-2xl bg-[#6F2438] p-6 text-[#F5E9DC] shadow-sm sm:p-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#E8C9B8]">
            Nosso restaurante
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Nosso cardápio
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-[#F5E9DC]/90 sm:text-base">
            Explore nossos pratos, escolha seus favoritos e
            monte seu pedido.
          </p>
        </section>
        <div className="mb-6 text-[#F5E9DC]" >
            <Link
                href="/cliente"
                className="inline-flex items-center gap-2 rounded-lg border border-[#DED2C8] bg-white px-4 py-2.5 text-sm font-semibold !text-[#6F2438] transition hover:bg-[#F5E9DC]"
            >
                <ArrowLeft className="h-4 w-4" />
                    Voltar para o início
            </Link>
        </div>

        <div className="mb-6">
          <label
            htmlFor="busca-cardapio"
            className="mb-2 block text-sm font-semibold"
          >
            Buscar no cardápio
          </label>

          <input
            id="busca-cardapio"
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite o nome de um prato..."
            className="w-full rounded-xl border border-[#DED2C8] bg-white px-4 py-3 outline-none transition focus:border-[#6F2438] focus:ring-2 focus:ring-[#6F2438]/15"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {["Todas", ...categorias].map((categoria) => (
            <button
              key={categoria}
              type="button"
              onClick={() => setCategoriaSelecionada(categoria)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                categoriaSelecionada === categoria
                  ? "border-[#6F2438] bg-[#6F2438] text-[#F5E9DC]"
                  : "border-[#DED2C8] bg-white text-[#6F2438] hover:bg-[#F0E5DC]"
              }`}
            >
              {categoria}
            </button>
          ))}
        </div>

        {carregando ? (
          <p className="py-12 text-center text-[#77685E]">
            Carregando cardápio...
          </p>
        ) : erro ? (
          <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
            <p className="font-semibold text-red-700">
              Não foi possível carregar os produtos.
            </p>
            <p className="mt-2 break-words text-sm text-[#77685E]">
              {erro}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-[#6F2438] px-4 py-2 text-[#F5E9DC]"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold">
                  Nossos produtos
                </h2>
                <span className="text-sm text-[#77685E]">
                  {itensFiltrados.length} encontrado(s)
                </span>
              </div>

              {itensFiltrados.length === 0 ? (
                <div className="rounded-xl border border-[#DED2C8] bg-white p-8 text-center">
                  Nenhum produto disponível encontrado.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {itensFiltrados.map((item) => (
                    <article
                      key={item.id_item_cardapio}
                      className="flex flex-col rounded-2xl border border-[#E8DDD3] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <span className="mb-3 w-fit rounded-full bg-[#F5E9DC] px-3 py-1 text-xs font-semibold text-[#6F2438]">
                        {item.categoria.nm_categoria}
                      </span>

                      <h3 className="text-lg font-bold">
                        {item.nm_item}
                      </h3>

                      <p className="mt-2 min-h-12 flex-1 text-sm leading-relaxed text-[#77685E]">
                        {item.ds_item ||
                          "Uma opção deliciosa do nosso cardápio."}
                      </p>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="font-bold text-[#6F2438]">
                          {formatarPreco(item.vl_unitario)}
                        </span>

                        <button
                          type="button"
                          onClick={() => adicionarAoCarrinho(item)}
                          className="rounded-lg bg-[#6F2438] px-3 py-2 text-sm font-semibold text-[#F5E9DC] transition hover:bg-[#541A2A]"
                        >
                          + Adicionar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <aside className="rounded-2xl border border-[#E8DDD3] bg-white p-5 shadow-sm lg:sticky lg:top-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Seu carrinho</h2>
                <span className="rounded-full bg-[#F5E9DC] px-3 py-1 text-sm font-semibold text-[#6F2438]">
                  {totalItens}
                </span>
              </div>

              {carrinho.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#77685E]">
                  Seu carrinho está vazio. Adicione um produto
                  para começar!
                </p>
              ) : (
                <>
                  <div className="mt-5 space-y-4">
                    {carrinho.map((linha) => (
                      <div
                        key={linha.item.id_item_cardapio}
                        className="border-b border-[#EEE5DD] pb-4"
                      >
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {linha.item.nm_item}
                            </p>
                            <p className="mt-1 text-sm text-[#77685E]">
                              {formatarPreco(linha.item.vl_unitario)}
                              {" "}cada
                            </p>
                          </div>

                          <p className="whitespace-nowrap text-sm font-semibold">
                            {formatarPreco(
                              Number(linha.item.vl_unitario) *
                                linha.quantidade
                            )}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <button
                            type="button"
                            aria-label={`Diminuir quantidade de ${linha.item.nm_item}`}
                            onClick={() =>
                              alterarQuantidade(
                                linha.item.id_item_cardapio,
                                -1
                              )
                            }
                            className="h-8 w-8 rounded-lg border border-[#DED2C8] text-lg"
                          >
                            −
                          </button>

                          <span className="min-w-4 text-center text-sm font-semibold">
                            {linha.quantidade}
                          </span>

                          <button
                            type="button"
                            aria-label={`Aumentar quantidade de ${linha.item.nm_item}`}
                            onClick={() =>
                              alterarQuantidade(
                                linha.item.id_item_cardapio,
                                1
                              )
                            }
                            className="h-8 w-8 rounded-lg border border-[#DED2C8] text-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-[#6F2438]">
                      {formatarPreco(valorTotal)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "Carrinho preparado! A próxima etapa será integrar a finalização ao backend."
                      )
                    }
                    className="mt-5 w-full rounded-xl bg-[#6F2438] px-4 py-3 font-semibold text-[#F5E9DC] transition hover:bg-[#541A2A]"
                  >
                    Continuar pedido
                  </button>
                </>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
