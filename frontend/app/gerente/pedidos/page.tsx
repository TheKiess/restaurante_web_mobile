
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPatch }                 from "@/lib/api";
import estilos                              from "@/componentes/Painel/Painel.module.css";
import estilosPagina                        from "./page.module.css";

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
  AGUARDANDO: estilos.seloAguardando,
  EM_PREPARO: estilos.seloEmPreparo,
  PRONTO: estilos.seloPronto,
  ENTREGUE: estilos.seloEntregue,
  CANCELADO: estilos.seloCancelado,
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
    <div className={estilos.pagina}>
      <header className={estilos.cabecalhoComAcao}>
        <div>
          <p className="sobretitulo">Operação do restaurante</p>
          <h1 className={estilos.titulo}>Pedidos</h1>
          <p className={estilos.descricao}>
            Consulte os pedidos e atualize a situação de cada item.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void carregarPedidos()}
          disabled={carregando}
          className={`${estilos.botao} ${estilos.botaoSecundario}`}
        >
          {carregando ? "Atualizando..." : "↻ Atualizar pedidos"}
        </button>
      </header>

      {erro && (
        <div role="alert" className={`${estilos.alerta} ${estilos.alertaErro}`}>
          <strong>Não foi possível concluir a operação.</strong>
          <p className={`${estilos.quebraPalavra} ${estilos.espacoTopo}`}>{erro}</p>
        </div>
      )}

      {sucesso && (
        <div role="status" className={`${estilos.alerta} ${estilos.alertaSucesso}`}>
          {sucesso}
        </div>
      )}

      <section>
        <h2 className={estilos.tituloSecao}>Situação dos itens</h2>

        <div className={estilosPagina.situacoes}>
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
                className={`${estilosPagina.situacao} ${
                  filtro === situacao ? estilosPagina.situacaoAtiva : ""
                }`}
              >
                <p className={estilosPagina.situacaoRotulo}>
                  {nomesSituacao[situacao]}
                </p>

                <p className={estilosPagina.situacaoValor}>
                  {carregando ? "—" : quantidade}
                </p>

                <span className={`${estilos.seloEstado} ${estilosSituacao[situacao]}`}>
                  {filtro === situacao ? "Filtro ativo" : "Ver itens"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className={`${estilos.linhaCabecalho} ${estilos.espacoBaixo}`}>
          <div>
            <h2 className={estilos.tituloCartao}>Lista de pedidos</h2>
            <p className={estilos.subtituloCartao}>
              Os itens estão agrupados por comanda.
            </p>
          </div>

          <label className={estilosPagina.filtroSituacao}>
            Filtrar situação
            <select
              value={filtro}
              onChange={(event) =>
                setFiltro(event.target.value as "TODOS" | Situacao)
              }
              className={estilos.entrada}
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
          <div className={`${estilos.cartao} ${estilos.carregando}`}>
            Carregando pedidos da API...
          </div>
        ) : itensFiltrados.length === 0 ? (
          <div className={`${estilos.cartao} ${estilos.vazio}`}>
            <p className={estilos.vazioTitulo}>Nenhum item encontrado</p>
          </div>
        ) : (
          <div className={estilos.comandas}>
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
                <article key={idComanda} className={estilos.comanda}>
                  <header className={estilos.comandaCabecalho}>
                    <div>
                      <h3 className={estilos.comandaTitulo}>
                        Comanda #{idComanda}
                      </h3>
                      <p className={estilos.subtituloCartao}>
                        {numeroMesa != null
                          ? `Mesa ${numeroMesa}`
                          : "Mesa não informada"}{" "}
                        · {itensComanda.length}{" "}
                        {itensComanda.length === 1 ? "item" : "itens"}
                      </p>
                    </div>

                    <div className={estilos.comandaTotal}>
                      <p className={estilos.subtituloCartao}>
                        Total dos itens exibidos
                      </p>
                      <p className={estilos.comandaTotalValor}>{moeda(total)}</p>
                    </div>
                  </header>

                  <div>
                    {itensComanda.map((item) => {
                      const permitidas = proximasSituacoes[item.id_situacao];

                      return (
                        <div key={item.id_item_pedido} className={estilos.itemComanda}>
                          <div className={estilos.itemComandaInfo}>
                            <div className={estilos.itemComandaTitulo}>
                              <h4>
                                {item.item_cardapio?.nm_item ??
                                  `Item #${item.id_item_pedido}`}
                              </h4>

                              <span
                                className={`${estilos.seloEstado} ${estilosSituacao[item.id_situacao]}`}
                              >
                                {nomesSituacao[item.id_situacao]}
                              </span>
                            </div>

                            <p className={estilos.itemComandaTexto}>
                              Pedido #{item.id_item_pedido} · Quantidade:{" "}
                              {item.qt_quantidade} · Unitário:{" "}
                              {moeda(Number(item.vl_unitario) || 0)}
                            </p>

                            <p className={estilos.itemComandaTexto}>
                              {dataHora(item.dt_pedido)}
                            </p>

                            {item.ds_observacao && (
                              <p className={estilos.observacao}>
                                <strong>Observação:</strong>{" "}
                                {item.ds_observacao}
                              </p>
                            )}
                          </div>

                          <div className={estilos.acoesItem}>
                            {permitidas.length === 0 ? (
                              <span className={estilos.textoSuave}>
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
                                  className={`${estilos.botao} ${estilos.botaoPequeno} ${
                                    novaSituacao === "CANCELADO"
                                      ? estilos.botaoPerigo
                                      : estilos.botaoPrimario
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
