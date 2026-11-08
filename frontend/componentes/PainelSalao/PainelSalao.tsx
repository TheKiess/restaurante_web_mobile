"use client";

import { useCallback, useRef, useState }   from "react";
import { apiGet }                          from "@/lib/api";
import { formatarDataHora, formatarMoeda } from "@/lib/formatar";
import { useAtualizacaoAutomatica }        from "@/lib/useAtualizacaoAutomatica";
import { useCarregarAoMontar }             from "@/lib/useCarregarAoMontar";
import estilos                             from "@/estilos/Painel.module.css";
import estilosMesa                         from "./PainelSalao.module.css";

type ComandaDaMesa = {
  id_comanda: number;
  dt_abertura: string;
  nm_responsavel: string | null;
  vl_total: string;
  vl_restante: string;
  qt_itens: number;
  qt_itens_pendentes: number;
};

type ReservaDaMesa = {
  id_reserva: number;
  dt_reserva: string;
  dt_limite_checkin: string;
  qt_pessoas: number;
  nm_cliente: string;
};

type MesaDoPainel = {
  id_mesa: number;
  nr_mesa: number;
  qt_lugares: number;
  situacao: "LIVRE" | "OCUPADA" | "RESERVADA";
  comanda: ComandaDaMesa | null;
  proxima_reserva: ReservaDaMesa | null;
};

type Painel = {
  resumo: {
    livres: number;
    ocupadas: number;
    reservadas: number;
    comandas_sem_mesa: number;
  };
  mesas: MesaDoPainel[];
};

const OBJ_NOMES_SITUACAO: Record<MesaDoPainel["situacao"], string> = {
  LIVRE: "Livre",
  OCUPADA: "Ocupada",
  RESERVADA: "Reservada",
};

const OBJ_CLASSE_SELO: Record<MesaDoPainel["situacao"], string> = {
  LIVRE: estilos.seloSucesso,
  OCUPADA: estilos.seloAguardando,
  RESERVADA: estilos.seloEmPreparo,
};

const OBJ_CLASSE_MESA: Record<MesaDoPainel["situacao"], string> = {
  LIVRE: estilosMesa.mesaLivre,
  OCUPADA: estilosMesa.mesaOcupada,
  RESERVADA: estilosMesa.mesaReservada,
};

function formatarHora(dsData: string): string
{
  return new Date(dsData).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function PainelSalao({ nrSegundos = 10 }: { nrSegundos?: number })
{
  const [painel,              setPainel]              = useState<Painel | null>(null);
  const [dtUltimaAtualizacao, setDtUltimaAtualizacao] = useState<Date | null>(null);
  const [flAtualizando,       setFlAtualizando]       = useState(false);
  const [dsErro,              setDsErro]              = useState("");
  const refRequisicao                                 = useRef(0);
  const carregarPainel                                = useCallback(async (flSilencioso = false) => {
    const nrRequisicao = ++refRequisicao.current;

    if (!flSilencioso)
      setFlAtualizando(true);

    try
    {
      const dados = await apiGet<Painel>("mesas/painel");

      // Resposta antiga que chegou depois de uma mais nova é descartada.
      if (nrRequisicao !== refRequisicao.current)
        return;

      setPainel(dados);
      setDtUltimaAtualizacao(new Date());
      setDsErro("");
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível carregar o painel do salão.");
    }
    finally
    {
      if (!flSilencioso)
        setFlAtualizando(false);
    }
  }, []);

  const carregarEmSegundoPlano = useCallback(() => carregarPainel(true), [carregarPainel]);

  useCarregarAoMontar(carregarPainel);
  useAtualizacaoAutomatica(carregarEmSegundoPlano, nrSegundos);

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecalhoComAcao}>
        <div>
          <p className="sobretitulo">Atendimento</p>
          <h1 className={estilos.titulo}>Painel do salão</h1>
          <p className={estilos.descricao}>
            Veja quais mesas estão livres, ocupadas ou reservadas e o andamento de cada comanda.
          </p>
          <p className={estilos.textoSuave}>
            O painel atualiza sozinho a cada {nrSegundos} segundos.
            {dtUltimaAtualizacao && ` Última atualização: ${dtUltimaAtualizacao.toLocaleTimeString("pt-BR")}.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void carregarPainel()}
          disabled={flAtualizando}
          className={`${estilos.botao} ${estilos.botaoSecundario}`}
        >
          {flAtualizando ? "Atualizando..." : "Atualizar painel"}
        </button>
      </header>

      {dsErro && (
        <div role="alert" className={`${estilos.alerta} ${estilos.alertaErro}`}>
          {dsErro}
        </div>
      )}

      {!painel ? (
        !dsErro && <p className={estilos.carregando}>Carregando painel...</p>
      ) : (
        <>
          <section className={estilos.estatisticas}>
            <div className={estilos.cartao}>
              <p className={estilos.estatisticaRotulo}>Mesas livres</p>
              <p className={estilos.estatisticaValor}>{painel.resumo.livres}</p>
            </div>

            <div className={estilos.cartao}>
              <p className={estilos.estatisticaRotulo}>Mesas ocupadas</p>
              <p className={estilos.estatisticaValor}>{painel.resumo.ocupadas}</p>
            </div>

            <div className={estilos.cartao}>
              <p className={estilos.estatisticaRotulo}>Mesas reservadas</p>
              <p className={estilos.estatisticaValor}>{painel.resumo.reservadas}</p>
            </div>

            <div className={estilos.cartao}>
              <p className={estilos.estatisticaRotulo}>Comandas sem mesa</p>
              <p className={estilos.estatisticaValor}>{painel.resumo.comandas_sem_mesa}</p>
            </div>
          </section>

          <section className={estilos.cartao}>
            <div className={estilosMesa.legenda}>
              <span><span className={`${estilos.seloEstado} ${estilos.seloSucesso}`}>Livre</span> pode receber clientes</span>
              <span><span className={`${estilos.seloEstado} ${estilos.seloAguardando}`}>Ocupada</span> tem comanda aberta</span>
              <span><span className={`${estilos.seloEstado} ${estilos.seloEmPreparo}`}>Reservada</span> aguardando o check-in</span>
            </div>

            {painel.mesas.length === 0 ? (
              <div className={`${estilos.vazio} ${estilos.espacoTopo}`}>
                <p className={estilos.vazioTitulo}>Nenhuma mesa cadastrada.</p>
                <p className={estilos.vazioTexto}>Cadastre as mesas na tela de Mesas da gerência.</p>
              </div>
            ) : (
              <div className={`${estilosMesa.grade} ${estilos.espacoTopo}`}>
                {painel.mesas.map((mesa) => (
                  <article key={mesa.id_mesa} className={`${estilosMesa.mesa} ${OBJ_CLASSE_MESA[mesa.situacao]}`}>
                    <div className={estilosMesa.topoMesa}>
                      <div>
                        <h3 className={estilosMesa.numeroMesa}>Mesa {mesa.nr_mesa}</h3>
                        <p className={estilosMesa.lugares}>{mesa.qt_lugares} lugares</p>
                      </div>

                      <span className={`${estilos.seloEstado} ${OBJ_CLASSE_SELO[mesa.situacao]}`}>
                        {OBJ_NOMES_SITUACAO[mesa.situacao]}
                      </span>
                    </div>

                    {mesa.comanda && (
                      <div className={estilosMesa.detalhes}>
                        <p>
                          <span className={estilosMesa.rotuloDetalhe}>Comanda #{mesa.comanda.id_comanda}</span>
                          {mesa.comanda.nm_responsavel ? ` de ${mesa.comanda.nm_responsavel}` : ""}
                        </p>
                        <p>Aberta às {formatarHora(mesa.comanda.dt_abertura)}</p>
                        <p>
                          {mesa.comanda.qt_itens} item(ns)
                          {mesa.comanda.qt_itens_pendentes > 0
                            ? `, ${mesa.comanda.qt_itens_pendentes} ainda não entregue(s)`
                            : ", todos entregues"}
                        </p>
                        <p>
                          <span className={estilosMesa.rotuloDetalhe}>Total: </span>
                          {formatarMoeda(mesa.comanda.vl_total)}
                          {" · "}
                          <span className={estilosMesa.rotuloDetalhe}>Falta pagar: </span>
                          {formatarMoeda(mesa.comanda.vl_restante)}
                        </p>
                      </div>
                    )}

                    {mesa.proxima_reserva && (
                      <div className={estilosMesa.reserva}>
                        <p>
                          <span className={estilosMesa.rotuloDetalhe}>
                            {mesa.situacao === "RESERVADA" ? "Reservada para " : "Próxima reserva: "}
                          </span>
                          {formatarDataHora(mesa.proxima_reserva.dt_reserva)}
                        </p>
                        <p>
                          {mesa.proxima_reserva.nm_cliente} · {mesa.proxima_reserva.qt_pessoas} pessoa(s)
                        </p>
                        <p>Check-in até {formatarHora(mesa.proxima_reserva.dt_limite_checkin)}</p>
                      </div>
                    )}
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
