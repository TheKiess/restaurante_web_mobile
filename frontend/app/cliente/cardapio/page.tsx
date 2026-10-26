
"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet }                       from "@/lib/api";
import Link                             from "next/link";
import { ArrowLeft }                    from "lucide-react";
import estilos                          from "@/componentes/Painel/Painel.module.css";
import estilosPagina                    from "./page.module.css";

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
    <div className={estilos.pagina}>
      <section className={estilos.destaque}>
        <p className="sobretitulo">Nosso restaurante</p>
        <h1 className={estilos.titulo}>Nosso cardápio</h1>
        <p className={estilos.descricao}>
          Explore nossos pratos, escolha seus favoritos e monte seu pedido.
        </p>
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

      <div className={estilosPagina.busca}>
        <label htmlFor="busca-cardapio" className={estilos.rotulo}>
          Buscar no cardápio
        </label>

        <input
          id="busca-cardapio"
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Digite o nome de um prato..."
          className={estilos.entrada}
        />
      </div>

      <div className={estilosPagina.chips}>
        {["Todas", ...categorias].map((categoria) => (
          <button
            key={categoria}
            type="button"
            onClick={() => setCategoriaSelecionada(categoria)}
            aria-pressed={categoriaSelecionada === categoria}
            className={`${estilosPagina.chip} ${
              categoriaSelecionada === categoria ? estilosPagina.chipAtivo : ""
            }`}
          >
            {categoria}
          </button>
        ))}
      </div>

      {carregando ? (
        <p className={estilos.carregando}>Carregando cardápio...</p>
      ) : erro ? (
        <div role="alert" className={`${estilos.cartao} ${estilos.textoCentro}`}>
          <p className={estilos.textoErro}>
            Não foi possível carregar os produtos.
          </p>
          <p className={`${estilos.subtituloCartao} ${estilos.quebraPalavra}`}>
            {erro}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.espacoTopo}`}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className={estilosPagina.layout}>
          <section>
            <div className={`${estilos.linhaCabecalho} ${estilos.espacoBaixo}`}>
              <h2 className={estilos.tituloCartao}>Nossos produtos</h2>
              <span className={estilos.textoSuave}>
                {itensFiltrados.length} encontrado(s)
              </span>
            </div>

            {itensFiltrados.length === 0 ? (
              <div className={`${estilos.cartao} ${estilos.textoCentro}`}>
                Nenhum produto disponível encontrado.
              </div>
            ) : (
              <div className={estilosPagina.gradeProdutos}>
                {itensFiltrados.map((item) => (
                  <article
                    key={item.id_item_cardapio}
                    className={estilosPagina.produto}
                  >
                    <span
                      className={`${estilos.seloPonto} ${estilosPagina.etiquetaCategoria}`}
                    >
                      {item.categoria.nm_categoria}
                    </span>

                    <h3 className={estilos.tituloItem}>{item.nm_item}</h3>

                    <p className={estilosPagina.produtoDescricao}>
                      {item.ds_item ||
                        "Uma opção deliciosa do nosso cardápio."}
                    </p>

                    <div className={estilosPagina.produtoRodape}>
                      <span className={estilosPagina.preco}>
                        {formatarPreco(item.vl_unitario)}
                      </span>

                      <button
                        type="button"
                        onClick={() => adicionarAoCarrinho(item)}
                        className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.botaoPequeno}`}
                      >
                        + Adicionar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className={estilosPagina.carrinho}>
            <div className={estilos.linhaCabecalho}>
              <h2 className={estilos.tituloCartao}>Seu carrinho</h2>
              <span className={estilos.seloPonto}>{totalItens}</span>
            </div>

            {carrinho.length === 0 ? (
              <p className={estilos.carregando}>
                Seu carrinho está vazio. Adicione um produto para começar!
              </p>
            ) : (
              <>
                <div className={estilosPagina.linhasCarrinho}>
                  {carrinho.map((linha) => (
                    <div
                      key={linha.item.id_item_cardapio}
                      className={estilosPagina.linhaCarrinho}
                    >
                      <div className={estilosPagina.linhaCarrinhoTopo}>
                        <div>
                          <p className={estilos.negrito}>{linha.item.nm_item}</p>
                          <p className={estilos.subtituloCartao}>
                            {formatarPreco(linha.item.vl_unitario)} cada
                          </p>
                        </div>

                        <p className={`${estilos.negrito} ${estilos.semQuebra}`}>
                          {formatarPreco(
                            Number(linha.item.vl_unitario) * linha.quantidade
                          )}
                        </p>
                      </div>

                      <div className={estilosPagina.quantidade}>
                        <button
                          type="button"
                          aria-label={`Diminuir quantidade de ${linha.item.nm_item}`}
                          onClick={() =>
                            alterarQuantidade(linha.item.id_item_cardapio, -1)
                          }
                          className={estilosPagina.botaoQuantidade}
                        >
                          −
                        </button>

                        <span className={estilosPagina.valorQuantidade}>
                          {linha.quantidade}
                        </span>

                        <button
                          type="button"
                          aria-label={`Aumentar quantidade de ${linha.item.nm_item}`}
                          onClick={() =>
                            alterarQuantidade(linha.item.id_item_cardapio, 1)
                          }
                          className={estilosPagina.botaoQuantidade}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={estilos.linhaTotal}>
                  <span>Total</span>
                  <span className={estilos.valorDestaque}>
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
                  className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.larguraCompleta} ${estilos.espacoTopo}`}
                >
                  Continuar pedido
                </button>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
