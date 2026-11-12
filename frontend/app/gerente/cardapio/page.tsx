
"use client";

import { useCallback, useState }                from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { useCarregarAoMontar }                  from "@/lib/useCarregarAoMontar";
import estilos                                  from "@/estilos/Painel.module.css";
import { formatarMoeda }                        from "@/lib/formatar";

type Categoria = {
  id_categoria: number;
  nm_categoria: string;
  id_categoria_pai?: number | null;
};

type ItemCardapio = {
  id_item_cardapio: number;
  id_categoria: number;
  nm_item: string;
  ds_item: string | null;
  vl_unitario: number | string;
  tipo_item: "PREPARADO" | "REVENDA";
  disponivel: boolean;
  categoria?: Categoria;
};

type FormularioItem = {
  id_categoria: string;
  nm_item: string;
  ds_item: string;
  vl_unitario: string;
  tipo_item: "PREPARADO" | "REVENDA";
  disponivel: boolean;
};

const OBJ_FORMULARIO_INICIAL: FormularioItem = {
  id_categoria: "",
  nm_item: "",
  ds_item: "",
  vl_unitario: "",
  tipo_item: "PREPARADO",
  disponivel: true,
};

export default function CardapioPage()
{
  const [arrItens,                setArrItens]                = useState<ItemCardapio[]>([]);
  const [arrCategorias,           setArrCategorias]           = useState<Categoria[]>([]);
  const [objFormulario,           setObjFormulario]           = useState<FormularioItem>(OBJ_FORMULARIO_INICIAL);
  const [idItemEditando,          setIdItemEditando]          = useState<number | null>(null);
  const [dsBusca,                 setDsBusca]                 = useState("");
  const [dsFiltroCategoria,       setDsFiltroCategoria]       = useState("TODAS");
  const [dsFiltroDisponibilidade, setDsFiltroDisponibilidade] = useState("TODOS");
  const [flCarregando,            setFlCarregando]            = useState(true);
  const [flSalvando,              setFlSalvando]              = useState(false);
  const [dsErro,                  setDsErro]                  = useState("");
  const [dsSucesso,               setDsSucesso]               = useState("");

  const carregarDados = useCallback(async () => {
    setFlCarregando(true);
    setDsErro("");

    try
    {
      const [arrItensApi, arrCategoriasApi] = await Promise.all([
        apiGet<ItemCardapio[]>("itens-cardapio"),
        apiGet<Categoria[]>("categorias"),
      ]);

      setArrItens(
        [...arrItensApi].sort((objItemA, objItemB) =>
          objItemA.nm_item.localeCompare(objItemB.nm_item, "pt-BR")
        )
      );
      setArrCategorias(arrCategoriasApi);
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error
        ? erro.message
        : "Não foi possível carregar o cardápio."
      );
    }
    finally
    {
      setFlCarregando(false);
    }
  }, []);

  useCarregarAoMontar(carregarDados);

  function alterarCampo<NomeCampo extends keyof FormularioItem>(
    nmCampo: NomeCampo,
    valor: FormularioItem[NomeCampo]
  )
  {
    setObjFormulario((objAtual) => ({ ...objAtual, [nmCampo]: valor }));
  }

  function limparFormulario() {
    setObjFormulario(OBJ_FORMULARIO_INICIAL);
    setIdItemEditando(null);
    setDsErro("");
    setDsSucesso("");
  }

  async function salvarItem(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setDsErro("");
    setDsSucesso("");

    const idCategoria = Number(objFormulario.id_categoria);
    const vlPreco     = Number(objFormulario.vl_unitario.replace(",", "."));

    if (!Number.isInteger(idCategoria) || idCategoria < 1)
    {
      setDsErro("Selecione uma categoria válida.");
      return;
    }

    if (!objFormulario.nm_item.trim())
    {
      setDsErro("Informe o nome do item.");
      return;
    }

    if (!Number.isFinite(vlPreco) || vlPreco <= 0)
    {
      setDsErro("Informe um preço maior que zero.");
      return;
    }

    const objDados = {
      id_categoria: idCategoria,
      nm_item: objFormulario.nm_item.trim(),
      ds_item: objFormulario.ds_item.trim() || undefined,
      vl_unitario: Number(vlPreco.toFixed(2)),
      tipo_item: objFormulario.tipo_item,
      disponivel: objFormulario.disponivel
    };

    setFlSalvando(true);

    try
    {
      if (idItemEditando !== null)
      {
        await apiPatch<ItemCardapio>(`itens-cardapio/${idItemEditando}`, objDados);
        setDsSucesso("Item atualizado com sucesso!");
      }
      else
      {
        await apiPost<ItemCardapio>("itens-cardapio", objDados);
        setDsSucesso("Item cadastrado com sucesso!");
      }

      setObjFormulario(OBJ_FORMULARIO_INICIAL);
      setIdItemEditando(null);
      await carregarDados();
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error
        ? erro.message
        : "Não foi possível salvar o item."
      );
    }
    finally
    {
      setFlSalvando(false);
    }
  }

  function editarItem(item: ItemCardapio)
  {
    setIdItemEditando(item.id_item_cardapio);
    setObjFormulario({
      id_categoria: String(item.id_categoria),
      nm_item: item.nm_item,
      ds_item: item.ds_item ?? "",
      vl_unitario: String(item.vl_unitario).replace(".", ","),
      tipo_item: item.tipo_item,
      disponivel: item.disponivel,
    });
    setDsErro("");
    setDsSucesso("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function excluirItem(item: ItemCardapio)
  {
    const flConfirmarExclusao = window.confirm(`Deseja realmente excluir "${item.nm_item}"?`);

    if (!flConfirmarExclusao)
      return;

    setDsErro("");
    setDsSucesso("");

    try
    {
      await apiDelete<void>(`itens-cardapio/${item.id_item_cardapio}`);

      if (idItemEditando === item.id_item_cardapio)
      {
        setObjFormulario(OBJ_FORMULARIO_INICIAL);
        setIdItemEditando(null);
      }

      setDsSucesso(`"${item.nm_item}" foi excluído.`);
      await carregarDados();
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error
        ? erro.message
        : "Não foi possível excluir o item."
      );
    }
  }

  async function alternarDisponibilidade(item: ItemCardapio)
  {
    setDsErro("");
    setDsSucesso("");

    try
    {
      await apiPatch<ItemCardapio>(
        `itens-cardapio/${item.id_item_cardapio}`,
        { disponivel: !item.disponivel }
      );

      setDsSucesso(item.disponivel
        ? "Item marcado como indisponível."
        : "Item marcado como disponível."
      );

      await carregarDados();
    }
    catch (erro)
    {
      setDsErro(erro instanceof Error
        ? erro.message
        : "Não foi possível alterar a disponibilidade."
      );
    }
  }

  const arrItensFiltrados = arrItens.filter((item) => {
    const flCorrespondeBusca = `${item.nm_item} ${item.ds_item ?? ""}`
      .toLowerCase().includes(dsBusca.toLowerCase());

    const flCorrespondeCategoria =
      dsFiltroCategoria === "TODAS" ||
      item.id_categoria === Number(dsFiltroCategoria);

    const flCorrespondeDisponibilidade = dsFiltroDisponibilidade === "TODOS" ||
      (dsFiltroDisponibilidade === "DISPONIVEIS"   && item.disponivel)     ||
      (dsFiltroDisponibilidade === "INDISPONIVEIS" && !item.disponivel);

    return (
      flCorrespondeBusca     &&
      flCorrespondeCategoria &&
      flCorrespondeDisponibilidade
    );
  });

  const nrItensDisponiveis   = arrItens.filter((item) => item.disponivel).length;
  const nrItensIndisponiveis = arrItens.length - nrItensDisponiveis;

  return (
    <div className={estilos.pagina}>
      <header>
        <p className="sobretitulo">Administração</p>
        <h1 className={estilos.titulo}>Cardápio</h1>
        <p className={estilos.descricao}>
          Gerencie os produtos, preços, categorias e disponibilidade.
        </p>
      </header>

      <section className={estilos.estatisticas}>
        {[
          { titulo: "Total de itens", valor: arrItens.length },
          { titulo: "Disponíveis", valor: nrItensDisponiveis },
          { titulo: "Indisponíveis", valor: nrItensIndisponiveis },
        ].map((objIndicador) => (
          <div key={objIndicador.titulo} className={estilos.cartao}>
            <p className={estilos.estatisticaRotulo}>{objIndicador.titulo}</p>
            <p className={estilos.estatisticaValor}>{objIndicador.valor}</p>
          </div>
        ))}
      </section>

      <section className={estilos.cartao}>
        <h2 className={estilos.tituloCartao}>
          {idItemEditando !== null ? "Editar item" : "Cadastrar item"}
        </h2>

        {arrCategorias.length === 0 && !flCarregando && (
          <p className={`${estilos.alerta} ${estilos.alertaAviso} ${estilos.espacoTopo}`}>
            Nenhuma categoria foi encontrada. Cadastre uma categoria antes
            de adicionar itens ao cardápio.
          </p>
        )}

        <form onSubmit={salvarItem} className={estilos.formularioGrade}>
          <div>
            <label htmlFor="nm_item" className={estilos.rotulo}>
              Nome do item *
            </label>
            <input
              id="nm_item"
              required
              maxLength={150}
              value={objFormulario.nm_item}
              onChange={(evento) => alterarCampo("nm_item", evento.target.value)}
              placeholder="Ex.: Hambúrguer da casa"
              className={estilos.entrada}
            />
          </div>

          <div>
            <label htmlFor="id_categoria" className={estilos.rotulo}>
              Categoria *
            </label>
            <select
              id="id_categoria"
              required
              value={objFormulario.id_categoria}
              onChange={(evento) => alterarCampo("id_categoria", evento.target.value)}
              className={estilos.entrada}
            >
              <option value="">Selecione uma categoria</option>
              {arrCategorias.map((categoria) => (
                <option
                  key={categoria.id_categoria}
                  value={categoria.id_categoria}
                >
                  {categoria.nm_categoria}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="vl_unitario" className={estilos.rotulo}>
              Preço (R$) *
            </label>
            <input
              id="vl_unitario"
              type="text"
              inputMode="decimal"
              required
              value={objFormulario.vl_unitario}
              onChange={(evento) =>
                alterarCampo("vl_unitario", evento.target.value)
              }
              placeholder="Ex.: 29,90"
              className={estilos.entrada}
            />
          </div>

          <div>
            <label htmlFor="tipo_item" className={estilos.rotulo}>
              Tipo do item *
            </label>
            <select
              id="tipo_item"
              value={objFormulario.tipo_item}
              onChange={(evento) =>
                alterarCampo(
                  "tipo_item",
                  evento.target.value as FormularioItem["tipo_item"]
                )
              }
              className={estilos.entrada}
            >
              <option value="PREPARADO">Preparado na cozinha</option>
              <option value="REVENDA">Item para revenda</option>
            </select>
          </div>

          <div className={estilos.larguraTotal}>
            <label htmlFor="ds_item" className={estilos.rotulo}>
              Descrição
            </label>
            <textarea
              id="ds_item"
              rows={3}
              value={objFormulario.ds_item}
              onChange={(evento) => alterarCampo("ds_item", evento.target.value)}
              placeholder="Descreva os ingredientes ou detalhes do item..."
              className={`${estilos.entrada} ${estilos.areaTexto}`}
            />
          </div>

          <label className={`${estilos.campoCheckbox} ${estilos.larguraTotal}`}>
            <input
              type="checkbox"
              checked={objFormulario.disponivel}
              onChange={(evento) =>
                alterarCampo("disponivel", evento.target.checked)
              }
            />
            Item disponível para pedidos
          </label>

          <div className={`${estilos.botoes} ${estilos.larguraTotal}`}>
            <button
              type="submit"
              disabled={flSalvando || arrCategorias.length === 0}
              className={`${estilos.botao} ${estilos.botaoPrimario}`}
            >
              {flSalvando
                ? "Salvando..."
                : idItemEditando !== null
                  ? "Salvar alterações"
                  : "Cadastrar item"}
            </button>

            {idItemEditando !== null && (
              <button
                type="button"
                onClick={limparFormulario}
                className={`${estilos.botao} ${estilos.botaoSecundario}`}
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>

        {dsErro && (
          <p role="alert" className={`${estilos.alerta} ${estilos.alertaErro} ${estilos.espacoTopo}`}>
            {dsErro}
          </p>
        )}
        {dsSucesso && !dsErro && (
          <p role="status" className={`${estilos.alerta} ${estilos.alertaSucesso} ${estilos.espacoTopo}`}>
            {dsSucesso}
          </p>
        )}
      </section>

      <section className={estilos.cartaoTabela}>
        <div className={estilos.cabecalhoCartaoColuna}>
          <div className={estilos.linhaCabecalho}>
            <div>
              <h2 className={estilos.tituloCartao}>Itens cadastrados</h2>
              <p className={estilos.subtituloCartao}>
                {arrItensFiltrados.length} item(ns) encontrado(s)
              </p>
            </div>
            <button
              type="button"
              onClick={() => void carregarDados()}
              disabled={flCarregando}
              className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
            >
              {flCarregando ? "Atualizando..." : "Atualizar"}
            </button>
          </div>

          <div className={estilos.filtros}>
            <input
              value={dsBusca}
              onChange={(evento) => setDsBusca(evento.target.value)}
              placeholder="Buscar por nome ou descrição..."
              className={estilos.entrada}
            />

            <select
              value={dsFiltroCategoria}
              onChange={(evento) => setDsFiltroCategoria(evento.target.value)}
              className={estilos.entrada}
            >
              <option value="TODAS">Todas as categorias</option>
              {arrCategorias.map((categoria) => (
                <option
                  key={categoria.id_categoria}
                  value={categoria.id_categoria}
                >
                  {categoria.nm_categoria}
                </option>
              ))}
            </select>

            <select
              value={dsFiltroDisponibilidade}
              onChange={(evento) => setDsFiltroDisponibilidade(evento.target.value)}
              className={estilos.entrada}
            >
              <option value="TODOS">Todas as disponibilidades</option>
              <option value="DISPONIVEIS">Disponíveis</option>
              <option value="INDISPONIVEIS">Indisponíveis</option>
            </select>
          </div>
        </div>

        {flCarregando ? (
          <p className={estilos.carregando}>Carregando cardápio...</p>
        ) : arrItensFiltrados.length === 0 ? (
          <div className={estilos.vazio}>
            <p className={estilos.vazioTitulo}>Nenhum item encontrado</p>
            <p className={estilos.vazioTexto}>
              Tente mudar os filtros ou cadastre um novo item.
            </p>
          </div>
        ) : (
          <div className={estilos.tabelaRolagem}>
            <table className={`${estilos.tabela} ${estilos.tabelaLarga}`}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Preço</th>
                  <th>Disponibilidade</th>
                  <th className={estilos.alinharDireita}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {arrItensFiltrados.map((item) => (
                  <tr key={item.id_item_cardapio} className={estilos.linhaTopo}>
                    <td>
                      <span className={estilos.negrito}>{item.nm_item}</span>
                      {item.ds_item && (
                        <p className={estilos.textoPequeno}>{item.ds_item}</p>
                      )}
                    </td>
                    <td>
                      {item.categoria?.nm_categoria ??
                        arrCategorias.find(
                          (categoria) =>
                            categoria.id_categoria === item.id_categoria
                        )?.nm_categoria ??
                        "—"}
                    </td>
                    <td>
                      {item.tipo_item === "PREPARADO"
                        ? "Preparado"
                        : "Revenda"}
                    </td>
                    <td className={`${estilos.negrito} ${estilos.semQuebra}`}>
                      {formatarMoeda(item.vl_unitario)}
                    </td>
                    <td>
                      <span
                        className={`${estilos.seloEstado} ${
                          item.disponivel ? estilos.seloSucesso : estilos.seloNeutro
                        }`}
                      >
                        {item.disponivel ? "Disponível" : "Indisponível"}
                      </span>
                    </td>
                    <td>
                      <div className={estilos.acoesLinha}>
                        <button
                          type="button"
                          onClick={() => editarItem(item)}
                          className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void alternarDisponibilidade(item)}
                          className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
                        >
                          {item.disponivel ? "Indisponibilizar" : "Disponibilizar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void excluirItem(item)}
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
