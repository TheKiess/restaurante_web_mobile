
"use client";

import { useCallback, useEffect, useState }     from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import estilos                                  from "@/componentes/Painel/Painel.module.css";

type Mesa = {
  id_mesa: number;
  nr_mesa: number;
  qt_lugares: number;
};

type FormularioMesa = {
  nr_mesa: string;
  qt_lugares: string;
};

const formularioInicial: FormularioMesa = {
  nr_mesa: "",
  qt_lugares: "",
};

export default function MesasPage()
{
  const [mesas, setMesas]               = useState<Mesa[]>([]);
  const [formulario, setFormulario]     = useState<FormularioMesa>(formularioInicial);
  const [mesaEditando, setMesaEditando] = useState<number | null>(null);
  const [carregando, setCarregando]     = useState(true);
  const [salvando, setSalvando]         = useState(false);
  const [erro, setErro]                 = useState("");
  const [sucesso, setSucesso]           = useState("");
  const carregarMesas                   = useCallback(async () => {
    try
    {
      const dados = await apiGet<Mesa[]>("mesas");

      setMesas(
        [...dados].sort((a, b) => a.nr_mesa - b.nr_mesa)
      );
    }
    catch (error)
    {
      setErro(error instanceof Error
        ? error.message
        : "Não foi possível carregar as mesas."
      );
    }
    finally
    {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(carregarMesas);
  }, [carregarMesas]);

  function alterarCampo(campo: keyof FormularioMesa,
    valor: string
  )
  {
    setFormulario((atual) => ({...atual, [campo]: valor }));
  }

  function limparFormulario()
  {
    setFormulario(formularioInicial);
    setMesaEditando(null);
    setErro("");
    setSucesso("");
  }

  async function salvarMesa(evento: React.FormEvent<HTMLFormElement>)
  {
    evento.preventDefault();
    setErro("");
    setSucesso("");

    const nrMesa    = Number(formulario.nr_mesa);
    const qtLugares = Number(formulario.qt_lugares);

    if (!Number.isInteger(nrMesa)  ||
      nrMesa < 1                   ||
      !Number.isInteger(qtLugares) ||
      qtLugares < 1
    )
    {
      setErro("Informe números inteiros maiores que zero.");
      return;
    }

    const dados = {
      nr_mesa: nrMesa,
      qt_lugares: qtLugares,
    };

    setSalvando(true);

    try
    {
      if (mesaEditando !== null)
      {
        await apiPatch<Mesa>(`mesas/${mesaEditando}`, dados);
        setSucesso("Mesa atualizada com sucesso!");
      }
      else
      {
        await apiPost<Mesa>("mesas", dados);
        setSucesso("Mesa cadastrada com sucesso!");
      }

      setFormulario(formularioInicial);
      setMesaEditando(null);
      setCarregando(true);
      await carregarMesas();
    }
    catch (error)
    {
      setErro(error instanceof Error
        ? error.message
        : "Não foi possível salvar a mesa."
      );
    }
    finally
    {
      setSalvando(false);
    }
  }

  function editarMesa(mesa: Mesa)
  {
    setMesaEditando(mesa.id_mesa);
    setFormulario({nr_mesa: String(mesa.nr_mesa),
      qt_lugares: String(mesa.qt_lugares),
    });
    setErro("");
    setSucesso("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function excluirMesa(mesa: Mesa)
  {
    const confirmar = window.confirm(`Deseja realmente excluir a mesa ${mesa.nr_mesa}?`);

    if (!confirmar)
      return;

    setErro("");
    setSucesso("");

    try
    {
      await apiDelete<void>(`mesas/${mesa.id_mesa}`);

      setSucesso(`Mesa ${mesa.nr_mesa} excluída com sucesso!`);

      if (mesaEditando === mesa.id_mesa)
      {
        setFormulario(formularioInicial);
        setMesaEditando(null);
      }

      setCarregando(true);
      await carregarMesas();
    }
    catch (error)
    {
      setErro(error instanceof Error
        ? error.message
        : "Não foi possível excluir a mesa."
      );
    }
  }

  const totalLugares = mesas.reduce((total, mesa) => total + mesa.qt_lugares, 0);

  return (
    <div className={estilos.pagina}>
      <header>
        <p className="sobretitulo">Administração</p>
        <h1 className={estilos.titulo}>Gerenciamento de Mesas</h1>
        <p className={estilos.descricao}>
          Cadastre, consulte, edite e remova as mesas do restaurante.
        </p>
      </header>

      <section className={estilos.estatisticas}>
        <div className={estilos.cartao}>
          <p className={estilos.estatisticaRotulo}>Mesas cadastradas</p>
          <p className={estilos.estatisticaValor}>{mesas.length}</p>
        </div>

        <div className={estilos.cartao}>
          <p className={estilos.estatisticaRotulo}>Capacidade total</p>
          <p className={estilos.estatisticaValor}>
            {totalLugares}
            <span className={estilos.estatisticaUnidade}>lugares</span>
          </p>
        </div>
      </section>

      <section className={estilos.cartao}>
        <h2 className={estilos.tituloCartao}>
          {mesaEditando !== null ? "Editar mesa" : "Cadastrar mesa"}
        </h2>

        <form onSubmit={salvarMesa} className={estilos.formulario}>
          <div className={estilos.camposLinha}>
            <div>
              <label htmlFor="nr_mesa" className={estilos.rotulo}>
                Número da mesa
              </label>
              <input
                id="nr_mesa"
                type="number"
                min="1"
                step="1"
                required
                value={formulario.nr_mesa}
                onChange={(e) => alterarCampo("nr_mesa", e.target.value)}
                className={estilos.entrada}
                placeholder="Ex.: 1"
              />
            </div>

            <div>
              <label htmlFor="qt_lugares" className={estilos.rotulo}>
                Quantidade de lugares
              </label>
              <input
                id="qt_lugares"
                type="number"
                min="1"
                step="1"
                required
                value={formulario.qt_lugares}
                onChange={(e) => alterarCampo("qt_lugares", e.target.value)}
                className={estilos.entrada}
                placeholder="Ex.: 4"
              />
            </div>

            <div className={estilos.botoes}>
              <button
                type="submit"
                disabled={salvando}
                className={`${estilos.botao} ${estilos.botaoPrimario}`}
              >
                {salvando
                  ? "Salvando..."
                  : mesaEditando !== null
                    ? "Salvar alterações"
                    : "Cadastrar mesa"}
              </button>

              {mesaEditando !== null && (
                <button
                  type="button"
                  onClick={limparFormulario}
                  className={`${estilos.botao} ${estilos.botaoSecundario}`}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {erro && (
            <p role="alert" className={`${estilos.alerta} ${estilos.alertaErro}`}>
              {erro}
            </p>
          )}

          {sucesso && !erro && (
            <p role="status" className={`${estilos.alerta} ${estilos.alertaSucesso}`}>
              {sucesso}
            </p>
          )}
        </form>
      </section>

      <section className={estilos.cartaoTabela}>
        <div className={estilos.cabecalhoCartao}>
          <div>
            <h2 className={estilos.tituloCartao}>Mesas cadastradas</h2>
            <p className={estilos.subtituloCartao}>
              Lista ordenada pelo número da mesa.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setErro("");
              setCarregando(true);
              void carregarMesas();
            }}
            disabled={carregando}
            className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
          >
            {carregando ? "Atualizando..." : "Atualizar lista"}
          </button>
        </div>

        {carregando ? (
          <p className={estilos.carregando}>Carregando mesas...</p>
        ) : mesas.length === 0 ? (
          <div className={estilos.vazio}>
            <p className={estilos.vazioTitulo}>Nenhuma mesa cadastrada</p>
            <p className={estilos.vazioTexto}>
              Utilize o formulário acima para cadastrar a primeira mesa.
            </p>
          </div>
        ) : (
          <div className={estilos.tabelaRolagem}>
            <table className={estilos.tabela}>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Lugares</th>
                  <th className={estilos.alinharDireita}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {mesas.map((mesa) => (
                  <tr key={mesa.id_mesa}>
                    <td>
                      <span className={estilos.selo}>{mesa.nr_mesa}</span>
                    </td>

                    <td>
                      {mesa.qt_lugares}{" "}
                      {mesa.qt_lugares === 1 ? "lugar" : "lugares"}
                    </td>

                    <td>
                      <div className={estilos.acoesLinha}>
                        <button
                          type="button"
                          onClick={() => editarMesa(mesa)}
                          className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => void excluirMesa(mesa)}
                          className={`${estilos.botao} ${estilos.botaoPerigo} ${estilos.botaoPequeno}`}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
