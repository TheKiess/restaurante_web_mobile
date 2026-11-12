"use client";

import { useCallback, useState }                    from "react";
import { apiGet, apiPut }                           from "@/lib/api";
import { OBJ_NOMES_TIPO_ITEM, OBJ_ROTULOS_UNIDADE } from "@/lib/constantes";
import { useCarregarAoMontar }                      from "@/lib/useCarregarAoMontar";
import estilos                                      from "@/estilos/Painel.module.css";

type ItemCardapio = {
  id_item_cardapio: number;
  nm_item: string;
  tipo_item: string;
  categoria?: { nm_categoria: string };
};

type Insumo = {
  id_insumo: number;
  nm_insumo: string;
  unidade_medida: string;
};

type IngredienteApi = {
  id_insumo: number;
  qt_insumo: string;
};

type Ingrediente = {
  id_insumo: string;
  qt_insumo: string;
};

export default function ReceitasPage()
{
  const [arrItens,            setArrItens]            = useState<ItemCardapio[]>([]);
  const [arrInsumos,          setArrInsumos]          = useState<Insumo[]>([]);
  const [arrIngredientes,     setArrIngredientes]     = useState<Ingrediente[]>([]);
  const [dsIdItem,            setDsIdItem]            = useState("");
  const [flCarregando,        setFlCarregando]        = useState(true);
  const [flCarregandoReceita, setFlCarregandoReceita] = useState(false);
  const [flAlterado,          setFlAlterado]          = useState(false);
  const [flSalvando,          setFlSalvando]          = useState(false);
  const [dsErro,              setDsErro]              = useState("");
  const [dsSucesso,           setDsSucesso]           = useState("");

  const carregarDados = useCallback(async () => {
    setFlCarregando(true);

    try
    {
      const [arrItensApi, arrInsumosApi] = await Promise.all([
        apiGet<ItemCardapio[]>("itens-cardapio"),
        apiGet<Insumo[]>("insumos"),
      ]);

      setArrItens(arrItensApi);
      setArrInsumos(arrInsumosApi);
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível carregar o cardápio e os insumos.");
    }
    finally
    {
      setFlCarregando(false);
    }
  }, []);

  useCarregarAoMontar(carregarDados);

  async function carregarReceita(dsIdItemEscolhido: string)
  {
    setFlCarregandoReceita(true);

    try
    {
      const arrReceita = await apiGet<IngredienteApi[]>(`itens-cardapio/${dsIdItemEscolhido}/receita`);

      setArrIngredientes(arrReceita.map((ingrediente) => ({
        id_insumo: String(ingrediente.id_insumo),
        qt_insumo: String(Number(ingrediente.qt_insumo)),
      })));
      setFlAlterado(false);
    }
    catch (erro)
    {
      setArrIngredientes([]);
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível carregar a receita.");
    }
    finally
    {
      setFlCarregandoReceita(false);
    }
  }

  async function escolherItem(dsIdNovo: string)
  {
    if (flAlterado && !window.confirm("Há alterações não salvas nesta receita. Deseja descartá-las?"))
      return;

    setDsErro("");
    setDsSucesso("");
    setDsIdItem(dsIdNovo);
    setArrIngredientes([]);
    setFlAlterado(false);

    if (dsIdNovo)
      await carregarReceita(dsIdNovo);
  }

  function adicionarIngrediente()
  {
    const arrDisponiveis = arrInsumos.filter((insumo) => !arrIngredientes.some((ingrediente) => ingrediente.id_insumo === String(insumo.id_insumo)));

    if (arrDisponiveis.length === 0)
    {
      setDsErro("Todos os insumos cadastrados já estão nesta receita.");
      return;
    }

    setDsErro("");
    setArrIngredientes([...arrIngredientes, { id_insumo: String(arrDisponiveis[0].id_insumo), qt_insumo: "" }]);
    setFlAlterado(true);
  }

  function alterarIngrediente(nrPosicao: number, objMudanca: Partial<Ingrediente>)
  {
    setArrIngredientes(arrIngredientes.map((ingrediente, nrAtual) => (nrAtual === nrPosicao ? { ...ingrediente, ...objMudanca } : ingrediente)));
    setFlAlterado(true);
  }

  function removerIngrediente(nrPosicao: number)
  {
    setArrIngredientes(arrIngredientes.filter((_, nrAtual) => nrAtual !== nrPosicao));
    setFlAlterado(true);
  }

  async function salvarReceita()
  {
    setDsErro("");
    setDsSucesso("");

    const arrEnvio = arrIngredientes.map((ingrediente) => ({
      id_insumo: Number(ingrediente.id_insumo),
      qt_insumo: Number(ingrediente.qt_insumo),
    }));

    const flInvalido = arrEnvio.some(
      (ingrediente) => !Number.isFinite(ingrediente.qt_insumo) || ingrediente.qt_insumo <= 0 || Math.round(ingrediente.qt_insumo * 1000) / 1000 !== ingrediente.qt_insumo
    );

    if (flInvalido)
    {
      setDsErro("Cada ingrediente precisa de uma quantidade maior que zero, com até 3 casas decimais.");
      return;
    }

    setFlSalvando(true);

    try
    {
      await apiPut(`itens-cardapio/${dsIdItem}/receita`, { ingredientes: arrEnvio });

      setDsSucesso(arrEnvio.length === 0 ? "Receita removida: este item não consome estoque." : "Receita salva com sucesso!");
      await carregarReceita(dsIdItem);
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error ? erro.message : "Não foi possível salvar a receita.");
    }
    finally
    {
      setFlSalvando(false);
    }
  }

  const itemEscolhido = arrItens.find((item) => String(item.id_item_cardapio) === dsIdItem);

  return (
    <div className={estilos.pagina}>
      <header>
        <p className="sobretitulo">Gerenciamento</p>
        <h1 className={estilos.titulo}>Receitas</h1>
        <p className={estilos.descricao}>
          Diga quanto de cada insumo um item do cardápio consome. Item sem receita não mexe no estoque.
        </p>
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
        <h2 className={estilos.tituloCartao}>Item do cardápio</h2>
        <p className={estilos.subtituloCartao}>
          Item de revenda dá baixa ao ser lançado no pedido. Item preparado dá baixa quando a cozinha começa o preparo.
        </p>

        <div className={estilos.formulario}>
          <div>
            <label htmlFor="item" className={estilos.rotulo}>Escolha o item</label>
            <select
              id="item"
              value={dsIdItem}
              onChange={(evento) => void escolherItem(evento.target.value)}
              disabled={flCarregando}
              className={estilos.entrada}
            >
              <option value="">{flCarregando ? "Carregando..." : "Selecione um item"}</option>
              {arrItens.map((item) => (
                <option key={item.id_item_cardapio} value={item.id_item_cardapio}>
                  {item.nm_item} ({OBJ_NOMES_TIPO_ITEM[item.tipo_item] ?? item.tipo_item})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {itemEscolhido && (
        <section className={estilos.cartaoTabela}>
          <div className={estilos.cabecalhoCartao}>
            <div>
              <h2 className={estilos.tituloCartao}>Receita de {itemEscolhido.nm_item}</h2>
              <p className={estilos.subtituloCartao}>
                {OBJ_NOMES_TIPO_ITEM[itemEscolhido.tipo_item] ?? itemEscolhido.tipo_item}
                {itemEscolhido.categoria ? ` · ${itemEscolhido.categoria.nm_categoria}` : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={adicionarIngrediente}
              disabled={flCarregandoReceita || arrInsumos.length === 0}
              className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
            >
              Adicionar ingrediente
            </button>
          </div>

          <div className={estilos.corpoCartao}>
            {arrInsumos.length === 0 ? (
              <div className={estilos.vazio}>
                <p className={estilos.vazioTitulo}>Nenhum insumo cadastrado.</p>
                <p className={estilos.vazioTexto}>Cadastre os insumos na tela de Estoque antes de montar a receita.</p>
              </div>
            ) : flCarregandoReceita ? (
              <p className={estilos.carregando}>Carregando receita...</p>
            ) : arrIngredientes.length === 0 ? (
              <div className={estilos.vazio}>
                <p className={estilos.vazioTitulo}>Este item não consome estoque.</p>
                <p className={estilos.vazioTexto}>Use o botão acima para adicionar o primeiro ingrediente.</p>
              </div>
            ) : (
              <div className={estilos.tabelaRolagem}>
                <table className={estilos.tabela}>
                  <thead>
                    <tr>
                      <th>Insumo</th>
                      <th>Quantidade por unidade vendida</th>
                      <th className={estilos.alinharDireita}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arrIngredientes.map((ingrediente, nrPosicao) => {
                      const insumoAtual = arrInsumos.find((insumo) => String(insumo.id_insumo) === ingrediente.id_insumo);

                      return (
                        <tr key={nrPosicao}>
                          <td>
                            <label htmlFor={`insumo_${nrPosicao}`} className={estilos.somenteLeitor}>Insumo</label>
                            <select
                              id={`insumo_${nrPosicao}`}
                              value={ingrediente.id_insumo}
                              onChange={(evento) => alterarIngrediente(nrPosicao, { id_insumo: evento.target.value })}
                              className={estilos.entrada}
                            >
                              {arrInsumos
                                .filter((insumo) => String(insumo.id_insumo) === ingrediente.id_insumo
                                  || !arrIngredientes.some((outro) => outro.id_insumo === String(insumo.id_insumo)))
                                .map((insumo) => (
                                  <option key={insumo.id_insumo} value={insumo.id_insumo}>{insumo.nm_insumo}</option>
                                ))}
                            </select>
                          </td>
                          <td>
                            <label htmlFor={`quantidade_${nrPosicao}`} className={estilos.somenteLeitor}>Quantidade</label>
                            <input
                              id={`quantidade_${nrPosicao}`}
                              type="number"
                              inputMode="decimal"
                              min="0.001"
                              step="0.001"
                              value={ingrediente.qt_insumo}
                              onChange={(evento) => alterarIngrediente(nrPosicao, { qt_insumo: evento.target.value })}
                              placeholder={insumoAtual ? `em ${OBJ_ROTULOS_UNIDADE[insumoAtual.unidade_medida]}` : ""}
                              className={estilos.entrada}
                            />
                          </td>
                          <td>
                            <div className={estilos.acoesLinha}>
                              <button
                                type="button"
                                onClick={() => removerIngrediente(nrPosicao)}
                                className={`${estilos.botao} ${estilos.botaoPerigo} ${estilos.botaoPequeno}`}
                              >
                                Remover
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

            {!flCarregandoReceita && arrInsumos.length > 0 && (
              <div className={`${estilos.botoes} ${estilos.espacoTopo}`}>
                <button
                  type="button"
                  onClick={() => void salvarReceita()}
                  disabled={flSalvando || !flAlterado}
                  className={`${estilos.botao} ${estilos.botaoPrimario}`}
                >
                  {flSalvando ? "Salvando..." : "Salvar receita"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
