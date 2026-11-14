"use client";

import { useCallback, useState, type FormEvent } from "react";
import { apiGet, apiPatch, apiPost }             from "@/lib/api";
import { OBJ_NOMES_SITUACAO_RESERVA }            from "@/lib/constantes";
import { formatarDataHora }                      from "@/lib/formatar";
import { useCarregarAoMontar }                   from "@/lib/useCarregarAoMontar";
import estilos                                   from "@/estilos/Painel.module.css";

type Mesa = {
  id_mesa: number;
  nr_mesa: number;
  qt_lugares: number;
};

type Usuario = {
  id_usuario: number;
  perfil: string;
  id_ativo: boolean;
  pessoa: { nm_pessoa: string };
};

type Reserva = {
  id_reserva: number;
  id_usuario: number;
  id_mesa: number;
  qt_pessoas: number;
  dt_reserva: string;
  dt_limite_checkin: string;
  id_situacao: string;
  mesa: Mesa;
  usuario: {
    id_usuario: number;
    ds_apelido: string;
    pessoa: { nm_pessoa: string }
  };
};

type FormularioReserva = {
  id_usuario: string;
  id_mesa: string;
  qt_pessoas: string;
  dt_reserva: string;
};

const OBJ_FORMULARIO_INICIAL: FormularioReserva = {
  id_usuario: "",
  id_mesa: "",
  qt_pessoas: "2",
  dt_reserva: "",
};

const OBJ_CLASSE_SITUACAO: Record<string, string> = {
  CONFIRMADA: estilos.seloAguardando,
  CHECKIN: estilos.seloSucesso,
  CANCELADA: estilos.seloCancelado,
  EXPIRADA: estilos.seloNeutro,
};

const ARR_SITUACOES = ["CONFIRMADA", "CHECKIN", "CANCELADA", "EXPIRADA"];

function paraDataHoraLocal(dsData: string): string
{
  const dtData        = new Date(dsData);
  const dsDoisDigitos = (nrValor: number) => String(nrValor).padStart(2, "0");

  return `${dtData.getFullYear()}-${dsDoisDigitos(dtData.getMonth() + 1)}-${dsDoisDigitos(dtData.getDate())}`
    + `T${dsDoisDigitos(dtData.getHours())}:${dsDoisDigitos(dtData.getMinutes())}`;
}

// Monta o texto de consulta da lista conforme os filtros escolhidos.
function montarConsulta(dsSituacao: string, dsDia: string): string
{
  const arrParametros: string[] = [];

  if (dsSituacao)
    arrParametros.push(`id_situacao=${dsSituacao}`);

  if (dsDia)
  {
    arrParametros.push(`dt_de=${encodeURIComponent(new Date(`${dsDia}T00:00:00`).toISOString())}`);
    arrParametros.push(`dt_ate=${encodeURIComponent(new Date(`${dsDia}T23:59:59.999`).toISOString())}`);
  }

  return arrParametros.length > 0 ? `reservas?${arrParametros.join("&")}` : "reservas";
}

export default function ReservasPage()
{
  const [arrReservas,  setArrReservas]  = useState<Reserva[]>([]);
  const [arrMesas,     setArrMesas]     = useState<Mesa[]>([]);
  const [arrClientes,  setArrClientes]  = useState<Usuario[]>([]);
  const [formulario,   setFormulario]   = useState<FormularioReserva>(OBJ_FORMULARIO_INICIAL);
  const [dsSituacao,   setDsSituacao]   = useState("CONFIRMADA");
  const [dsDia,        setDsDia]        = useState("");
  const [flCarregando, setFlCarregando] = useState(true);
  const [flSalvando,   setFlSalvando]   = useState(false);
  const [nrIdEditando, setNrIdEditando] = useState<number | null>(null);
  const [dsErro,       setDsErro]       = useState("");
  const [dsSucesso,    setDsSucesso]    = useState("");

  const carregarDados = useCallback(async (dsSituacaoFiltro: string, dsDiaFiltro: string) => {
    setFlCarregando(true);

    try
    {
      const [arrReservasApi, arrMesasApi, arrUsuariosApi] = await Promise.all([
        apiGet<Reserva[]>(montarConsulta(dsSituacaoFiltro, dsDiaFiltro)),
        apiGet<Mesa[]>("mesas"),
        apiGet<Usuario[]>("usuarios"),
      ]);

      setArrReservas(arrReservasApi);
      setArrMesas([...arrMesasApi].sort((mesaA, mesaB) => mesaA.nr_mesa - mesaB.nr_mesa));
      setArrClientes(arrUsuariosApi.filter((usuario) => usuario.perfil === "CLIENTE" && usuario.id_ativo));
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível carregar as reservas.");
    }
    finally
    {
      setFlCarregando(false);
    }
  }, []);

  const carregarInicial = useCallback(() => carregarDados("CONFIRMADA", ""), [carregarDados]);

  useCarregarAoMontar(carregarInicial);

  function limparMensagens()
  {
    setDsErro("");
    setDsSucesso("");
  }

  async function mudarFiltro(dsNovaSituacao: string, dsNovoDia: string)
  {
    setDsSituacao(dsNovaSituacao);
    setDsDia(dsNovoDia);
    limparMensagens();
    await carregarDados(dsNovaSituacao, dsNovoDia);
  }

  function iniciarEdicao(reserva: Reserva)
  {
    setNrIdEditando(reserva.id_reserva);
    setFormulario({
      id_usuario: String(reserva.id_usuario),
      id_mesa: String(reserva.id_mesa),
      qt_pessoas: String(reserva.qt_pessoas),
      dt_reserva: paraDataHoraLocal(reserva.dt_reserva),
    });
    limparMensagens();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicao()
  {
    setNrIdEditando(null);
    setFormulario(OBJ_FORMULARIO_INICIAL);
    limparMensagens();
  }

  async function salvarReserva(evento: FormEvent<HTMLFormElement>)
  {
    evento.preventDefault();
    limparMensagens();

    const nrPessoas = Number(formulario.qt_pessoas);

    if (!formulario.id_usuario)
    {
      setDsErro("Escolha o cliente da reserva.");
      return;
    }

    if (!Number.isInteger(nrPessoas) || nrPessoas < 1 || nrPessoas > 50)
    {
      setDsErro("Informe de 1 a 50 pessoas.");
      return;
    }

    if (!formulario.dt_reserva)
    {
      setDsErro("Informe a data e a hora da reserva.");
      return;
    }

    setFlSalvando(true);

    try
    {
      const objDados = {
        qt_pessoas: nrPessoas,
        dt_reserva: new Date(formulario.dt_reserva).toISOString(),
        ...(formulario.id_mesa ? { id_mesa: Number(formulario.id_mesa) } : {}),
      };

      const reserva = nrIdEditando === null
        ? await apiPost<Reserva>("reservas", { id_usuario: Number(formulario.id_usuario), ...objDados })
        : await apiPatch<Reserva>(`reservas/${nrIdEditando}`, objDados);

      setDsSucesso(`Reserva ${nrIdEditando === null ? "criada" : "atualizada"} na mesa ${reserva.mesa.nr_mesa} para ${formatarDataHora(reserva.dt_reserva)}.`);
      setFormulario(OBJ_FORMULARIO_INICIAL);
      setNrIdEditando(null);
      await carregarDados(dsSituacao, dsDia);
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível salvar a reserva.");
    }
    finally
    {
      setFlSalvando(false);
    }
  }

  async function fazerCheckin(reserva: Reserva)
  {
    limparMensagens();

    try
    {
      const comanda = await apiPost<{ id_comanda: number }>(`reservas/${reserva.id_reserva}/checkin`, {});

      setDsSucesso(`Check-in feito: comanda #${comanda.id_comanda} aberta na mesa ${reserva.mesa.nr_mesa}.`);
      await carregarDados(dsSituacao, dsDia);
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível fazer o check-in.");
    }
  }

  async function cancelarReserva(reserva: Reserva)
  {
    if (!window.confirm(`Cancelar a reserva de ${reserva.usuario.pessoa.nm_pessoa} (mesa ${reserva.mesa.nr_mesa})?`))
      return;

    limparMensagens();

    try
    {
      await apiPatch(`reservas/${reserva.id_reserva}/cancelar`, {});

      setDsSucesso("Reserva cancelada.");
      await carregarDados(dsSituacao, dsDia);
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível cancelar a reserva.");
    }
  }

  const arrConfirmadas      = arrReservas.filter((reserva) => reserva.id_situacao === "CONFIRMADA");
  const nrMesasReservadas   = new Set(arrConfirmadas.map((reserva) => reserva.id_mesa)).size;
  const reservaMaisProxima  = [...arrConfirmadas]
    .filter((reserva) => new Date(reserva.dt_limite_checkin) >= new Date())
    .sort((reservaA, reservaB) => new Date(reservaA.dt_reserva).getTime() - new Date(reservaB.dt_reserva).getTime())[0];

  return (
    <div className={estilos.pagina}>
      <header>
        <p className="sobretitulo">Atendimento</p>
        <h1 className={estilos.titulo}>Reservas</h1>
        <p className={estilos.descricao}>
          Veja quais mesas estão reservadas e para quando, registre reservas por telefone e faça o check-in dos clientes.
        </p>
      </header>

      <section className={estilos.estatisticas}>
        <div className={estilos.cartao}>
          <p className={estilos.estatisticaRotulo}>Reservas confirmadas</p>
          <p className={estilos.estatisticaValor}>{arrConfirmadas.length}</p>
        </div>

        <div className={estilos.cartao}>
          <p className={estilos.estatisticaRotulo}>Mesas reservadas</p>
          <p className={estilos.estatisticaValor}>{nrMesasReservadas}</p>
        </div>

        <div className={estilos.cartao}>
          <p className={estilos.estatisticaRotulo}>Próxima reserva</p>
          <p className={estilos.estatisticaValor}>
            {reservaMaisProxima ? formatarDataHora(reservaMaisProxima.dt_reserva) : "Nenhuma"}
          </p>
        </div>
      </section>

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
        <h2 className={estilos.tituloCartao}>{nrIdEditando === null ? "Nova reserva" : `Editar reserva #${nrIdEditando}`}</h2>
        <p className={estilos.subtituloCartao}>
          {nrIdEditando === null
            ? "Sem escolher a mesa, o sistema usa a menor mesa livre que comporta o grupo. O cliente tem 15 minutos de tolerância para o check-in."
            : "Mude a mesa, o número de pessoas ou o horário. O sistema confere se a mesa comporta o grupo e se está livre nesse horário."}
        </p>

        <form onSubmit={salvarReserva} className={estilos.formulario}>
          <div className={estilos.camposLinha}>
            <div>
              <label htmlFor="id_usuario" className={estilos.rotulo}>Cliente *</label>
              <select
                id="id_usuario"
                value={formulario.id_usuario}
                onChange={(evento) => setFormulario({ ...formulario, id_usuario: evento.target.value })}
                disabled={nrIdEditando !== null}
                required
                className={estilos.entrada}
              >
                {nrIdEditando !== null ? (
                  <option value={formulario.id_usuario}>
                    {arrReservas.find((reserva) => reserva.id_reserva === nrIdEditando)?.usuario.pessoa.nm_pessoa}
                  </option>
                ) : (
                  <>
                    <option value="">Selecione o cliente</option>
                    {arrClientes.map((cliente) => (
                      <option key={cliente.id_usuario} value={cliente.id_usuario}>{cliente.pessoa.nm_pessoa}</option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div>
              <label htmlFor="id_mesa" className={estilos.rotulo}>Mesa</label>
              <select
                id="id_mesa"
                value={formulario.id_mesa}
                onChange={(evento) => setFormulario({ ...formulario, id_mesa: evento.target.value })}
                className={estilos.entrada}
              >
                <option value="">{nrIdEditando === null ? "Escolher automaticamente" : "Manter a mesa atual"}</option>
                {arrMesas.map((mesa) => (
                  <option key={mesa.id_mesa} value={mesa.id_mesa}>Mesa {mesa.nr_mesa} ({mesa.qt_lugares} lugares)</option>
                ))}
              </select>
            </div>
          </div>

          <div className={estilos.camposLinha}>
            <div>
              <label htmlFor="qt_pessoas" className={estilos.rotulo}>Número de pessoas *</label>
              <input
                id="qt_pessoas"
                type="number"
                min="1"
                max="50"
                step="1"
                value={formulario.qt_pessoas}
                onChange={(evento) => setFormulario({ ...formulario, qt_pessoas: evento.target.value })}
                required
                className={estilos.entrada}
              />
            </div>

            <div>
              <label htmlFor="dt_reserva" className={estilos.rotulo}>Data e hora *</label>
              <input
                id="dt_reserva"
                type="datetime-local"
                value={formulario.dt_reserva}
                onChange={(evento) => setFormulario({ ...formulario, dt_reserva: evento.target.value })}
                required
                className={estilos.entrada}
              />
            </div>
          </div>

          <div className={estilos.botoes}>
            <button type="submit" disabled={flSalvando} className={`${estilos.botao} ${estilos.botaoPrimario}`}>
              {flSalvando ? "Salvando..." : nrIdEditando === null ? "Criar reserva" : "Salvar alterações"}
            </button>

            {nrIdEditando !== null && (
              <button type="button" onClick={cancelarEdicao} className={`${estilos.botao} ${estilos.botaoSecundario}`}>
                Cancelar edição
              </button>
            )}
          </div>
        </form>
      </section>

      <section className={estilos.cartaoTabela}>
        <div className={estilos.cabecalhoCartao}>
          <div>
            <h2 className={estilos.tituloCartao}>Reservas</h2>
            <p className={estilos.subtituloCartao}>{arrReservas.length} reserva(s) encontrada(s)</p>
          </div>

          <button
            type="button"
            onClick={() => void carregarDados(dsSituacao, dsDia)}
            disabled={flCarregando}
            className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
          >
            Atualizar lista
          </button>
        </div>

        <div className={estilos.corpoCartao}>
          <div className={estilos.filtros}>
            <div>
              <label htmlFor="filtro_situacao" className={estilos.rotulo}>Situação</label>
              <select
                id="filtro_situacao"
                value={dsSituacao}
                onChange={(evento) => void mudarFiltro(evento.target.value, dsDia)}
                className={estilos.entrada}
              >
                <option value="">Todas</option>
                {ARR_SITUACOES.map((dsChave) => (
                  <option key={dsChave} value={dsChave}>{OBJ_NOMES_SITUACAO_RESERVA[dsChave]}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filtro_dia" className={estilos.rotulo}>Dia</label>
              <input
                id="filtro_dia"
                type="date"
                value={dsDia}
                onChange={(evento) => void mudarFiltro(dsSituacao, evento.target.value)}
                className={estilos.entrada}
              />
            </div>
          </div>

          {flCarregando && arrReservas.length === 0 ? (
            <p className={estilos.carregando}>Carregando reservas...</p>
          ) : arrReservas.length === 0 ? (
            <div className={estilos.vazio}>
              <p className={estilos.vazioTitulo}>Nenhuma reserva encontrada.</p>
              <p className={estilos.vazioTexto}>Mude os filtros ou crie uma nova reserva acima.</p>
            </div>
          ) : (
            <div className={estilos.tabelaRolagem}>
              <table className={`${estilos.tabela} ${estilos.tabelaLarga}`}>
                <thead>
                  <tr>
                    <th>Horário</th>
                    <th>Check-in até</th>
                    <th>Mesa</th>
                    <th>Cliente</th>
                    <th>Pessoas</th>
                    <th>Situação</th>
                    <th className={estilos.alinharDireita}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {arrReservas.map((reserva) => (
                    <tr key={reserva.id_reserva}>
                      <td><strong>{formatarDataHora(reserva.dt_reserva)}</strong></td>
                      <td className={estilos.textoSuave}>{formatarDataHora(reserva.dt_limite_checkin)}</td>
                      <td>Mesa {reserva.mesa.nr_mesa}</td>
                      <td>{reserva.usuario.pessoa.nm_pessoa}</td>
                      <td>{reserva.qt_pessoas}</td>
                      <td>
                        <span className={`${estilos.seloEstado} ${OBJ_CLASSE_SITUACAO[reserva.id_situacao] ?? estilos.seloNeutro}`}>
                          {OBJ_NOMES_SITUACAO_RESERVA[reserva.id_situacao] ?? reserva.id_situacao}
                        </span>
                      </td>
                      <td>
                        {reserva.id_situacao === "CONFIRMADA" && (
                          <div className={estilos.acoesLinha}>
                            <button
                              type="button"
                              onClick={() => void fazerCheckin(reserva)}
                              className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.botaoPequeno}`}
                            >
                              Check-in
                            </button>
                            <button
                              type="button"
                              onClick={() => iniciarEdicao(reserva)}
                              className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => void cancelarReserva(reserva)}
                              className={`${estilos.botao} ${estilos.botaoPerigo} ${estilos.botaoPequeno}`}
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
