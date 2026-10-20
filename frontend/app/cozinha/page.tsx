/**
 * Desenvolvimento da pagina da cozinha, pode ser acessada por /cozinha
 * Template base: Next Shadcn Admin (reoring/next-shadcn-admin).
 * Utilizado template base do repositório acima
 * Utilizado IA para manter principalmente as consistências visuais e o padrão das interfaces
 * Realizadas modiificações necessárias para cada interface
 * Boa parte das interfaces foram reutilizadas em outras páginas para manter o padrão
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChefHat,
  Clock,
  RefreshCw,
  CheckCircle2,
  Utensils,
} from "lucide-react";

type SituacaoItem =
  | "AGUARDANDO"
  | "EM_PREPARO"
  | "PRONTO"
  | "ENTREGUE"
  | "CANCELADO";

interface ItemPedido {
  id_item_pedido: number;
  id_situacao: SituacaoItem;
  qt_quantidade: number;
  ds_observacao: string | null;
  dt_pedido: string;
  item_cardapio: {
    nm_item: string;
  };
  comanda: {
    id_comanda: number;
    mesa: {
      nr_mesa: number;
    } | null;
  };
}

function formatarHorario(data: string) {
  const dataPedido = new Date(data);

  if (Number.isNaN(dataPedido.getTime())) {
    return "Horário indisponível";
  }

  return dataPedido.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CozinhaPage() {
  const [pedidos, setPedidos] = useState<ItemPedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [itemEmAtualizacao, setItemEmAtualizacao] =
    useState<number | null>(null);
  const [erro, setErro] = useState("");

  const carregarPedidos = useCallback(async () => {
    try {
      setErro("");
      setAtualizando(true);

      const dados = await apiGet<ItemPedido[]>("itens-pedido/fila");
      setPedidos(dados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a fila da cozinha."
      );
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    void carregarPedidos();
  }, [carregarPedidos]);

  async function alterarSituacao(
    item: ItemPedido,
    novaSituacao: SituacaoItem
  ) {
    try {
      setErro("");
      setItemEmAtualizacao(item.id_item_pedido);

      await apiPatch<ItemPedido>(
        `itens-pedido/${item.id_item_pedido}/situacao`,
        { id_situacao: novaSituacao }
      );

      await carregarPedidos();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o status do pedido."
      );
    } finally {
      setItemEmAtualizacao(null);
    }
  }

  const aguardando = pedidos.filter(
    (item) => item.id_situacao === "AGUARDANDO"
  );

  const emPreparo = pedidos.filter(
    (item) => item.id_situacao === "EM_PREPARO"
  );

  function renderizarPedido(item: ItemPedido) {
    const processando =
      itemEmAtualizacao === item.id_item_pedido;

    return (
      <Card key={item.id_item_pedido} className="border-[#e5d5c8]">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-[#77685e]">
                Comanda #{item.comanda.id_comanda}
              </p>

              <h3 className="mt-1 text-lg font-semibold text-[#6f2438]">
                {item.item_cardapio.nm_item}
              </h3>
            </div>

            <span className="rounded-full bg-[#f5e9dc] px-3 py-1 text-sm font-semibold">
              {item.qt_quantidade} un.
            </span>
          </div>

          <div className="space-y-2 text-sm text-[#77685e]">
            <p>
              <Clock className="mr-1 inline size-4" />
              Recebido às {formatarHorario(item.dt_pedido)}
            </p>

            <p>
              <Utensils className="mr-1 inline size-4" />
              {item.comanda.mesa
                ? `Mesa ${item.comanda.mesa.nr_mesa}`
                : "Mesa não informada"}
            </p>
          </div>

          {item.ds_observacao && (
            <div className="rounded-md bg-[#f8f4ef] p-3">
              <p className="text-xs font-semibold uppercase text-[#6f2438]">
                Observações
              </p>
              <p className="mt-1 text-sm">{item.ds_observacao}</p>
            </div>
          )}

          <Button
            className="w-full bg-[#6f2438] hover:bg-[#551b2b]"
            disabled={processando}
            onClick={() =>
              void alterarSituacao(
                item,
                item.id_situacao === "AGUARDANDO"
                  ? "EM_PREPARO"
                  : "PRONTO"
              )
            }
          >
            {processando ? (
              "Atualizando..."
            ) : item.id_situacao === "AGUARDANDO" ? (
              <>
                <ChefHat className="mr-2 size-4" />
                Iniciar preparo
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 size-4" />
                Marcar como pronto
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f4ef] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-[#77685e]">
              Painel operacional
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#6f2438]">
              Cozinha
            </h1>

            <p className="mt-2 text-[#77685e]">
              Acompanhe os pedidos e atualize o preparo dos pratos.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => void carregarPedidos()}
            disabled={atualizando}
          >
            <RefreshCw className="mr-2 size-4" />
            Atualizar fila
          </Button>
        </header>

        {erro && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {erro}
          </div>
        )}

        {carregando ? (
          <Card>
            <CardContent className="p-8 text-center">
              Carregando pedidos...
            </CardContent>
          </Card>
        ) : pedidos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <ChefHat className="size-12 text-[#6f2438]" />
              <h2 className="text-xl font-semibold">
                Nenhum pedido na fila
              </h2>
              <p className="max-w-md text-sm text-[#77685e]">
                Quando houver itens aguardando preparo ou em preparo,
                eles aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#6f2438]">
                  Aguardando preparo
                </h2>
                <span className="rounded-full bg-[#f5e9dc] px-3 py-1 text-sm font-semibold">
                  {aguardando.length}
                </span>
              </div>

              {aguardando.length === 0 ? (
                <p className="text-sm text-[#77685e]">
                  Nenhum item aguardando.
                </p>
              ) : (
                aguardando.map(renderizarPedido)
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#6f2438]">
                  Em preparo
                </h2>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                  {emPreparo.length}
                </span>
              </div>

              {emPreparo.length === 0 ? (
                <p className="text-sm text-[#77685e]">
                  Nenhum item em preparo.
                </p>
              ) : (
                emPreparo.map(renderizarPedido)
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
