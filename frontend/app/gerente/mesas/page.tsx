
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

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

export default function MesasPage() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [formulario, setFormulario] =
    useState<FormularioMesa>(formularioInicial);
  const [mesaEditando, setMesaEditando] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarMesas = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const dados = await apiGet<Mesa[]>("mesas");

      setMesas(
        [...dados].sort((a, b) => a.nr_mesa - b.nr_mesa)
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as mesas."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarMesas();
  }, [carregarMesas]);

  function alterarCampo(
    campo: keyof FormularioMesa,
    valor: string
  ) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function limparFormulario() {
    setFormulario(formularioInicial);
    setMesaEditando(null);
    setErro("");
    setSucesso("");
  }

  async function salvarMesa(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    setSucesso("");

    const nrMesa = Number(formulario.nr_mesa);
    const qtLugares = Number(formulario.qt_lugares);

    if (
      !Number.isInteger(nrMesa) ||
      nrMesa < 1 ||
      !Number.isInteger(qtLugares) ||
      qtLugares < 1
    ) {
      setErro("Informe números inteiros maiores que zero.");
      return;
    }

    const dados = {
      nr_mesa: nrMesa,
      qt_lugares: qtLugares,
    };

    setSalvando(true);

    try {
      if (mesaEditando !== null) {
        await apiPatch<Mesa>(`mesas/${mesaEditando}`, dados);
        setSucesso("Mesa atualizada com sucesso!");
      } else {
        await apiPost<Mesa>("mesas", dados);
        setSucesso("Mesa cadastrada com sucesso!");
      }

      setFormulario(formularioInicial);
      setMesaEditando(null);
      await carregarMesas();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a mesa."
      );
    } finally {
      setSalvando(false);
    }
  }

  function editarMesa(mesa: Mesa) {
    setMesaEditando(mesa.id_mesa);
    setFormulario({
      nr_mesa: String(mesa.nr_mesa),
      qt_lugares: String(mesa.qt_lugares),
    });
    setErro("");
    setSucesso("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function excluirMesa(mesa: Mesa) {
    const confirmar = window.confirm(
      `Deseja realmente excluir a mesa ${mesa.nr_mesa}?`
    );

    if (!confirmar) return;

    setErro("");
    setSucesso("");

    try {
      await apiDelete<void>(`mesas/${mesa.id_mesa}`);

      setSucesso(`Mesa ${mesa.nr_mesa} excluída com sucesso!`);

      if (mesaEditando === mesa.id_mesa) {
        setFormulario(formularioInicial);
        setMesaEditando(null);
      }

      await carregarMesas();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a mesa."
      );
    }
  }

  const totalLugares = mesas.reduce(
    (total, mesa) => total + mesa.qt_lugares,
    0
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 text-[#352A2C]">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#87364D]">
          Administração
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Gerenciamento de Mesas
        </h1>

        <p className="mt-2 text-sm text-[#786C6C]">
          Cadastre, consulte, edite e remova as mesas do restaurante.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#E9DED6] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#786C6C]">Mesas cadastradas</p>
          <p className="mt-2 text-3xl font-bold text-[#6F2438]">
            {mesas.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E9DED6] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#786C6C]">Capacidade total</p>
          <p className="mt-2 text-3xl font-bold text-[#6F2438]">
            {totalLugares}
            <span className="ml-2 text-base font-medium text-[#786C6C]">
              lugares
            </span>
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-[#E9DED6] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">
          {mesaEditando !== null ? "Editar mesa" : "Cadastrar mesa"}
        </h2>

        <form
          onSubmit={salvarMesa}
          className="mt-5 grid gap-5 md:grid-cols-3"
        >
          <div>
            <label
              htmlFor="nr_mesa"
              className="mb-2 block text-sm font-medium"
            >
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
              className="w-full rounded-xl border border-[#E2D5CD] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#87364D] focus:ring-2 focus:ring-[#87364D]/15"
              placeholder="Ex.: 1"
            />
          </div>

          <div>
            <label
              htmlFor="qt_lugares"
              className="mb-2 block text-sm font-medium"
            >
              Quantidade de lugares
            </label>

            <input
              id="qt_lugares"
              type="number"
              min="1"
              step="1"
              required
              value={formulario.qt_lugares}
              onChange={(e) =>
                alterarCampo("qt_lugares", e.target.value)
              }
              className="w-full rounded-xl border border-[#E2D5CD] bg-[#FFFCF9] px-4 py-3 outline-none focus:border-[#87364D] focus:ring-2 focus:ring-[#87364D]/15"
              placeholder="Ex.: 4"
            />
          </div>

          <div className="flex items-end gap-3">
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 rounded-xl bg-[#6F2438] px-5 py-3 font-semibold text-white transition hover:bg-[#87364D] disabled:cursor-not-allowed disabled:opacity-60"
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
                className="rounded-xl border border-[#E2D5CD] px-4 py-3 font-medium hover:bg-[#FAF7F2]"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {erro && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {erro}
          </p>
        )}

        {sucesso && !erro && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {sucesso}
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E9DED6] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEE5DF] p-6">
          <div>
            <h2 className="text-xl font-bold">Mesas cadastradas</h2>
            <p className="mt-1 text-sm text-[#786C6C]">
              Lista ordenada pelo número da mesa.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void carregarMesas()}
            disabled={carregando}
            className="rounded-xl border border-[#E2D5CD] px-4 py-2 text-sm font-semibold transition hover:bg-[#FAF7F2] disabled:opacity-60"
          >
            {carregando ? "Atualizando..." : "Atualizar lista"}
          </button>
        </div>

        {carregando ? (
          <p className="p-8 text-center text-[#786C6C]">
            Carregando mesas...
          </p>
        ) : mesas.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-lg font-semibold">Nenhuma mesa cadastrada</p>
            <p className="mt-2 text-sm text-[#786C6C]">
              Utilize o formulário acima para cadastrar a primeira mesa.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF7F2] text-[#6A5558]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Número</th>
                  <th className="px-6 py-4 font-semibold">Lugares</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EEE5DF]">
                {mesas.map((mesa) => (
                  <tr
                    key={mesa.id_mesa}
                    className="transition hover:bg-[#FFFCF9]"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex min-w-12 items-center justify-center rounded-lg bg-[#F4E8E9] px-3 py-2 font-bold text-[#6F2438]">
                        {mesa.nr_mesa}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {mesa.qt_lugares}{" "}
                      {mesa.qt_lugares === 1 ? "lugar" : "lugares"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => editarMesa(mesa)}
                          className="rounded-lg border border-[#E2D5CD] px-3 py-2 font-medium transition hover:bg-[#FAF7F2]"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => void excluirMesa(mesa)}
                          className="rounded-lg border border-red-200 px-3 py-2 font-medium text-red-700 transition hover:bg-red-50"
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
