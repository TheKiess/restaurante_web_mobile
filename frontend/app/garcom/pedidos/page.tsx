"use client";

import Link                                 from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost }                  from "@/lib/api";
import estilos                              from "@/componentes/Painel/Painel.module.css";

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

function obterSubtotal(item: ItemPedido)
{
  return Number(item.vl_unitario) * item.qt_quantidade;
}

export default function PedidosPage()
{
  const [comandas, setComandas]                           = useState<Comanda[]>([]);
  const [mesas, setMesas]                                 = useState<Mesa[]>([]);
  const [itens, setItens]                                 = useState<ItemCardapio[]>([]);
  const [itensPedido, setItensPedido]                     = useState<ItemPedido[]>([]);
  const [tipoAtendimento, setTipoAtendimento]             = useState<TipoAtendimento>("MESA");
  const [mesaSelecionada, setMesaSelecionada]             = useState("");
  const [comandaSelecionada, setComandaSelecionada]       = useState<number | null>(null);
  const [produtoSelecionado, setProdutoSelecionado]       = useState("");
  const [quantidade, setQuantidade]                       = useState("1");
  const [observacao, setObservacao]                       = useState("");
  const [carregando, setCarregando]                       = useState(true);
  const [carregandoItensPedido, setCarregandoItensPedido] = useState(false);
  const [enviandoPedido, setEnviandoPedido]               = useState(false);
  const [erro, setErro]                                   = useState("");
  const [sucesso, setSucesso]                             = useState("");
  const carregarDados                                     = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try
    {
      const [dadosComandas, dadosItens, dadosMesas] =
        await Promise.all([
          apiGet<Comanda[]>("comandas?id_situacao=ABERTA"),
          apiGet<ItemCardapio[]>("itens-cardapio"),
          apiGet<Mesa[]>("mesas"),
        ]);

      setComandas(dadosComandas);

      setMesas([...dadosMesas].sort((a, b) => a.nr_mesa - b.nr_mesa));

      setItens(dadosItens.filter((item) => item.disponivel)
        .sort((a, b) => a.nm_item.localeCompare(b.nm_item, "pt-BR"))
      );

      setMesaSelecionada((selecionada) => {
        const mesaAtual = dadosMesas.find((mesa) => String(mesa.id_mesa) === selecionada);

        if (!mesaAtual)
          return selecionada;

        const ocupada = dadosComandas.some((comanda) => comanda.mesa?.id_mesa === mesaAtual.id_mesa);

        return ocupada ? "" : selecionada;
      });

      setComandaSelecionada((selecionada) => {
        if (selecionada !== null &&
          !dadosComandas.some((comanda) => comanda.id_comanda === selecionada)
        )
        {
          setItensPedido([]);
          return null;
        }

        return selecionada;
      });
    }
    catch (error)
    {
      setErro(error instanceof Error
        ? error.message
        : "Não foi possível carregar os dados."
      );
    }
    finally
    {
      setCarregando(false);
    }
  }, []);

  const carregarItensPedido = useCallback(async (idComanda: number) => {
    setCarregandoItensPedido(true);
    setErro("");
    setSucesso("");

    try
    {
      const dados = await apiGet<ItemPedido[]>(`itens-pedido?id_comanda=${idComanda}`);

      setItensPedido(dados);
    }
    catch (error)
    {
      setErro(error instanceof Error
        ? error.message
        : "Não foi possível carregar os itens da comanda."
      );
      setItensPedido([]);
    }
    finally
    {
      setCarregandoItensPedido(false);
    }
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  const mesasOcupadas = new Set(comandas.map((comanda) => comanda.mesa?.id_mesa)
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

  function alterarTipoAtendimento(tipo: TipoAtendimento)
  {
    setTipoAtendimento(tipo);
    setMesaSelecionada("");
    setErro("");
    setSucesso("");
  }

  function prepararAbertura() {
    setErro("");
    setSucesso("");

    if (tipoAtendimento === "MESA" && !mesaSelecionada)
    {
      setErro("Selecione uma mesa disponível.");
      return;
    }
  }

  async function selecionarComanda(comanda: Comanda)
  {
    setComandaSelecionada(comanda.id_comanda);
    setProdutoSelecionado("");
    setQuantidade("1");
    setObservacao("");
    setItensPedido([]);
    setErro("");
    setSucesso("");

    await carregarItensPedido(comanda.id_comanda);
  }

  async function adicionarItem()
  {
    setErro("");
    setSucesso("");

    if (comandaSelecionada === null)
    {
      setErro("Selecione uma comanda aberta antes de lançar um item.");
      return;
    }

    if (!produtoSelecionado)
    {
      setErro("Selecione um produto do cardápio.");
      return;
    }

    const quantidadeNumero = Number(quantidade);

    if (!Number.isInteger(quantidadeNumero) ||
      quantidadeNumero < 1 ||
      quantidadeNumero > 99
    )
    {
      setErro("A quantidade deve ser um número inteiro entre 1 e 99.");
      return;
    }

    if (observacao.trim().length > 200)
    {
      setErro("A observação deve ter no máximo 200 caracteres.");
      return;
    }

    setEnviandoPedido(true);

    try
    {
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
    }
    catch (error)
    {
      setErro(error instanceof Error
        ? error.message
        : "Não foi possível adicionar o item à comanda."
      );
    }
    finally
    {
      setEnviandoPedido(false);
    }
  }

  return (
    <div className={estilos.pagina}>
      <header>
        <p className="sobretitulo">Atendimento</p>
        <h1 className={estilos.titulo}>Pedidos</h1>
        <p className={estilos.descricao}>
          Consulte as comandas abertas e registre os itens dos pedidos.
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

      {erro && (
        <div role="alert" className={`${estilos.alerta} ${estilos.alertaErro}`}>
          {erro}
          <button
            type="button"
            onClick={() => void carregarDados()}
            className={estilos.linkTexto}
          >
            Atualizar dados
          </button>
        </div>
      )}

      {sucesso && (
        <div role="status" className={`${estilos.alerta} ${estilos.alertaSucesso}`}>
          {sucesso}
        </div>
      )}

      {carregando ? (
        <div className={`${estilos.cartao} ${estilos.carregando}`}>
          Carregando comandas, mesas e cardápio...
        </div>
      ) : (
        <>
          <section className={estilos.cartao}>
            <h2 className={estilos.tituloCartao}>Nova comanda</h2>

            <p className={estilos.subtituloCartao}>
              Escolha o tipo de atendimento para preparar a abertura.
            </p>

            <div className={estilos.gradeCartoes}>
              <button
                type="button"
                onClick={() => alterarTipoAtendimento("MESA")}
                aria-pressed={tipoAtendimento === "MESA"}
                className={`${estilos.cartaoOpcao} ${
                  tipoAtendimento === "MESA" ? estilos.cartaoOpcaoAtiva : ""
                }`}
              >
                <span className={estilos.opcaoTitulo}>Atendimento em mesa</span>
                <span className={estilos.opcaoTexto}>
                  Escolher uma mesa disponível.
                </span>
              </button>

              <button
                type="button"
                onClick={() => alterarTipoAtendimento("RETIRADA")}
                aria-pressed={tipoAtendimento === "RETIRADA"}
                className={`${estilos.cartaoOpcao} ${
                  tipoAtendimento === "RETIRADA" ? estilos.cartaoOpcaoAtiva : ""
                }`}
              >
                <span className={estilos.opcaoTitulo}>Retirada / sem mesa</span>
                <span className={estilos.opcaoTexto}>
                  Pedido sem vínculo com uma mesa.
                </span>
              </button>
            </div>

            {tipoAtendimento === "MESA" && (
              <div className={`${estilos.campoLargo} ${estilos.espacoTopo}`}>
                <label htmlFor="mesa" className={estilos.rotulo}>
                  Mesa disponível
                </label>

                <select
                  id="mesa"
                  value={mesaSelecionada}
                  onChange={(evento) => setMesaSelecionada(evento.target.value)}
                  className={estilos.entrada}
                >
                  <option value="">Selecione uma mesa</option>

                  {mesasDisponiveis.map((mesa) => (
                    <option key={mesa.id_mesa} value={mesa.id_mesa}>
                      Mesa {mesa.nr_mesa} — {mesa.qt_lugares} lugares
                    </option>
                  ))}
                </select>

                {mesasDisponiveis.length === 0 && (
                  <p className={estilos.avisoTexto}>
                    Não há mesas aparentemente disponíveis. Você ainda pode
                    selecionar retirada.
                  </p>
                )}
              </div>
            )}

            {tipoAtendimento === "RETIRADA" && (
              <p className={`${estilos.observacao} ${estilos.espacoTopo}`}>
                A comanda será criada sem informar o campo id_mesa.
              </p>
            )}

            <button
              type="button"
              onClick={prepararAbertura}
              className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.espacoTopo}`}
            >
              Preparar abertura da comanda
            </button>
          </section>

          <section className={estilos.cartao}>
            <div className={estilos.linhaCabecalho}>
              <div>
                <h2 className={estilos.tituloCartao}>Comandas abertas</h2>
                <p className={estilos.subtituloCartao}>
                  {comandas.length} comanda(s) encontrada(s)
                </p>
              </div>

              <button
                type="button"
                onClick={() => void carregarDados()}
                disabled={carregando}
                className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
              >
                Atualizar
              </button>
            </div>

            {comandas.length === 0 ? (
              <div className={`${estilos.vazio} ${estilos.vazioBorda} ${estilos.espacoTopo}`}>
                <h3 className={estilos.vazioTitulo}>Nenhuma comanda aberta</h3>
              </div>
            ) : (
              <div className={estilos.gradeCartoesTres}>
                {comandas.map((comanda) => {
                  const selecionada = comandaSelecionada === comanda.id_comanda;

                  return (
                    <article
                      key={comanda.id_comanda}
                      className={`${estilos.cartaoInterno} ${
                        selecionada ? estilos.cartaoOpcaoAtiva : ""
                      }`}
                    >
                      <p className={estilos.negrito}>
                        Comanda #{comanda.id_comanda}
                      </p>

                      <p className={estilos.subtituloCartao}>
                        {comanda.mesa
                          ? `Mesa ${comanda.mesa.nr_mesa}`
                          : "Retirada / sem mesa"}
                      </p>

                      <button
                        type="button"
                        onClick={() => void selecionarComanda(comanda)}
                        disabled={carregandoItensPedido}
                        className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.botaoPequeno} ${estilos.larguraCompleta} ${estilos.espacoTopo}`}
                      >
                        {selecionada ? "Comanda selecionada" : "Selecionar comanda"}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {comandaSelecionada !== null && (
            <section className={estilos.cartao}>
              <h2 className={estilos.tituloCartao}>
                Lançar itens — Comanda #{comandaSelecionada}
              </h2>

              <p className={estilos.subtituloCartao}>
                Escolha o produto, informe a quantidade e, se necessário,
                adicione uma observação para a cozinha.
              </p>

              <div className={estilos.formularioGrade}>
                <div className={estilos.larguraTotal}>
                  <label htmlFor="produto" className={estilos.rotulo}>
                    Produto
                  </label>

                  <select
                    id="produto"
                    value={produtoSelecionado}
                    onChange={(evento) => setProdutoSelecionado(evento.target.value)}
                    className={estilos.entrada}
                  >
                    <option value="">Selecione um produto</option>

                    {itens.map((item) => (
                      <option key={item.id_item_cardapio} value={item.id_item_cardapio}>
                        {item.nm_item} — {formatarPreco(item.vl_unitario)}
                      </option>
                    ))}
                  </select>
                </div>

                {produtoEscolhido && (
                  <div className={`${estilos.observacao} ${estilos.larguraTotal}`}>
                    <p className={estilos.negrito}>{produtoEscolhido.nm_item}</p>
                    <p className={estilos.subtituloCartao}>
                      Preço unitário: {formatarPreco(produtoEscolhido.vl_unitario)}
                    </p>
                    <p className={estilos.subtituloCartao}>
                      {produtoEscolhido.tipo_item === "PREPARADO"
                        ? "Será enviado para preparação na cozinha."
                        : "Item registrado como pronto."}
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="quantidade" className={estilos.rotulo}>
                    Quantidade
                  </label>

                  <input
                    id="quantidade"
                    type="number"
                    min={1}
                    max={99}
                    step={1}
                    value={quantidade}
                    onChange={(evento) => setQuantidade(evento.target.value)}
                    className={estilos.entrada}
                  />
                </div>

                <div>
                  <label htmlFor="observacao" className={estilos.rotulo}>
                    Observação (opcional)
                  </label>

                  <input
                    id="observacao"
                    type="text"
                    maxLength={200}
                    value={observacao}
                    onChange={(evento) => setObservacao(evento.target.value)}
                    placeholder="Ex.: sem cebola"
                    className={estilos.entrada}
                  />

                  <p className={estilos.textoPequeno}>
                    {observacao.length}/200 caracteres
                  </p>
                </div>
              </div>

              {produtoEscolhido && (
                <p className={`${estilos.textoDireita} ${estilos.subtituloCartao} ${estilos.espacoTopo}`}>
                  Subtotal estimado:{" "}
                  <span className={estilos.valorDestaque}>
                    {formatarPreco(
                      Number(produtoEscolhido.vl_unitario) * (Number(quantidade) || 0)
                    )}
                  </span>
                </p>
              )}

              <button
                type="button"
                onClick={() => void adicionarItem()}
                disabled={enviandoPedido || carregandoItensPedido}
                className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.espacoTopo}`}
              >
                {enviandoPedido ? "Adicionando item..." : "Adicionar à comanda"}
              </button>

              <div className={estilos.secaoSeparada}>
                <div className={estilos.linhaCabecalho}>
                  <h3 className={estilos.tituloCartao}>Itens lançados</h3>

                  <button
                    type="button"
                    onClick={() => void carregarItensPedido(comandaSelecionada)}
                    disabled={carregandoItensPedido}
                    className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
                  >
                    Atualizar itens
                  </button>
                </div>

                {carregandoItensPedido ? (
                  <p className={estilos.carregando}>Carregando itens da comanda...</p>
                ) : itensPedido.length === 0 ? (
                  <p className={`${estilos.observacao} ${estilos.textoCentro}`}>
                    Nenhum item foi lançado nesta comanda.
                  </p>
                ) : (
                  <>
                    <div className={estilos.listaItens}>
                      {itensPedido.map((item) => (
                        <article key={item.id_item_pedido} className={estilos.itemLancado}>
                          <div>
                            <h4 className={estilos.tituloItem}>
                              {item.item_cardapio?.nm_item ?? `Item #${item.id_item_cardapio}`}
                            </h4>

                            <p className={estilos.subtituloCartao}>
                              {item.qt_quantidade} × {formatarPreco(item.vl_unitario)}
                            </p>

                            {item.ds_observacao && (
                              <p className={estilos.subtituloCartao}>
                                Observação: {item.ds_observacao}
                              </p>
                            )}

                            <p className={estilos.textoPequeno}>
                              Situação: {item.id_situacao.replaceAll("_", " ")}
                            </p>
                          </div>

                          <p className={estilos.valorDestaque}>
                            {formatarPreco(obterSubtotal(item))}
                          </p>
                        </article>
                      ))}
                    </div>

                    <div className={estilos.linhaTotal}>
                      <span>Total dos itens lançados</span>
                      <span className={estilos.valorDestaque}>
                        {formatarPreco(totalComanda)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          <section className={estilos.cartao}>
            <h2 className={estilos.tituloCartao}>Cardápio disponível</h2>

            <p className={estilos.subtituloCartao}>
              Produtos disponíveis para lançamento em uma comanda.
            </p>

            {itens.length === 0 ? (
              <p className={`${estilos.observacao} ${estilos.textoCentro}`}>
                Nenhum item disponível no momento.
              </p>
            ) : (
              <div className={estilos.gradeCartoesTres}>
                {itens.map((item) => (
                  <article key={item.id_item_cardapio} className={estilos.cartaoInterno}>
                    <h3 className={estilos.tituloItem}>{item.nm_item}</h3>

                    {item.ds_item && (
                      <p className={estilos.subtituloCartao}>{item.ds_item}</p>
                    )}

                    <p className={`${estilos.valorDestaque} ${estilos.espacoTopo}`}>
                      {formatarPreco(item.vl_unitario)}
                    </p>

                    <p className={estilos.textoPequeno}>
                      {item.tipo_item === "PREPARADO"
                        ? "Preparado na cozinha"
                        : "Item para revenda"}
                    </p>

                    <button
                      type="button"
                      onClick={() => setProdutoSelecionado(String(item.id_item_cardapio))}
                      disabled={comandaSelecionada === null}
                      className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno} ${estilos.larguraCompleta} ${estilos.espacoTopo}`}
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
    </div>
  );
}
