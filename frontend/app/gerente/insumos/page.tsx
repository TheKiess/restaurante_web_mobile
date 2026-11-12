"use client";

import { useCallback, useState, type FormEvent }         from "react";
import { apiDelete, apiGet, apiPatch, apiPost }          from "@/lib/api";
import { OBJ_NOMES_TIPO_MOVIMENTO, OBJ_ROTULOS_UNIDADE } from "@/lib/constantes";
import { formatarDataHora, formatarQuantidade }          from "@/lib/formatar";
import { useCarregarAoMontar }                           from "@/lib/useCarregarAoMontar";
import estilos                                           from "@/estilos/Painel.module.css";

type Insumo = {
  id_insumo: number;
  nm_insumo: string;
  unidade_medida: string;
  qt_estoque: string;
  qt_estoque_minimo: string;
};

type Movimento = {
  id_movimento_estoque: number;
  id_insumo: number;
  id_item_pedido: number | null;
  tipo_movimento: string;
  qt_movimento: string;
  ds_motivo: string | null;
  dt_movimento: string;
  insumo: { nm_insumo: string; unidade_medida: string };
};

type FormularioInsumo = {
  nm_insumo: string;
  unidade_medida: string;
  qt_estoque_inicial: string;
  qt_estoque_minimo: string;
};

type FormularioMovimento = {
  tipo_movimento: "ENTRADA" | "PERDA";
  qt_movimento: string;
  ds_motivo: string;
};

const ARR_UNIDADES = ["UN", "KG", "G", "L", "ML"];

const OBJ_FORMULARIO_INSUMO_INICIAL: FormularioInsumo = {
  nm_insumo: "",
  unidade_medida: "UN",
  qt_estoque_inicial: "",
  qt_estoque_minimo: "",
};

const OBJ_FORMULARIO_MOVIMENTO_INICIAL: FormularioMovimento = {
  tipo_movimento: "ENTRADA",
  qt_movimento: "",
  ds_motivo: "",
};

const OBJ_CLASSE_TIPO_MOVIMENTO: Record<string, string> = {
  ENTRADA: estilos.seloSucesso,
  SAIDA: estilos.seloNeutro,
  PERDA: estilos.seloCancelado,
};

// Aceita no máximo 3 casas decimais, como o banco.
function lerQuantidade(dsValor: string): number | null
{
  if (dsValor.trim() === "")
    return null;

  const vlNumero = Number(dsValor);

  if (!Number.isFinite(vlNumero) || vlNumero < 0 || Math.round(vlNumero * 1000) / 1000 !== vlNumero)
    return Number.NaN;

  return vlNumero;
}

function descreverQuantidade(dsQuantidade: string, dsUnidade: string): string
{
  return `${formatarQuantidade(dsQuantidade)} ${OBJ_ROTULOS_UNIDADE[dsUnidade] ?? dsUnidade}`;
}

export default function InsumosPage()
{
  const [arrInsumos,         setArrInsumos]         = useState<Insumo[]>([]);
  const [arrIdsEstoqueBaixo, setArrIdsEstoqueBaixo] = useState<number[]>([]);
  const [arrMovimentos,      setArrMovimentos]      = useState<Movimento[]>([]);
  const [formulario,         setFormulario]         = useState<FormularioInsumo>(OBJ_FORMULARIO_INSUMO_INICIAL);
  const [formMovimento,      setFormMovimento]      = useState<FormularioMovimento>(OBJ_FORMULARIO_MOVIMENTO_INICIAL);
  const [nrIdEditando,       setNrIdEditando]       = useState<number | null>(null);
  const [nrIdMovimentando,   setNrIdMovimentando]   = useState<number | null>(null);
  const [dsFiltroHistorico,  setDsFiltroHistorico]  = useState("");
  const [dsBusca,            setDsBusca]            = useState("");
  const [flCarregando,       setFlCarregando]       = useState(true);
  const [flSalvando,         setFlSalvando]         = useState(false);
  const [dsErro,             setDsErro]             = useState("");
  const [dsSucesso,          setDsSucesso]          = useState("");

  const carregarDados = useCallback(async (dsFiltro: string) => {
    setFlCarregando(true);

    try
    {
      const dsConsultaMovimentos = dsFiltro ? `movimentos-estoque?id_insumo=${dsFiltro}` : "movimentos-estoque";
      const [arrInsumosApi, arrBaixoApi, arrMovimentosApi] = await Promise.all([
        apiGet<Insumo[]>("insumos"),
        apiGet<Insumo[]>("insumos/estoque-baixo"),
        apiGet<Movimento[]>(dsConsultaMovimentos),
      ]);

      setArrInsumos(arrInsumosApi);
      setArrIdsEstoqueBaixo(arrBaixoApi.map((insumo) => insumo.id_insumo));
      setArrMovimentos(arrMovimentosApi);
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível carregar o estoque.");
    }
    finally
    {
      setFlCarregando(false);
    }
  }, []);

  useCarregarAoMontar(useCallback(() => carregarDados(""), [carregarDados]));

  function limparMensagens()
  {
    setDsErro("");
    setDsSucesso("");
  }

  function limparFormulario()
  {
    setFormulario(OBJ_FORMULARIO_INSUMO_INICIAL);
    setNrIdEditando(null);
    limparMensagens();
  }

  function iniciarEdicao(insumo: Insumo)
  {
    setNrIdEditando(insumo.id_insumo);
    setNrIdMovimentando(null);
    setFormulario({
      nm_insumo: insumo.nm_insumo,
      unidade_medida: insumo.unidade_medida,
      qt_estoque_inicial: "",
      qt_estoque_minimo: String(Number(insumo.qt_estoque_minimo)),
    });
    limparMensagens();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function iniciarMovimento(insumo: Insumo)
  {
    setNrIdMovimentando(insumo.id_insumo);
    setNrIdEditando(null);
    setFormulario(OBJ_FORMULARIO_INSUMO_INICIAL);
    setFormMovimento(OBJ_FORMULARIO_MOVIMENTO_INICIAL);
    limparMensagens();
  }

  async function salvarInsumo(evento: FormEvent<HTMLFormElement>)
  {
    evento.preventDefault();
    limparMensagens();

    const nmInsumo  = formulario.nm_insumo.trim();
    const qtMinimo  = lerQuantidade(formulario.qt_estoque_minimo);
    const qtInicial = lerQuantidade(formulario.qt_estoque_inicial);

    if (nmInsumo.length < 2)
    {
      setDsErro("Informe o nome do insumo (mínimo de 2 letras).");
      return;
    }

    if (Number.isNaN(qtMinimo) || Number.isNaN(qtInicial))
    {
      setDsErro("Use quantidades positivas com até 3 casas decimais.");
      return;
    }

    setFlSalvando(true);

    try
    {
      if (nrIdEditando !== null)
      {
        await apiPatch(`insumos/${nrIdEditando}`, { nm_insumo: nmInsumo, qt_estoque_minimo: qtMinimo ?? 0 });
        setDsSucesso("Insumo atualizado com sucesso!");
      }
      else
      {
        await apiPost("insumos", {
          nm_insumo: nmInsumo,
          unidade_medida: formulario.unidade_medida,
          ...(qtMinimo !== null ? { qt_estoque_minimo: qtMinimo } : {}),
          ...(qtInicial !== null ? { qt_estoque_inicial: qtInicial } : {}),
        });
        setDsSucesso("Insumo cadastrado com sucesso!");
      }

      setFormulario(OBJ_FORMULARIO_INSUMO_INICIAL);
      setNrIdEditando(null);
      await carregarDados(dsFiltroHistorico);
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível salvar o insumo.");
    }
    finally
    {
      setFlSalvando(false);
    }
  }

  async function registrarMovimento(evento: FormEvent<HTMLFormElement>)
  {
    evento.preventDefault();
    limparMensagens();

    if (nrIdMovimentando === null)
      return;

    const qtMovimento = lerQuantidade(formMovimento.qt_movimento);
    const dsMotivo    = formMovimento.ds_motivo.trim();

    if (qtMovimento === null || Number.isNaN(qtMovimento) || qtMovimento <= 0)
    {
      setDsErro("Informe uma quantidade maior que zero, com até 3 casas decimais.");
      return;
    }

    if (formMovimento.tipo_movimento === "PERDA" && !dsMotivo)
    {
      setDsErro("Informe o motivo da perda.");
      return;
    }

    setFlSalvando(true);

    try
    {
      await apiPost("movimentos-estoque", {
        id_insumo: nrIdMovimentando,
        tipo_movimento: formMovimento.tipo_movimento,
        qt_movimento: qtMovimento,
        ...(dsMotivo ? { ds_motivo: dsMotivo } : {}),
      });

      setDsSucesso(formMovimento.tipo_movimento === "ENTRADA" ? "Entrada registrada!" : "Perda registrada!");
      setFormMovimento(OBJ_FORMULARIO_MOVIMENTO_INICIAL);
      setNrIdMovimentando(null);
      await carregarDados(dsFiltroHistorico);
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível registrar o movimento.");
    }
    finally
    {
      setFlSalvando(false);
    }
  }

  async function excluirInsumo(insumo: Insumo)
  {
    if (!window.confirm(`Deseja realmente excluir o insumo "${insumo.nm_insumo}"?`))
      return;

    limparMensagens();

    try
    {
      await apiDelete(`insumos/${insumo.id_insumo}`);

      if (nrIdEditando === insumo.id_insumo)
        limparFormulario();

      if (nrIdMovimentando === insumo.id_insumo)
        setNrIdMovimentando(null);

      setDsSucesso("Insumo excluído com sucesso!");
      await carregarDados(dsFiltroHistorico);
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível excluir o insumo.");
    }
  }

  async function mudarFiltroHistorico(dsNovoFiltro: string)
  {
    setDsFiltroHistorico(dsNovoFiltro);
    await carregarDados(dsNovoFiltro);
  }

  const insumoMovimentando  = arrInsumos.find((insumo)   => insumo.id_insumo === nrIdMovimentando);
  const arrInsumosBaixos    = arrInsumos.filter((insumo) => arrIdsEstoqueBaixo.includes(insumo.id_insumo));
  const arrInsumosFiltrados = arrInsumos.filter((insumo) => insumo.nm_insumo.toLowerCase().includes(dsBusca.trim().toLowerCase()));

  return (
    <div className={estilos.pagina}>
      <header>
        <p className="sobretitulo">Gerenciamento</p>
        <h1 className={estilos.titulo}>Estoque</h1>
        <p className={estilos.descricao}>
          Cadastre os insumos, registre compras e perdas e acompanhe o que está acabando.
          O consumo dos pedidos entra sozinho, conforme a receita de cada item.
        </p>
      </header>

      <section className={estilos.estatisticas}>
        <div className={estilos.cartao}>
          <p className={estilos.estatisticaRotulo}>Insumos cadastrados</p>
          <p className={estilos.estatisticaValor}>{arrInsumos.length}</p>
        </div>

        <div className={estilos.cartao}>
          <p className={estilos.estatisticaRotulo}>Com estoque baixo</p>
          <p className={estilos.estatisticaValor}>{arrInsumosBaixos.length}</p>
        </div>
      </section>

      {arrInsumosBaixos.length > 0 && (
        <div role="status" className={`${estilos.alerta} ${estilos.alertaAviso}`}>
          Estoque baixo: {arrInsumosBaixos.map((insumo) => `${insumo.nm_insumo} (${descreverQuantidade(insumo.qt_estoque, insumo.unidade_medida)})`).join(", ")}.
        </div>
      )}

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

      {insumoMovimentando ? (
        <section className={estilos.cartao}>
          <h2 className={estilos.tituloCartao}>Movimentar estoque: {insumoMovimentando.nm_insumo}</h2>
          <p className={estilos.subtituloCartao}>
            Estoque atual: {descreverQuantidade(insumoMovimentando.qt_estoque, insumoMovimentando.unidade_medida)}.
            A saída por pedido é automática, aqui só entram compras e perdas.
          </p>

          <form onSubmit={registrarMovimento} className={estilos.formulario}>
            <div className={estilos.camposLinha}>
              <div>
                <label htmlFor="tipo_movimento" className={estilos.rotulo}>Tipo *</label>
                <select
                  id="tipo_movimento"
                  value={formMovimento.tipo_movimento}
                  onChange={(evento) => setFormMovimento({ ...formMovimento, tipo_movimento: evento.target.value as "ENTRADA" | "PERDA" })}
                  className={estilos.entrada}
                >
                  <option value="ENTRADA">{OBJ_NOMES_TIPO_MOVIMENTO.ENTRADA} (compra)</option>
                  <option value="PERDA">{OBJ_NOMES_TIPO_MOVIMENTO.PERDA}</option>
                </select>
              </div>

              <div>
                <label htmlFor="qt_movimento" className={estilos.rotulo}>
                  Quantidade ({OBJ_ROTULOS_UNIDADE[insumoMovimentando.unidade_medida]}) *
                </label>
                <input
                  id="qt_movimento"
                  type="number"
                  inputMode="decimal"
                  min="0.001"
                  step="0.001"
                  value={formMovimento.qt_movimento}
                  onChange={(evento) => setFormMovimento({ ...formMovimento, qt_movimento: evento.target.value })}
                  required
                  className={estilos.entrada}
                />
              </div>
            </div>

            <div>
              <label htmlFor="ds_motivo" className={estilos.rotulo}>
                Motivo {formMovimento.tipo_movimento === "PERDA" ? "*" : "(opcional)"}
              </label>
              <input
                id="ds_motivo"
                type="text"
                value={formMovimento.ds_motivo}
                onChange={(evento) => setFormMovimento({ ...formMovimento, ds_motivo: evento.target.value })}
                placeholder="Ex.: Compra no fornecedor, produto vencido"
                maxLength={200}
                className={estilos.entrada}
              />
            </div>

            <div className={estilos.botoes}>
              <button type="submit" disabled={flSalvando} className={`${estilos.botao} ${estilos.botaoPrimario}`}>
                {flSalvando ? "Registrando..." : "Registrar movimento"}
              </button>
              <button
                type="button"
                onClick={() => setNrIdMovimentando(null)}
                className={`${estilos.botao} ${estilos.botaoSecundario}`}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className={estilos.cartao}>
          <h2 className={estilos.tituloCartao}>{nrIdEditando !== null ? "Editar insumo" : "Novo insumo"}</h2>
          <p className={estilos.subtituloCartao}>
            {nrIdEditando !== null
              ? "A unidade e o estoque não mudam por aqui: o estoque só muda por movimento."
              : "O estoque inicial vira a primeira entrada no histórico."}
          </p>

          <form onSubmit={salvarInsumo} className={estilos.formulario}>
            <div className={estilos.camposLinha}>
              <div>
                <label htmlFor="nm_insumo" className={estilos.rotulo}>Nome do insumo *</label>
                <input
                  id="nm_insumo"
                  type="text"
                  value={formulario.nm_insumo}
                  onChange={(evento) => setFormulario({ ...formulario, nm_insumo: evento.target.value })}
                  placeholder="Ex.: Carne moída, Pão de hambúrguer"
                  maxLength={100}
                  required
                  className={estilos.entrada}
                />
              </div>

              <div>
                <label htmlFor="unidade_medida" className={estilos.rotulo}>Unidade de medida *</label>
                <select
                  id="unidade_medida"
                  value={formulario.unidade_medida}
                  onChange={(evento) => setFormulario({ ...formulario, unidade_medida: evento.target.value })}
                  disabled={nrIdEditando !== null}
                  className={estilos.entrada}
                >
                  {ARR_UNIDADES.map((dsUnidade) => (
                    <option key={dsUnidade} value={dsUnidade}>{OBJ_ROTULOS_UNIDADE[dsUnidade]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={estilos.camposLinha}>
              {nrIdEditando === null && (
                <div>
                  <label htmlFor="qt_estoque_inicial" className={estilos.rotulo}>Estoque inicial</label>
                  <input
                    id="qt_estoque_inicial"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.001"
                    value={formulario.qt_estoque_inicial}
                    onChange={(evento) => setFormulario({ ...formulario, qt_estoque_inicial: evento.target.value })}
                    placeholder="0"
                    className={estilos.entrada}
                  />
                </div>
              )}

              <div>
                <label htmlFor="qt_estoque_minimo" className={estilos.rotulo}>Estoque mínimo (alerta)</label>
                <input
                  id="qt_estoque_minimo"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.001"
                  value={formulario.qt_estoque_minimo}
                  onChange={(evento) => setFormulario({ ...formulario, qt_estoque_minimo: evento.target.value })}
                  placeholder="0"
                  className={estilos.entrada}
                />
              </div>
            </div>

            <div className={estilos.botoes}>
              <button type="submit" disabled={flSalvando} className={`${estilos.botao} ${estilos.botaoPrimario}`}>
                {flSalvando ? "Salvando..." : nrIdEditando !== null ? "Salvar alterações" : "Cadastrar insumo"}
              </button>

              {nrIdEditando !== null && (
                <button type="button" onClick={limparFormulario} className={`${estilos.botao} ${estilos.botaoSecundario}`}>
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      <section className={estilos.cartaoTabela}>
        <div className={estilos.cabecalhoCartao}>
          <div>
            <h2 className={estilos.tituloCartao}>Insumos cadastrados</h2>
            <p className={estilos.subtituloCartao}>Estoque atual de cada insumo.</p>
          </div>

          <button
            type="button"
            onClick={() => void carregarDados(dsFiltroHistorico)}
            disabled={flCarregando}
            className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
          >
            Atualizar lista
          </button>
        </div>

        <div className={estilos.corpoCartao}>
          <label htmlFor="busca" className={estilos.somenteLeitor}>Buscar insumo</label>
          <input
            id="busca"
            type="search"
            value={dsBusca}
            onChange={(evento) => setDsBusca(evento.target.value)}
            placeholder="Buscar por nome..."
            className={`${estilos.entrada} ${estilos.busca}`}
          />

          {flCarregando && arrInsumos.length === 0 ? (
            <p className={estilos.carregando}>Carregando insumos...</p>
          ) : arrInsumosFiltrados.length === 0 ? (
            <div className={estilos.vazio}>
              <p className={estilos.vazioTitulo}>
                {arrInsumos.length === 0 ? "Nenhum insumo cadastrado." : "Nenhum insumo encontrado."}
              </p>
              <p className={estilos.vazioTexto}>
                {arrInsumos.length === 0 ? "Use o formulário acima para cadastrar o primeiro insumo." : "Tente pesquisar usando outro nome."}
              </p>
            </div>
          ) : (
            <div className={estilos.tabelaRolagem}>
              <table className={estilos.tabela}>
                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th>Estoque</th>
                    <th>Mínimo</th>
                    <th>Situação</th>
                    <th className={estilos.alinharDireita}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {arrInsumosFiltrados.map((insumo) => {
                    const flBaixo = arrIdsEstoqueBaixo.includes(insumo.id_insumo);

                    return (
                      <tr key={insumo.id_insumo}>
                        <td><strong>{insumo.nm_insumo}</strong></td>
                        <td>{descreverQuantidade(insumo.qt_estoque, insumo.unidade_medida)}</td>
                        <td className={estilos.textoSuave}>{descreverQuantidade(insumo.qt_estoque_minimo, insumo.unidade_medida)}</td>
                        <td>
                          <span className={`${estilos.seloEstado} ${flBaixo ? estilos.seloAguardando : estilos.seloSucesso}`}>
                            {flBaixo ? "Estoque baixo" : "Normal"}
                          </span>
                        </td>
                        <td>
                          <div className={estilos.acoesLinha}>
                            <button
                              type="button"
                              onClick={() => iniciarMovimento(insumo)}
                              className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.botaoPequeno}`}
                            >
                              Movimentar
                            </button>
                            <button
                              type="button"
                              onClick={() => iniciarEdicao(insumo)}
                              className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => void excluirInsumo(insumo)}
                              className={`${estilos.botao} ${estilos.botaoPerigo} ${estilos.botaoPequeno}`}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className={estilos.cartaoTabela}>
        <div className={estilos.cabecalhoCartao}>
          <div>
            <h2 className={estilos.tituloCartao}>Histórico de movimentos</h2>
            <p className={estilos.subtituloCartao}>Os 200 movimentos mais recentes.</p>
          </div>
        </div>

        <div className={estilos.corpoCartao}>
          <label htmlFor="filtro_historico" className={estilos.somenteLeitor}>Filtrar por insumo</label>
          <select
            id="filtro_historico"
            value={dsFiltroHistorico}
            onChange={(evento) => void mudarFiltroHistorico(evento.target.value)}
            className={`${estilos.entrada} ${estilos.busca}`}
          >
            <option value="">Todos os insumos</option>
            {arrInsumos.map((insumo) => (
              <option key={insumo.id_insumo} value={insumo.id_insumo}>{insumo.nm_insumo}</option>
            ))}
          </select>

          {arrMovimentos.length === 0 ? (
            <div className={estilos.vazio}>
              <p className={estilos.vazioTitulo}>Nenhum movimento registrado.</p>
            </div>
          ) : (
            <div className={estilos.tabelaRolagem}>
              <table className={estilos.tabela}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Insumo</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {arrMovimentos.map((movimento) => (
                    <tr key={movimento.id_movimento_estoque}>
                      <td className={estilos.textoSuave}>{formatarDataHora(movimento.dt_movimento)}</td>
                      <td><strong>{movimento.insumo.nm_insumo}</strong></td>
                      <td>
                        <span className={`${estilos.seloEstado} ${OBJ_CLASSE_TIPO_MOVIMENTO[movimento.tipo_movimento] ?? estilos.seloNeutro}`}>
                          {OBJ_NOMES_TIPO_MOVIMENTO[movimento.tipo_movimento] ?? movimento.tipo_movimento}
                        </span>
                      </td>
                      <td>{descreverQuantidade(movimento.qt_movimento, movimento.insumo.unidade_medida)}</td>
                      <td className={estilos.textoSuave}>
                        {movimento.ds_motivo ?? (movimento.id_item_pedido ? `Item de pedido #${movimento.id_item_pedido}` : "")}
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
