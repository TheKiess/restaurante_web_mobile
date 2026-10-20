
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

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
    <div className="mx-auto max-w-7xl space-y-8 text-[#352A2C]">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#87364D]">
          Administração
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Cardápio
        </h1>
        <p className="mt-2 text-sm text-[#786C6C]">
          Gerencie os produtos, preços, categorias e disponibilidade.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { titulo: "Total de itens", valor: itens.length },
          { titulo: "Disponíveis", valor: disponiveis },
          { titulo: "Indisponíveis", valor: indisponiveis },
        ].map((indicador) => (
          <div
            key={indicador.titulo}
            className="rounded-2xl border border-[#E9DED6] bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-[#786C6C]">{indicador.titulo}</p>
            <p className="mt-2 text-3xl font-bold text-[#6F2438]">
              {indicador.valor}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-[#E9DED6] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">
          {itemEditando !== null ? "Editar item" : "Cadastrar item"}
        </h2>

        {categorias.length === 0 && !carregando && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Nenhuma categoria foi encontrada. Cadastre uma categoria antes
            de adicionar itens ao cardápio.
          </p>
        )}

        <form onSubmit={salvarItem} className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="nm_item" className="mb-2 block text-sm font-medium">
              Nome do item *
            </label>
            <input
              id="nm_item"
              required
              maxLength={150}
              value={formulario.nm_item}
              onChange={(e) => alterarCampo("nm_item", e.target.value)}
              placeholder="Ex.: Hambúrguer da casa"
              className="w-full rounded-xl border border-[#E2D5CD] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#87364D] focus:ring-2 focus:ring-[#87364D]/15"
            />
          </div>

          <div>
            <label
              htmlFor="id_categoria"
              className="mb-2 block text-sm font-medium"
            >
              Categoria *
            </label>
            <select
              id="id_categoria"
              required
              value={formulario.id_categoria}
              onChange={(e) => alterarCampo("id_categoria", e.target.value)}
              className="w-full rounded-xl border border-[#E2D5CD] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#87364D]"
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
            <label
              htmlFor="vl_unitario"
              className="mb-2 block text-sm font-medium"
            >
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
              className="w-full rounded-xl border border-[#E2D5CD] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#87364D]"
            />
          </div>

          <div>
            <label
              htmlFor="tipo_item"
              className="mb-2 block text-sm font-medium"
            >
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
              className="w-full rounded-xl border border-[#E2D5CD] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#87364D]"
            >
              <option value="PREPARADO">Preparado na cozinha</option>
              <option value="REVENDA">Item para revenda</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="ds_item"
              className="mb-2 block text-sm font-medium"
            >
              Descrição
            </label>
            <textarea
              id="ds_item"
              rows={3}
              value={formulario.ds_item}
              onChange={(e) => alterarCampo("ds_item", e.target.value)}
              placeholder="Descreva os ingredientes ou detalhes do item..."
              className="w-full rounded-xl border border-[#E2D5CD] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#87364D]"
            />
          </div>

          <label className="flex items-center gap-3 text-sm font-medium md:col-span-2">
            <input
              type="checkbox"
              checked={formulario.disponivel}
              onChange={(e) =>
                alterarCampo("disponivel", e.target.checked)
              }
              className="h-4 w-4 accent-[#6F2438]"
            />
            Item disponível para pedidos
          </label>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={salvando || categorias.length === 0}
              className="rounded-xl bg-[#6F2438] px-5 py-3 font-semibold text-white transition hover:bg-[#87364D] disabled:cursor-not-allowed disabled:opacity-60"
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
                className="rounded-xl border border-[#E2D5CD] px-5 py-3 font-medium hover:bg-[#FAF7F2]"
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>

        {erro && (
          <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </p>
        )}
        {sucesso && !erro && (
          <p role="status" className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {sucesso}
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E9DED6] bg-white shadow-sm">
        <div className="space-y-4 border-b border-[#EEE5DF] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Itens cadastrados</h2>
              <p className="mt-1 text-sm text-[#786C6C]">
                {itensFiltrados.length} item(ns) encontrado(s)
              </p>
            </div>
            <button
              type="button"
              onClick={() => void carregarDados()}
              disabled={carregando}
              className="rounded-xl border border-[#E2D5CD] px-4 py-2 text-sm font-semibold hover:bg-[#FAF7F2] disabled:opacity-60"
            >
              {carregando ? "Atualizando..." : "Atualizar"}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou descrição..."
              className="rounded-xl border border-[#E2D5CD] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#87364D]"
            />

            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="rounded-xl border border-[#E2D5CD] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#87364D]"
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
              className="rounded-xl border border-[#E2D5CD] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#87364D]"
            >
              <option value="TODOS">Todas as disponibilidades</option>
              <option value="DISPONIVEIS">Disponíveis</option>
              <option value="INDISPONIVEIS">Indisponíveis</option>
            </select>
          </div>
        </div>

        {carregando ? (
          <p className="p-8 text-center text-[#786C6C]">
            Carregando cardápio...
          </p>
        ) : itensFiltrados.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-lg font-semibold">Nenhum item encontrado</p>
            <p className="mt-2 text-sm text-[#786C6C]">
              Tente mudar os filtros ou cadastre um novo item.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF7F2] text-[#6A5558]">
                <tr>
                  <th className="px-5 py-4 font-semibold">Item</th>
                  <th className="px-5 py-4 font-semibold">Categoria</th>
                  <th className="px-5 py-4 font-semibold">Tipo</th>
                  <th className="px-5 py-4 font-semibold">Preço</th>
                  <th className="px-5 py-4 font-semibold">Disponibilidade</th>
                  <th className="px-5 py-4 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE5DF]">
                {itensFiltrados.map((item) => (
                  <tr
                    key={item.id_item_cardapio}
                    className="align-top transition hover:bg-[#FFFCF9]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold">{item.nm_item}</p>
                      {item.ds_item && (
                        <p className="mt-1 max-w-xs text-xs text-[#786C6C]">
                          {item.ds_item}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {item.categoria?.nm_categoria ??
                        categorias.find(
                          (categoria) =>
                            categoria.id_categoria === item.id_categoria
                        )?.nm_categoria ??
                        "—"}
                    </td>
                    <td className="px-5 py-4">
                      {item.tipo_item === "PREPARADO"
                        ? "Preparado"
                        : "Revenda"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold">
                      {formatarPreco(item.vl_unitario)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          item.disponivel
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.disponivel ? "Disponível" : "Indisponível"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex min-w-40 flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => editarItem(item)}
                          className="rounded-lg border border-[#E2D5CD] px-3 py-2 font-medium hover:bg-[#FAF7F2]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void alternarDisponibilidade(item)}
                          className="rounded-lg border border-[#E2D5CD] px-3 py-2 font-medium hover:bg-[#FAF7F2]"
                        >
                          {item.disponivel ? "Indisponibilizar" : "Disponibilizar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void excluirItem(item)}
                          className="rounded-lg border border-red-200 px-3 py-2 font-medium text-red-700 hover:bg-red-50"
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
