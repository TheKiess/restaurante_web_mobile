"use client";

import Link                          from "next/link";
import { useCallback, useState }     from "react";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import {
  OBJ_NOMES_FORMA_PAGAMENTO,
  OBJ_NOMES_SITUACAO_ITEM,
  OBJ_NOMES_SITUACAO_PAGAMENTO
}                                    from "@/lib/constantes";
import { formatarMoeda }             from "@/lib/formatar";
import { useCarregarAoMontar }       from "@/lib/useCarregarAoMontar";
import estilos                       from "@/estilos/Painel.module.css";

type Comanda = {
  id_comanda: number;
  mesa?: { nr_mesa: number } | null;
};

type Pagamento = {
  id_pagamento: number;
  vl_pago: number | string;
  forma_pagamento: string;
  id_situacao: string;
};

type ItemComanda = {
  id_item_pedido: number;
  qt_quantidade: number;
  vl_unitario: number | string;
  id_situacao: string;
  item_cardapio?: { nm_item: string };
};

type ComandaDetalhe = Comanda & {
  itens: ItemComanda[];
  pagamentos: Pagamento[];
  vl_total: string;
  vl_pago: string;
  vl_restante: string;
};

const ARR_SITUACOES_NAO_ENTREGUES = ["AGUARDANDO", "EM_PREPARO", "PRONTO"];
const ARR_FORMAS_DISPONIVEIS      = ["DINHEIRO", "CARTAO"];

function arredondar(vlValor: number): number
{
  return Math.round(vlValor * 100) / 100;
}

function descreverComanda(comanda: Comanda): string
{
  return comanda.mesa ? `Mesa ${comanda.mesa.nr_mesa}` : "Retirada / sem mesa";
}

export default function PagamentosPage()
{
  const [arrComandas,         setArrComandas]         = useState<Comanda[]>([]);
  const [nrComandaAtual,      setNrComandaAtual]      = useState<number | null>(null);
  const [detalhe,             setDetalhe]             = useState<ComandaDetalhe | null>(null);
  const [dsForma,             setDsForma]             = useState("DINHEIRO");
  const [dsValor,             setDsValor]             = useState("");
  const [flCarregando,        setFlCarregando]        = useState(true);
  const [flCarregandoDetalhe, setFlCarregandoDetalhe] = useState(false);
  const [flEnviando,          setFlEnviando]          = useState(false);
  const [dsErro,              setDsErro]              = useState("");
  const [dsSucesso,           setDsSucesso]           = useState("");

  const carregarComandas = useCallback(async () => {
    setFlCarregando(true);

    try
    {
      setArrComandas(await apiGet<Comanda[]>("comandas?id_situacao=ABERTA"));
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível carregar as comandas.");
    }
    finally
    {
      setFlCarregando(false);
    }
  }, []);

  useCarregarAoMontar(carregarComandas);

  function calcularValores(comanda: ComandaDetalhe)
  {
    const vlTotal    = Number(comanda.vl_total);
    const vlPago     = Number(comanda.vl_pago);
    const vlPendente = comanda.pagamentos.filter((pagamento) => pagamento.id_situacao === "PENDENTE")
      .reduce((vlSoma, pagamento) => vlSoma + Number(pagamento.vl_pago), 0);

    return {
      vlTotal,
      vlPago,
      vlPendente: arredondar(vlPendente),
      vlDisponivel: arredondar(vlTotal - vlPago - vlPendente),
      qtNaoEntregues: comanda.itens.filter((item) => ARR_SITUACOES_NAO_ENTREGUES.includes(item.id_situacao)).length
    };
  }

  async function carregarDetalhe(nrIdComanda: number)
  {
    setFlCarregandoDetalhe(true);

    try
    {
      const dados = await apiGet<ComandaDetalhe>(`comandas/${nrIdComanda}`);

      setDetalhe(dados);
      setDsValor(Math.max(calcularValores(dados).vlDisponivel, 0).toFixed(2));
    }
    catch (erro)
    {
      setDetalhe(null);
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível carregar a comanda.");
    }
    finally
    {
      setFlCarregandoDetalhe(false);
    }
  }

  async function selecionarComanda(nrIdComanda: number)
  {
    setDsErro("");
    setDsSucesso("");
    setNrComandaAtual(nrIdComanda);
    setDetalhe(null);
    await carregarDetalhe(nrIdComanda);
  }

  async function registrarPagamento()
  {
    if (!detalhe || flEnviando)
      return;

    setDsErro("");
    setDsSucesso("");

    const vlInformado   = Number(dsValor);
    const { vlDisponivel } = calcularValores(detalhe);

    if (!dsValor || !Number.isFinite(vlInformado) || vlInformado <= 0)
    {
      setDsErro("Informe um valor maior que zero.");
      return;
    }

    if (arredondar(vlInformado) !== vlInformado)
    {
      setDsErro("O valor deve ter no máximo 2 casas decimais.");
      return;
    }

    if (vlInformado > vlDisponivel)
    {
      setDsErro(`O valor é maior que o que falta pagar (${formatarMoeda(vlDisponivel)}).`);
      return;
    }

    setFlEnviando(true);

    try
    {
      await apiPost("pagamentos", {
        id_comanda: detalhe.id_comanda,
        vl_pago: vlInformado,
        forma_pagamento: dsForma,
      });

      setDsSucesso("Pagamento registrado com sucesso!");
      await carregarDetalhe(detalhe.id_comanda);
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível registrar o pagamento.");
    }
    finally
    {
      setFlEnviando(false);
    }
  }

  async function fecharComanda()
  {
    if (!detalhe || flEnviando)
      return;

    if (!window.confirm(`Fechar a comanda #${detalhe.id_comanda}?`))
      return;

    setDsErro("");
    setDsSucesso("");
    setFlEnviando(true);

    try
    {
      await apiPatch(`comandas/${detalhe.id_comanda}/fechar`, {});

      setDsSucesso(`Comanda #${detalhe.id_comanda} fechada com sucesso.`);
      setNrComandaAtual(null);
      setDetalhe(null);
      await carregarComandas();
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível fechar a comanda.");
    }
    finally
    {
      setFlEnviando(false);
    }
  }

  const valores      = detalhe ? calcularValores(detalhe) : null;
  const flPodeFechar = !!valores && valores.vlTotal > 0 &&
    valores.vlPendente === 0 && valores.vlDisponivel === 0 &&
    valores.qtNaoEntregues === 0;

  return (
    <div className={estilos.pagina}>
      <header>
        <p className="sobretitulo">Atendimento</p>
        <h1 className={estilos.titulo}>Pagamentos</h1>
        <p className={estilos.descricao}>
          Escolha uma comanda aberta, registre os pagamentos e feche a comanda quando estiver tudo pago.
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
          <div>
            <h2 className={estilos.tituloCartao}>Comandas abertas</h2>
            <p className={estilos.subtituloCartao}>{arrComandas.length} comanda(s) encontrada(s)</p>
          </div>

          <button
            type="button"
            onClick={() => void carregarComandas()}
            disabled={flCarregando}
            className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
          >
            {flCarregando ? "Atualizando..." : "Atualizar"}
          </button>
        </div>

        {flCarregando && arrComandas.length === 0 ? (
          <p className={`${estilos.carregando} ${estilos.espacoTopo}`}>Carregando comandas...</p>
        ) : arrComandas.length === 0 ? (
          <div className={`${estilos.vazio} ${estilos.vazioBorda} ${estilos.espacoTopo}`}>
            <h3 className={estilos.vazioTitulo}>Nenhuma comanda aberta</h3>
          </div>
        ) : (
          <div className={estilos.gradeCartoesTres}>
            {arrComandas.map((comanda) => (
              <article
                key={comanda.id_comanda}
                className={`${estilos.cartaoInterno} ${nrComandaAtual === comanda.id_comanda ? estilos.cartaoOpcaoAtiva : ""}`}
              >
                <p className={estilos.negrito}>Comanda #{comanda.id_comanda}</p>
                <p className={estilos.subtituloCartao}>{descreverComanda(comanda)}</p>

                <button
                  type="button"
                  onClick={() => void selecionarComanda(comanda.id_comanda)}
                  className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno} ${estilos.espacoTopo}`}
                >
                  Receber pagamento
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {nrComandaAtual !== null && (
        <section className={estilos.cartao}>
          {flCarregandoDetalhe || !detalhe || !valores ? (
            <p className={estilos.carregando}>Carregando comanda...</p>
          ) : (
            <>
              <h2 className={estilos.tituloCartao}>
                Comanda #{detalhe.id_comanda} · {descreverComanda(detalhe)}
              </h2>

              <h3 className={`${estilos.tituloBloco} ${estilos.espacoTopo}`}>Itens</h3>

              {detalhe.itens.length === 0 ? (
                <p className={estilos.observacao}>Nenhum item lançado.</p>
              ) : (
                <div className={estilos.listaItens}>
                  {detalhe.itens.map((item) => (
                    <div key={item.id_item_pedido} className={estilos.itemLancado}>
                      <p className={estilos.negrito}>
                        {item.qt_quantidade}x {item.item_cardapio?.nm_item ?? "Item"}
                      </p>

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

              <h3 className={`${estilos.tituloBloco} ${estilos.espacoTopo}`}>Pagamentos</h3>

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
                        <span className={estilos.valorDestaque}>{formatarMoeda(pagamento.vl_pago)}</span>
                        <span className={estilos.seloPonto}>
                          {OBJ_NOMES_SITUACAO_PAGAMENTO[pagamento.id_situacao] ?? pagamento.id_situacao}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className={estilos.espacoTopo}>
                <div className={estilos.linhaTotal}>
                  <span>Total da comanda</span>
                  <span className={estilos.valorDestaque}>{formatarMoeda(valores.vlTotal)}</span>
                </div>
                <div className={estilos.linhaTotal}>
                  <span>Pago (confirmado)</span>
                  <span className={estilos.valorDestaque}>{formatarMoeda(valores.vlPago)}</span>
                </div>
                {valores.vlPendente > 0 && (
                  <div className={estilos.linhaTotal}>
                    <span>Pendente de confirmação</span>
                    <span className={estilos.valorDestaque}>{formatarMoeda(valores.vlPendente)}</span>
                  </div>
                )}
                <div className={estilos.linhaTotal}>
                  <span>Falta pagar</span>
                  <span className={estilos.valorDestaque}>{formatarMoeda(Math.max(valores.vlDisponivel, 0))}</span>
                </div>
              </div>

              {valores.vlDisponivel > 0 && (
                <div className={estilos.espacoTopo}>
                  <h3 className={estilos.tituloBloco}>Novo pagamento</h3>

                  <div className={`${estilos.camposLinha} ${estilos.espacoTopo}`}>
                    <div>
                      <label htmlFor="forma" className={estilos.rotulo}>Forma de pagamento</label>
                      <select
                        id="forma"
                        value={dsForma}
                        onChange={(evento) => setDsForma(evento.target.value)}
                        className={estilos.entrada}
                      >
                        {ARR_FORMAS_DISPONIVEIS.map((dsChave) => (
                          <option key={dsChave} value={dsChave}>
                            {OBJ_NOMES_FORMA_PAGAMENTO[dsChave] ?? dsChave}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="valor" className={estilos.rotulo}>Valor (R$)</label>
                      <input
                        id="valor"
                        type="number"
                        inputMode="decimal"
                        min="0.01"
                        step="0.01"
                        value={dsValor}
                        onChange={(evento) => setDsValor(evento.target.value)}
                        className={estilos.entrada}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void registrarPagamento()}
                    disabled={flEnviando}
                    className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.espacoTopo}`}
                  >
                    {flEnviando ? "Registrando..." : "Registrar pagamento"}
                  </button>
                </div>
              )}

              <div className={estilos.espacoTopo}>
                {valores.qtNaoEntregues > 0 && (
                  <p className={estilos.observacao}>
                    Ainda há {valores.qtNaoEntregues} item(ns) não entregue(s). A comanda só fecha depois da entrega.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => void fecharComanda()}
                  disabled={!flPodeFechar || flEnviando}
                  className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.espacoTopo}`}
                >
                  Fechar comanda
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
