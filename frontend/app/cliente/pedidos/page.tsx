
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function PedidosClientePage() {
  return (
    <main className="min-h-screen bg-[#F8F4EF] px-4 py-8 text-[#3F302D] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-2xl bg-[#6F2438] p-8 text-[#F5E9DC] shadow-sm sm:p-10">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8" />

            <div>
              <p className="text-sm font-medium text-[#E8C9B8]">
                Área do cliente
              </p>

              <h1 className="text-3xl font-bold sm:text-4xl">
                Meus pedidos
              </h1>
            </div>
          </div>
        </section>
        <div className="mb-6 text-[#F5E9DC]" >
            <Link
                href="/cliente"
                className="inline-flex items-center gap-2 rounded-lg border border-[#DED2C8] bg-white px-4 py-2.5 text-sm font-semibold !text-[#6F2438] transition hover:bg-[#F5E9DC]"
            >
                <ArrowLeft className="h-4 w-4" />
                    Voltar para o início
            </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Histórico de pedidos
            </h2>

            <p className="mt-1 text-sm text-[#77685E]">
              Seus pedidos aparecerão nesta área.
            </p>
          </div>

          <Link
            href="/cliente/cardapio"
            className="inline-flex items-center gap-2 rounded-lg bg-[#6F2438] px-4 py-2.5 text-sm font-semibold !text-[#F5E9DC] transition hover:bg-[#541A2A]"
          >
            <ShoppingBag className="h-4 w-4" />
            Fazer pedido
          </Link>
        </div>

        <Card className="border-[#E8DDD3] bg-white shadow-sm">
          <CardContent className="flex flex-col items-center px-6 py-12 text-center sm:py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5E9DC] text-[#6F2438]">
              <ClipboardList className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-xl font-bold">
              Nenhum pedido por enquanto
            </h3>
            <Link
              href="/cliente/cardapio"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#6F2438] px-5 py-3 font-semibold !text-[#F5E9DC] transition hover:bg-[#541A2A]"
            >
              Explorar cardápio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-[#E8DDD3] bg-white shadow-sm">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="rounded-xl bg-[#F5E9DC] p-3 text-[#6F2438]">
                <Clock className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold">
                  Acompanhe o andamento
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#77685E]">
                  Acompanhe o status de seus pedidos.
                </p>

              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8DDD3] bg-white shadow-sm">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="rounded-xl bg-[#F5E9DC] p-3 text-[#6F2438]">
                <ShoppingBag className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold">
                  Faça seu próximo pedido
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-[#77685E]">
                  Explore as opções do cardápio e escolha
                  seus produtos favoritos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
