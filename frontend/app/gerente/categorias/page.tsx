
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

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

export default function CategoriasPage() {
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

    try {
      const dados = await apiGet<Categoria[]>("/categorias");
      setCategorias(dados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as categorias."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarCategorias();
  }, [carregarCategorias]);

  function limparFormulario() {
    setFormulario(formularioInicial);
    setIdEditando(null);
    setErro("");
    setSucesso("");
  }

  function iniciarEdicao(categoria: Categoria) {
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

  async function salvarCategoria(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");

    const nome = formulario.nm_categoria.trim();

    if (!nome) {
      setErro("Informe o nome da categoria.");
      return;
    }

    const idPai = formulario.id_categoria_pai
      ? Number(formulario.id_categoria_pai)
      : null;

    if (idEditando !== null && idPai === idEditando) {
      setErro("Uma categoria não pode ser pai dela mesma.");
      return;
    }

    const dados = {
      nm_categoria: nome,
      id_categoria_pai: idPai,
    };

    setSalvando(true);

    try {
      if (idEditando !== null) {
        await apiPatch(`/categorias/${idEditando}`, dados);
        setSucesso("Categoria atualizada com sucesso!");
      } else {
        await apiPost("/categorias", dados);
        setSucesso("Categoria cadastrada com sucesso!");
      }

      setFormulario(formularioInicial);
      setIdEditando(null);
      await carregarCategorias();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a categoria."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirCategoria(categoria: Categoria) {
    const possuiFilhas = categorias.some(
      (item) => item.id_categoria_pai === categoria.id_categoria
    );

    const mensagem = possuiFilhas
      ? `A categoria "${categoria.nm_categoria}" possui subcategorias. Remova ou reorganize as subcategorias antes de excluí-la. Deseja tentar excluir mesmo assim?`
      : `Deseja realmente excluir a categoria "${categoria.nm_categoria}"?`;

    if (!window.confirm(mensagem)) return;

    setErro("");
    setSucesso("");

    try {
      await apiDelete(`/categorias/${categoria.id_categoria}`);

      if (idEditando === categoria.id_categoria) {
        limparFormulario();
      }

      setSucesso("Categoria excluída com sucesso!");
      await carregarCategorias();
    } catch (error) {
      setErro(
        error instanceof Error
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
    if (categoria.id_categoria_pai == null) return "Categoria principal";

    return (
      categorias.find(
        (item) => item.id_categoria === categoria.id_categoria_pai
      )?.nm_categoria ?? "Categoria não encontrada"
    );
  };

  const subcategorias = categorias.filter(
    (categoria) => categoria.id_categoria_pai != null
  ).length;

  return (
    <main className="min-h-screen bg-[#f8f4ef] p-4 text-[#39272a] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b2635]">
            Gerenciamento
          </p>
          <h1 className="mt-2 text-3xl font-bold">Categorias</h1>
          <p className="mt-2 text-sm text-[#796b68]">
            Organize as categorias e subcategorias do cardápio.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#eadfd8] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#796b68]">Total de categorias</p>
            <p className="mt-2 text-3xl font-bold text-[#8b2635]">
              {categorias.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eadfd8] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#796b68]">Categorias principais</p>
            <p className="mt-2 text-3xl font-bold text-[#8b2635]">
              {categorias.length - subcategorias}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eadfd8] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#796b68]">Subcategorias</p>
            <p className="mt-2 text-3xl font-bold text-[#8b2635]">
              {subcategorias}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-[#eadfd8] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              {idEditando !== null ? "Editar categoria" : "Nova categoria"}
            </h2>
            <p className="mt-1 text-sm text-[#796b68]">
              A categoria pai é opcional. Deixe sem seleção para criar uma
              categoria principal.
            </p>
          </div>

          <form onSubmit={salvarCategoria} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="nm_categoria"
                  className="mb-2 block text-sm font-semibold"
                >
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
                  className="w-full rounded-xl border border-[#dfd1ca] bg-white px-4 py-3 outline-none transition focus:border-[#8b2635] focus:ring-2 focus:ring-[#8b2635]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="categoria_pai"
                  className="mb-2 block text-sm font-semibold"
                >
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
                  className="w-full rounded-xl border border-[#dfd1ca] bg-white px-4 py-3 outline-none transition focus:border-[#8b2635] focus:ring-2 focus:ring-[#8b2635]/10"
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
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {erro}
              </div>
            )}

            {sucesso && (
              <div
                role="status"
                className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              >
                {sucesso}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={salvando}
                className="rounded-xl bg-[#8b2635] px-5 py-3 font-semibold text-white transition hover:bg-[#701d2a] disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="rounded-xl border border-[#dfd1ca] px-5 py-3 font-semibold transition hover:bg-[#f8f4ef]"
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#eadfd8] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#eadfd8] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Categorias cadastradas</h2>
              <p className="mt-1 text-sm text-[#796b68]">
                Consulte e gerencie as categorias existentes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void carregarCategorias()}
              disabled={carregando}
              className="rounded-xl border border-[#dfd1ca] px-4 py-2.5 text-sm font-semibold transition hover:bg-[#f8f4ef] disabled:opacity-60"
            >
              Atualizar lista
            </button>
          </div>

          <div className="p-5">
            <label htmlFor="busca" className="sr-only">
              Buscar categoria
            </label>
            <input
              id="busca"
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por nome ou categoria pai..."
              className="mb-5 w-full rounded-xl border border-[#dfd1ca] px-4 py-3 outline-none focus:border-[#8b2635] sm:max-w-md"
            />

            {carregando ? (
              <p className="py-10 text-center text-[#796b68]">
                Carregando categorias...
              </p>
            ) : categoriasFiltradas.length === 0 ? (
              <div className="rounded-xl bg-[#f8f4ef] px-4 py-10 text-center">
                <p className="font-semibold">
                  {categorias.length === 0
                    ? "Nenhuma categoria cadastrada."
                    : "Nenhuma categoria encontrada."}
                </p>
                <p className="mt-2 text-sm text-[#796b68]">
                  {categorias.length === 0
                    ? "Use o formulário acima para cadastrar a primeira categoria."
                    : "Tente pesquisar usando outro nome."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#eadfd8] text-[#796b68]">
                      <th className="px-4 py-3 font-semibold">ID</th>
                      <th className="px-4 py-3 font-semibold">Categoria</th>
                      <th className="px-4 py-3 font-semibold">Categoria pai</th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoriasFiltradas.map((categoria) => (
                      <tr
                        key={categoria.id_categoria}
                        className="border-b border-[#f0e8e2] last:border-0 hover:bg-[#fcfaf8]"
                      >
                        <td className="px-4 py-4 text-[#796b68]">
                          {categoria.id_categoria}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold">
                            {categoria.nm_categoria}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={
                              categoria.id_categoria_pai == null
                                ? "rounded-full bg-[#f3e6e7] px-3 py-1 text-xs font-semibold text-[#8b2635]"
                                : "text-[#796b68]"
                            }
                          >
                            {nomePai(categoria)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => iniciarEdicao(categoria)}
                              className="rounded-lg border border-[#dfd1ca] px-3 py-2 font-semibold transition hover:bg-[#f8f4ef]"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => void excluirCategoria(categoria)}
                              className="rounded-lg border border-red-200 px-3 py-2 font-semibold text-red-700 transition hover:bg-red-50"
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
    </main>
  );
}
