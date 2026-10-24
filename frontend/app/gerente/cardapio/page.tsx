
"use client";

import { useCallback, useEffect, useState }     from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import estilos                                  from "@/componentes/Painel/Painel.module.css";

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

type Formulario = {
  id_categoria: string;
  nm_item: string;
  ds_item: string;
  vl_unitario: string;
  tipo_item: "PREPARADO" | "REVENDA";
  disponivel: boolean;
};

const formularioInicial: Formulario = {
  id_categoria: "",
  nm_item: "",
  ds_item: "",
  vl_unitario: "",
  tipo_item: "PREPARADO",
  disponivel: true,
};

function formatarPreco(valor: number | string) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function CardapioPage() {
  const [itens, setItens] = useState<ItemCardapio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formulario, setFormulario] =
    useState<Formulario>(formularioInicial);
  const [itemEditando, setItemEditando] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("TODAS");
  const [filtroDisponibilidade, setFiltroDisponibilidade] =
    useState("TODOS");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const [dadosItens, dadosCategorias] = await Promise.all([
        apiGet<ItemCardapio[]>("itens-cardapio"),
        apiGet<Categoria[]>("categorias"),
      ]);

      setItens(
        [...dadosItens].sort((a, b) =>
          a.nm_item.localeCompare(b.nm_item, "pt-BR")
        )
      );
      setCategorias(dadosCategorias);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o cardápio."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  function alterarCampo<K extends keyof Formulario>(
    campo: K,
    valor: Formulario[K]
  ) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  function limparFormulario() {
    setFormulario(formularioInicial);
    setItemEditando(null);
    setErro("");
    setSucesso("");
  }

  async function salvarItem(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setSucesso("");

    const idCategoria = Number(formulario.id_categoria);
    const preco = Number(formulario.vl_unitario.replace(",", "."));

    if (!Number.isInteger(idCategoria) || idCategoria < 1) {
      setErro("Selecione uma categoria válida.");
      return;
    }

    if (!formulario.nm_item.trim()) {
      setErro("Informe o nome do item.");
      return;
    }

    if (!Number.isFinite(preco) || preco <= 0) {
      setErro("Informe um preço maior que zero.");
      return;
    }

    const dados = {
      id_categoria: idCategoria,
      nm_item: formulario.nm_item.trim(),
      ds_item: formulario.ds_item.trim() || undefined,
      vl_unitario: Number(preco.toFixed(2)),
      tipo_item: formulario.tipo_item,
      disponivel: formulario.disponivel,
    };

    setSalvando(true);

    try {
      if (itemEditando !== null) {
        await apiPatch<ItemCardapio>(
          `itens-cardapio/${itemEditando}`,
          dados
        );
        setSucesso("Item atualizado com sucesso!");
      } else {
        await apiPost<ItemCardapio>("itens-cardapio", dados);
        setSucesso("Item cadastrado com sucesso!");
      }

      setFormulario(formularioInicial);
      setItemEditando(null);
      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o item."
      );
    } finally {
      setSalvando(false);
    }
  }

  function editarItem(item: ItemCardapio) {
    setItemEditando(item.id_item_cardapio);
    setFormulario({
      id_categoria: String(item.id_categoria),
      nm_item: item.nm_item,
      ds_item: item.ds_item ?? "",
      vl_unitario: String(item.vl_unitario).replace(".", ","),
      tipo_item: item.tipo_item,
      disponivel: item.disponivel,
    });
    setErro("");
    setSucesso("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function excluirItem(item: ItemCardapio) {
    const confirmar = window.confirm(
      `Deseja realmente excluir "${item.nm_item}"?`
    );

    if (!confirmar) return;

    setErro("");
    setSucesso("");

    try {
      await apiDelete<void>(
        `itens-cardapio/${item.id_item_cardapio}`
      );

      if (itemEditando === item.id_item_cardapio) {
        setFormulario(formularioInicial);
        setItemEditando(null);
      }

      setSucesso(`"${item.nm_item}" foi excluído.`);
      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o item."
      );
    }
  }

  async function alternarDisponibilidade(item: ItemCardapio) {
    setErro("");
    setSucesso("");

    try {
      await apiPatch<ItemCardapio>(
        `itens-cardapio/${item.id_item_cardapio}`,
        { disponivel: !item.disponivel }
      );

      setSucesso(
        item.disponivel
          ? "Item marcado como indisponível."
          : "Item marcado como disponível."
      );

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a disponibilidade."
      );
    }
  }

  const itensFiltrados = itens.filter((item) => {
    const texto = `${item.nm_item} ${item.ds_item ?? ""}`.toLowerCase();
    const correspondeBusca = texto.includes(busca.toLowerCase());

    const correspondeCategoria =
      filtroCategoria === "TODAS" ||
      item.id_categoria === Number(filtroCategoria);

    const correspondeDisponibilidade =
      filtroDisponibilidade === "TODOS" ||
      (filtroDisponibilidade === "DISPONIVEIS" && item.disponivel) ||
      (filtroDisponibilidade === "INDISPONIVEIS" && !item.disponivel);

    return (
      correspondeBusca &&
      correspondeCategoria &&
      correspondeDisponibilidade
    );
  });

  const disponiveis = itens.filter((item) => item.disponivel).length;
  const indisponiveis = itens.length - disponiveis;

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
          { titulo: "Total de itens", valor: itens.length },
          { titulo: "Disponíveis", valor: disponiveis },
          { titulo: "Indisponíveis", valor: indisponiveis },
        ].map((indicador) => (
          <div key={indicador.titulo} className={estilos.cartao}>
            <p className={estilos.estatisticaRotulo}>{indicador.titulo}</p>
            <p className={estilos.estatisticaValor}>{indicador.valor}</p>
          </div>
        ))}
      </section>

      <section className={estilos.cartao}>
        <h2 className={estilos.tituloCartao}>
          {itemEditando !== null ? "Editar item" : "Cadastrar item"}
        </h2>

        {categorias.length === 0 && !carregando && (
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
              value={formulario.nm_item}
              onChange={(e) => alterarCampo("nm_item", e.target.value)}
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
              value={formulario.id_categoria}
              onChange={(e) => alterarCampo("id_categoria", e.target.value)}
              className={estilos.entrada}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((categoria) => (
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
              value={formulario.vl_unitario}
              onChange={(e) =>
                alterarCampo("vl_unitario", e.target.value)
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
              value={formulario.tipo_item}
              onChange={(e) =>
                alterarCampo(
                  "tipo_item",
                  e.target.value as Formulario["tipo_item"]
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
              value={formulario.ds_item}
              onChange={(e) => alterarCampo("ds_item", e.target.value)}
              placeholder="Descreva os ingredientes ou detalhes do item..."
              className={`${estilos.entrada} ${estilos.areaTexto}`}
            />
          </div>

          <label className={`${estilos.campoCheckbox} ${estilos.larguraTotal}`}>
            <input
              type="checkbox"
              checked={formulario.disponivel}
              onChange={(e) =>
                alterarCampo("disponivel", e.target.checked)
              }
            />
            Item disponível para pedidos
          </label>

          <div className={`${estilos.botoes} ${estilos.larguraTotal}`}>
            <button
              type="submit"
              disabled={salvando || categorias.length === 0}
              className={`${estilos.botao} ${estilos.botaoPrimario}`}
            >
              {salvando
                ? "Salvando..."
                : itemEditando !== null
                  ? "Salvar alterações"
                  : "Cadastrar item"}
            </button>

            {itemEditando !== null && (
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

        {erro && (
          <p role="alert" className={`${estilos.alerta} ${estilos.alertaErro} ${estilos.espacoTopo}`}>
            {erro}
          </p>
        )}
        {sucesso && !erro && (
          <p role="status" className={`${estilos.alerta} ${estilos.alertaSucesso} ${estilos.espacoTopo}`}>
            {sucesso}
          </p>
        )}
      </section>

      <section className={estilos.cartaoTabela}>
        <div className={estilos.cabecalhoCartaoColuna}>
          <div className={estilos.linhaCabecalho}>
            <div>
              <h2 className={estilos.tituloCartao}>Itens cadastrados</h2>
              <p className={estilos.subtituloCartao}>
                {itensFiltrados.length} item(ns) encontrado(s)
              </p>
            </div>
            <button
              type="button"
              onClick={() => void carregarDados()}
              disabled={carregando}
              className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
            >
              {carregando ? "Atualizando..." : "Atualizar"}
            </button>
          </div>

          <div className={estilos.filtros}>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou descrição..."
              className={estilos.entrada}
            />

            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className={estilos.entrada}
            >
              <option value="TODAS">Todas as categorias</option>
              {categorias.map((categoria) => (
                <option
                  key={categoria.id_categoria}
                  value={categoria.id_categoria}
                >
                  {categoria.nm_categoria}
                </option>
              ))}
            </select>

            <select
              value={filtroDisponibilidade}
              onChange={(e) => setFiltroDisponibilidade(e.target.value)}
              className={estilos.entrada}
            >
              <option value="TODOS">Todas as disponibilidades</option>
              <option value="DISPONIVEIS">Disponíveis</option>
              <option value="INDISPONIVEIS">Indisponíveis</option>
            </select>
          </div>
        </div>

        {carregando ? (
          <p className={estilos.carregando}>Carregando cardápio...</p>
        ) : itensFiltrados.length === 0 ? (
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
                {itensFiltrados.map((item) => (
                  <tr key={item.id_item_cardapio} className={estilos.linhaTopo}>
                    <td>
                      <span className={estilos.negrito}>{item.nm_item}</span>
                      {item.ds_item && (
                        <p className={estilos.textoPequeno}>{item.ds_item}</p>
                      )}
                    </td>
                    <td>
                      {item.categoria?.nm_categoria ??
                        categorias.find(
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
                      {formatarPreco(item.vl_unitario)}
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
