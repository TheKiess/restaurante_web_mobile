"use client";

import { useCallback, useState }           from "react";
import Link                                from "next/link";
import { apiGet, apiPatch }                from "@/lib/api";
import {
  OBJ_NOMES_FORMA_PAGAMENTO,
  OBJ_NOMES_SITUACAO_ITEM,
  OBJ_NOMES_SITUACAO_PAGAMENTO,
}                                          from "@/lib/constantes";
import { formatarDataHora, formatarMoeda } from "@/lib/formatar";
import { useCarregarAoMontar }             from "@/lib/useCarregarAoMontar";
import estilos                             from "@/componentes/Painel/Painel.module.css";

type Situacao = "ABERTA" | "FECHADA" | "CANCELADA";
type Filtro = Situacao | "TODAS";

interface Comanda {
  id_comanda: number;
  id_situacao: Situacao;
  dt_abertura: string;
  dt_fechamento: string | null;
  mesa: { nr_mesa: number } | null;
}

interface ComandaDetalhe extends Comanda
{
  usuario: { pessoa: { nm_pessoa: string } } | null;
  itens: {
    id_item_pedido: number;
    qt_quantidade: number;
    vl_unitario: string;
    id_situacao: string;
    ds_observacao: string | null;
    item_cardapio: { nm_item: string };
  }[];
  pagamentos: {
    id_pagamento: number;
    vl_pago: string;
    forma_pagamento: string;
    id_situacao: string;
  }[];
  vl_total: string;
  vl_pago: string;
  vl_restante: string;
}

const OBJ_NOMES_SITUACAO_COMANDA: Record<Situacao, string> = {
  ABERTA: "Aberta",
  FECHADA: "Fechada",
  CANCELADA: "Cancelada",
};

const OBJ_ESTILOS_SITUACAO_COMANDA: Record<Situacao, string> = {
  ABERTA: estilos.seloPronto,
  FECHADA: estilos.seloEntregue,
  CANCELADA: estilos.seloCancelado,
};

const ARR_FILTROS: { dsFiltro: Filtro; nmRotulo: string }[] = [
  { dsFiltro: "ABERTA", nmRotulo: "Abertas" },
  { dsFiltro: "FECHADA", nmRotulo: "Fechadas" },
  { dsFiltro: "CANCELADA", nmRotulo: "Canceladas" },
  { dsFiltro: "TODAS", nmRotulo: "Todas" },
];

function lerMensagemDoErro(erro: unknown, dsPadrao: string): string
{
  return erro instanceof Error && erro.message ? erro.message : dsPadrao;
}

export default function ComandasPage()
{
  const [arrComandas, setArrComandas]             = useState<Comanda[]>([]);
  const [dsFiltro, setDsFiltro]                   = useState<Filtro>("ABERTA");
  const [carregando, setCarregando]               = useState(true);
  const [dsErro, setDsErro]                       = useState("");
  const [dsSucesso, setDsSucesso]                 = useState("");
  const [nrComandaAberta, setNrComandaAberta]     = useState<number | null>(null);
  const [detalhe, setDetalhe]                     = useState<ComandaDetalhe | null>(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
  const [nrComandaEmAcao, setNrComandaEmAcao]     = useState<number | null>(null);
  const carregarComandas                          = useCallback(async () => {
    setCarregando(true);
    setDsErro("");

    try
    {
      setArrComandas(await apiGet<Comanda[]>("comandas"));
    }
    catch (erro)
    {
      setDsErro(lerMensagemDoErro(erro, "Não foi possível carregar as comandas."));
    }
    finally
    {
      setCarregando(false);
    }
  }, []);

  useCarregarAoMontar(carregarComandas);

  async function carregarDetalhe(nrIdComanda: number)
  {
    setCarregandoDetalhe(true);

    try
    {
      setDetalhe(await apiGet<ComandaDetalhe>(`comandas/${nrIdComanda}`));
    }
    catch (erro)
    {
      setDsErro(lerMensagemDoErro(erro, "Não foi possível carregar os detalhes da comanda."));
      setDetalhe(null);
    }
    finally
    {
      setCarregandoDetalhe(false);
    }
  }

  async function alternarDetalhe(nrIdComanda: number)
  {
    if (nrComandaAberta === nrIdComanda)
    {
      setNrComandaAberta(null);
      setDetalhe(null);
      return;
    }

    setDsErro("");
    setNrComandaAberta(nrIdComanda);
    setDetalhe(null);
    await carregarDetalhe(nrIdComanda);
  }

  async function alterarSituacaoComanda(comanda: Comanda, dsAcao: "fechar" | "cancelar")
  {
    if (!comanda || nrComandaEmAcao !== null)
      return;

    const dsPergunta = dsAcao === "fechar"
      ? `Fechar a comanda #${comanda.id_comanda}?`
      : `Cancelar a comanda #${comanda.id_comanda}? Os itens serão cancelados.`;

    if (!window.confirm(dsPergunta))
      return;

    setDsErro("");
    setDsSucesso("");
    setNrComandaEmAcao(comanda.id_comanda);

    try
    {
      await apiPatch(`comandas/${comanda.id_comanda}/${dsAcao}`, {});
      setDsSucesso(`Comanda #${comanda.id_comanda} ${dsAcao === "fechar" ? "fechada" : "cancelada"} com sucesso.`);
      await carregarComandas();

      if (nrComandaAberta === comanda.id_comanda)
        await carregarDetalhe(comanda.id_comanda);
    }
    catch (erro)
    {
      setDsErro(lerMensagemDoErro(erro, "Não foi possível alterar a comanda."));
    }
    finally
    {
      setNrComandaEmAcao(null);
    }
  }

  const arrComandasFiltradas = arrComandas.filter((comanda) => dsFiltro === "TODAS" || comanda.id_situacao === dsFiltro);

  return (
    <div className={estilos.pagina}>
      <header>
        <p className="sobretitulo">Atendimento</p>
        <h1 className={estilos.titulo}>Comandas</h1>
        <p className={estilos.descricao}>
          Confira as comandas abertas e as já finalizadas, com itens, pagamentos e totais.
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

      {dsErro && (
        <div role="alert" className={`${estilos.alerta} ${estilos.alertaErro}`}>
          {dsErro}
        </div>
      )}

      {dsSucesso && (
        <div role="status" className={`${estilos.alerta} ${estilos.alertaSucesso}`}>
          {dsSucesso}
        </div>
      )}

      <section className={estilos.cartao}>
        <div className={estilos.linhaCabecalho}>
          <div className={estilos.botoes}>
            {ARR_FILTROS.map(({ dsFiltro: dsValor, nmRotulo }) => {
              const qtComandas = arrComandas.filter(
                (comanda) => dsValor === "TODAS" || comanda.id_situacao === dsValor
              ).length;

              return (
                <button
                  key={dsValor}
                  type="button"
                  onClick={() => setDsFiltro(dsValor)}
                  aria-pressed={dsFiltro === dsValor}
                  className={`${estilos.botao} ${estilos.botaoPequeno} ${
                    dsFiltro === dsValor ? estilos.botaoPrimario : estilos.botaoSecundario
                  }`}
                >
                  {nmRotulo} ({carregando ? "…" : qtComandas})
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => void carregarComandas()}
            disabled={carregando}
            className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
          >
            {carregando ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </section>

      {carregando ? (
        <div className={`${estilos.cartao} ${estilos.carregando}`}>Carregando comandas...</div>
      ) : arrComandasFiltradas.length === 0 ? (
        <div className={`${estilos.cartao} ${estilos.vazio}`}>
          <p className={estilos.vazioTitulo}>Nenhuma comanda encontrada</p>
          <p className={estilos.vazioTexto}>Mude o filtro para ver as outras comandas.</p>
        </div>
      ) : (
        <div className={estilos.comandas}>
          {arrComandasFiltradas.map((comanda) => {
            const aberta = nrComandaAberta === comanda.id_comanda;

            return (
              <article key={comanda.id_comanda} className={estilos.comanda}>
                <header className={estilos.comandaCabecalho}>
                  <div>
                    <h2 className={estilos.comandaTitulo}>Comanda #{comanda.id_comanda}</h2>
                    <p className={estilos.subtituloCartao}>
                      {comanda.mesa ? `Mesa ${comanda.mesa.nr_mesa}` : "Retirada / sem mesa"} · aberta
                      em {formatarDataHora(comanda.dt_abertura)}
                      {comanda.dt_fechamento && ` · encerrada em ${formatarDataHora(comanda.dt_fechamento)}`}
                    </p>
                  </div>

                  <div className={estilos.acoesItem}>
                    <span
                      className={`${estilos.seloEstado} ${OBJ_ESTILOS_SITUACAO_COMANDA[comanda.id_situacao]}`}
                    >
                      {OBJ_NOMES_SITUACAO_COMANDA[comanda.id_situacao]}
                    </span>

                    <button
                      type="button"
                      onClick={() => void alternarDetalhe(comanda.id_comanda)}
                      aria-expanded={aberta}
                      className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
                    >
                      {aberta ? "Ocultar detalhes" : "Ver detalhes"}
                    </button>
                  </div>
                </header>

                {aberta && (
                  <div className={estilos.corpoCartao}>
                    {carregandoDetalhe || !detalhe ? (
                      <p className={estilos.carregando}>Carregando detalhes...</p>
                    ) : (
                      <>
                        <p className={estilos.subtituloCartao}>
                          Atendida por {detalhe.usuario?.pessoa.nm_pessoa ?? "usuário não informado"}
                        </p>

                        <h3 className={estilos.tituloBloco}>Itens</h3>

                        {detalhe.itens.length === 0 ? (
                          <p className={estilos.observacao}>Nenhum item lançado nesta comanda.</p>
                        ) : (
                          <div className={estilos.listaItens}>
                            {detalhe.itens.map((item) => (
                              <div key={item.id_item_pedido} className={estilos.itemLancado}>
                                <div>
                                  <p className={estilos.negrito}>{item.item_cardapio.nm_item}</p>
                                  <p className={estilos.subtituloCartao}>
                                    {item.qt_quantidade} × {formatarMoeda(item.vl_unitario)}
                                  </p>
                                  {item.ds_observacao && (
                                    <p className={estilos.subtituloCartao}>
                                      Observação: {item.ds_observacao}
                                    </p>
                                  )}
                                </div>

                                <div className={estilos.acoesItem}>
                                  <span className={estilos.valorDestaque}>
                                    {formatarMoeda(Number(item.vl_unitario) * item.qt_quantidade)}
                                  </span>
                                  <span className={estilos.seloPonto}>
                                    {OBJ_NOMES_SITUACAO_ITEM[item.id_situacao] ?? item.id_situacao}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <h3 className={estilos.tituloBloco}>Pagamentos</h3>

                        {detalhe.pagamentos.length === 0 ? (
                          <p className={estilos.observacao}>Nenhum pagamento registrado.</p>
                        ) : (
                          <div className={estilos.listaItens}>
                            {detalhe.pagamentos.map((pagamento) => (
                              <div key={pagamento.id_pagamento} className={estilos.itemLancado}>
                                <p className={estilos.negrito}>
                                  {OBJ_NOMES_FORMA_PAGAMENTO[pagamento.forma_pagamento] ?? pagamento.forma_pagamento}
                                </p>

                                <div className={estilos.acoesItem}>
                                  <span className={estilos.valorDestaque}>
                                    {formatarMoeda(pagamento.vl_pago)}
                                  </span>
                                  <span className={estilos.seloPonto}>
                                    {OBJ_NOMES_SITUACAO_PAGAMENTO[pagamento.id_situacao] ?? pagamento.id_situacao}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className={estilos.linhaTotal}>
                          <span>Total da comanda</span>
                          <span className={estilos.valorDestaque}>{formatarMoeda(detalhe.vl_total)}</span>
                        </div>
                        <div className={estilos.linhaTotal}>
                          <span>Pago</span>
                          <span className={estilos.valorDestaque}>{formatarMoeda(detalhe.vl_pago)}</span>
                        </div>
                        <div className={estilos.linhaTotal}>
                          <span>Falta pagar</span>
                          <span className={estilos.valorDestaque}>{formatarMoeda(detalhe.vl_restante)}</span>
                        </div>

                        {comanda.id_situacao === "ABERTA" && (
                          <div className={`${estilos.botoes} ${estilos.espacoTopo}`}>
                            <button
                              type="button"
                              onClick={() => void alterarSituacaoComanda(comanda, "fechar")}
                              disabled={nrComandaEmAcao !== null}
                              className={`${estilos.botao} ${estilos.botaoPrimario}`}
                            >
                              {nrComandaEmAcao === comanda.id_comanda ? "Aguarde..." : "Fechar comanda"}
                            </button>

                            <button
                              type="button"
                              onClick={() => void alterarSituacaoComanda(comanda, "cancelar")}
                              disabled={nrComandaEmAcao !== null}
                              className={`${estilos.botao} ${estilos.botaoPerigo}`}
                            >
                              Cancelar comanda
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
