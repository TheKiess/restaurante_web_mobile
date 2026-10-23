
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiDelete, apiGet, apiPatch, apiPost }             from "@/lib/api";
import estilos                                              from "@/componentes/Painel/Painel.module.css";

type Categoria = {
  id_categoria: number;
  nm_categoria: string;
  id_categoria_pai: number | null;
};

type FormularioCategoria = {
  nm_categoria: string;
  id_categoria_pai: string;
};

const formularioInicial: FormularioCategoria = {
  nm_categoria: "",
  id_categoria_pai: "",
};

export default function CategoriasPage()
{
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formulario, setFormulario] =
    useState<FormularioCategoria>(formularioInicial);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarCategorias = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try
    {
      const dados = await apiGet<Categoria[]>("/categorias");
      setCategorias(dados);
    }
    catch (error)
    {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as categorias."
      );
    }
    finally
    {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarCategorias();
  }, [carregarCategorias]);

  function limparFormulario()
  {
    setFormulario(formularioInicial);
    setIdEditando(null);
    setErro("");
    setSucesso("");
  }

  function iniciarEdicao(categoria: Categoria)
  {
    setIdEditando(categoria.id_categoria);
    setFormulario({
      nm_categoria: categoria.nm_categoria,
      id_categoria_pai:
        categoria.id_categoria_pai == null
          ? ""
          : String(categoria.id_categoria_pai),
    });

    setErro("");
    setSucesso("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvarCategoria(event: FormEvent<HTMLFormElement>)
  {
    event.preventDefault();
    setErro("");
    setSucesso("");

    const nome = formulario.nm_categoria.trim();

    if (!nome)
    {
      setErro("Informe o nome da categoria.");
      return;
    }

    const idPai = formulario.id_categoria_pai
      ? Number(formulario.id_categoria_pai)
      : null;

    if (idEditando !== null && idPai === idEditando)
    {
      setErro("Uma categoria não pode ser pai dela mesma.");
      return;
    }

    const dados = {
      nm_categoria: nome,
      id_categoria_pai: idPai,
    };

    setSalvando(true);

    try
    {
      if (idEditando !== null)
      {
        await apiPatch(`/categorias/${idEditando}`, dados);
        setSucesso("Categoria atualizada com sucesso!");
      }
      else
      {
        await apiPost("/categorias", dados);
        setSucesso("Categoria cadastrada com sucesso!");
      }

      setFormulario(formularioInicial);
      setIdEditando(null);
      await carregarCategorias();
    }
    catch (error)
    {
      setErro(error instanceof Error
        ? error.message
        : "Não foi possível salvar a categoria."
      );
    }
    finally
    {
      setSalvando(false);
    }
  }

  async function excluirCategoria(categoria: Categoria)
  {
    const possuiFilhas = categorias.some((item) => item.id_categoria_pai === categoria.id_categoria);

    const mensagem = possuiFilhas
      ? `A categoria "${categoria.nm_categoria}" possui subcategorias. Remova ou reorganize as subcategorias antes de excluí-la. Deseja tentar excluir mesmo assim?`
      : `Deseja realmente excluir a categoria "${categoria.nm_categoria}"?`;

    if (!window.confirm(mensagem))
      return;

    setErro("");
    setSucesso("");

    try
    {
      await apiDelete(`/categorias/${categoria.id_categoria}`);

      if (idEditando === categoria.id_categoria)
        limparFormulario();

      setSucesso("Categoria excluída com sucesso!");
      await carregarCategorias();
    }
    catch (error)
    {
      setErro(error instanceof Error
        ? error.message
        : "Não foi possível excluir a categoria. Verifique se ela possui subcategorias ou itens do cardápio vinculados."
      );
    }
  }

  const categoriasFiltradas = categorias.filter((categoria) => {
    const nomePai = categorias.find(
      (item) => item.id_categoria === categoria.id_categoria_pai
    )?.nm_categoria;

    const texto = `${categoria.nm_categoria} ${nomePai ?? ""}`.toLowerCase();

    return texto.includes(busca.trim().toLowerCase());
  });

  const nomePai = (categoria: Categoria) => {
    if (categoria.id_categoria_pai == null)
      return "Categoria principal";

    return (categorias.find(
        (item) => item.id_categoria === categoria.id_categoria_pai
      )?.nm_categoria ?? "Categoria não encontrada"
    );
  };

  const subcategorias = categorias.filter(
    (categoria) => categoria.id_categoria_pai != null
  ).length;

  return (
    <div className={estilos.pagina}>
      <header>
        <p className="sobretitulo">Gerenciamento</p>
        <h1 className={estilos.titulo}>Categorias</h1>
        <p className={estilos.descricao}>
          Organize as categorias e subcategorias do cardápio.
        </p>
      </header>

      <section className={estilos.estatisticas}>
        <div className={estilos.cartao}>
          <p className={estilos.estatisticaRotulo}>Total de categorias</p>
          <p className={estilos.estatisticaValor}>{categorias.length}</p>
        </div>

        <div className={estilos.cartao}>
          <p className={estilos.estatisticaRotulo}>Categorias principais</p>
          <p className={estilos.estatisticaValor}>
            {categorias.length - subcategorias}
          </p>
        </div>

        <div className={estilos.cartao}>
          <p className={estilos.estatisticaRotulo}>Subcategorias</p>
          <p className={estilos.estatisticaValor}>{subcategorias}</p>
        </div>
      </section>

      <section className={estilos.cartao}>
        <h2 className={estilos.tituloCartao}>
          {idEditando !== null ? "Editar categoria" : "Nova categoria"}
        </h2>
        <p className={estilos.subtituloCartao}>
          A categoria pai é opcional. Deixe sem seleção para criar uma
          categoria principal.
        </p>

        <form onSubmit={salvarCategoria} className={estilos.formulario}>
          <div className={estilos.camposLinha}>
            <div>
              <label htmlFor="nm_categoria" className={estilos.rotulo}>
                Nome da categoria *
              </label>
              <input
                id="nm_categoria"
                type="text"
                value={formulario.nm_categoria}
                onChange={(event) =>
                  setFormulario({
                    ...formulario,
                    nm_categoria: event.target.value,
                  })
                }
                placeholder="Ex.: Bebidas, Lanches, Sobremesas"
                maxLength={100}
                required
                className={estilos.entrada}
              />
            </div>

            <div>
              <label htmlFor="categoria_pai" className={estilos.rotulo}>
                Categoria pai
              </label>
              <select
                id="categoria_pai"
                value={formulario.id_categoria_pai}
                onChange={(event) =>
                  setFormulario({
                    ...formulario,
                    id_categoria_pai: event.target.value,
                  })
                }
                className={estilos.entrada}
              >
                <option value="">Nenhuma — categoria principal</option>
                {categorias
                  .filter((categoria) => {
                    if (categoria.id_categoria === idEditando) return false;

                    // Evita escolher um descendente como pai.
                    let atual: Categoria | undefined = categoria;

                    while (atual?.id_categoria_pai != null) {
                      if (atual.id_categoria_pai === idEditando) {
                        return false;
                      }

                      atual = categorias.find(
                        (item) =>
                          item.id_categoria === atual?.id_categoria_pai
                      );
                    }

                    return true;
                  })
                  .map((categoria) => (
                    <option
                      key={categoria.id_categoria}
                      value={categoria.id_categoria}
                    >
                      {categoria.nm_categoria}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {erro && (
            <div role="alert" className={`${estilos.alerta} ${estilos.alertaErro}`}>
              {erro}
            </div>
          )}

          {sucesso && (
            <div role="status" className={`${estilos.alerta} ${estilos.alertaSucesso}`}>
              {sucesso}
            </div>
          )}

          <div className={estilos.botoes}>
            <button
              type="submit"
              disabled={salvando}
              className={`${estilos.botao} ${estilos.botaoPrimario}`}
            >
              {salvando
                ? "Salvando..."
                : idEditando !== null
                  ? "Salvar alterações"
                  : "Cadastrar categoria"}
            </button>

            {idEditando !== null && (
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
      </section>

      <section className={estilos.cartaoTabela}>
        <div className={estilos.cabecalhoCartao}>
          <div>
            <h2 className={estilos.tituloCartao}>Categorias cadastradas</h2>
            <p className={estilos.subtituloCartao}>
              Consulte e gerencie as categorias existentes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void carregarCategorias()}
            disabled={carregando}
            className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
          >
            Atualizar lista
          </button>
        </div>

        <div className={estilos.corpoCartao}>
          <label htmlFor="busca" className={estilos.somenteLeitor}>
            Buscar categoria
          </label>
          <input
            id="busca"
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por nome ou categoria pai..."
            className={`${estilos.entrada} ${estilos.busca}`}
          />

          {carregando ? (
            <p className={estilos.carregando}>Carregando categorias...</p>
          ) : categoriasFiltradas.length === 0 ? (
            <div className={estilos.vazio}>
              <p className={estilos.vazioTitulo}>
                {categorias.length === 0
                  ? "Nenhuma categoria cadastrada."
                  : "Nenhuma categoria encontrada."}
              </p>
              <p className={estilos.vazioTexto}>
                {categorias.length === 0
                  ? "Use o formulário acima para cadastrar a primeira categoria."
                  : "Tente pesquisar usando outro nome."}
              </p>
            </div>
          ) : (
            <div className={estilos.tabelaRolagem}>
              <table className={estilos.tabela}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Categoria</th>
                    <th>Categoria pai</th>
                    <th className={estilos.alinharDireita}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasFiltradas.map((categoria) => (
                    <tr key={categoria.id_categoria}>
                      <td className={estilos.textoSuave}>
                        {categoria.id_categoria}
                      </td>
                      <td>
                        <strong>{categoria.nm_categoria}</strong>
                      </td>
                      <td>
                        <span
                          className={
                            categoria.id_categoria_pai == null
                              ? estilos.seloSuave
                              : estilos.textoSuave
                          }
                        >
                          {nomePai(categoria)}
                        </span>
                      </td>
                      <td>
                        <div className={estilos.acoesLinha}>
                          <button
                            type="button"
                            onClick={() => iniciarEdicao(categoria)}
                            className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => void excluirCategoria(categoria)}
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
        </div>
      </section>
    </div>
  );
}
