/**
 * Desenvolvimento da pagina do cliente, pode ser acessada por /cliente
 * Template base: Next Shadcn Admin (reoring/next-shadcn-admin).
 * Utilizado template base do repositório acima
 * Utilizado IA para manter principalmente as consistências visuais e o padrão das interfaces
 * Realizadas modiificações necessárias para cada interface
 * Boa parte das interfaces foram reutilizadas em outras páginas para manter o padrão
 */
import Link from "next/link";
import { ArrowRight, ClipboardList, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function ClientePage() {
  return (
    <main className="min-h-screen bg-[#F8F4EF] px-4 py-8 text-[#3F302D] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="rounded-2xl bg-[#6F2438] p-8 text-[#F5E9DC] shadow-sm sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E8C9B8]">
            Seja bem-vindo!
          </p>

          <h1 className="mt-3 max-w-3xl text-3xl font-bold sm:text-5xl">
            Seu próximo prato favorito está aqui.
          </h1>

          <p className="mt-4 max-w-2xl leading-relaxed text-[#F5E9DC]/90">
            Explore nosso cardápio, escolha seus favoritos e
            prepare seu pedido com praticidade.
          </p>

        <Link
            href="/cliente/cardapio"
            className="mt-7 inline-flex items-center rounded-md bg-[#F5E9DC] px-4 py-2 font-bold !text-[#6F2438] transition hover:bg-white">
                Ver cardápio
            <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-bold">
            O que você deseja fazer?
          </h2>

          <p className="text-[#77685E]">
            Acesse rapidamente as opções do restaurante.
          </p>

          <div className="grid gap-6 pt-4 md:grid-cols-2">
            <Card className="border-[#E8DDD3] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5E9DC] text-[#6F2438]">
                  <Utensils className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#6F2438]">
                  Nosso cardápio
                </h3>

                <p className="mt-2 leading-relaxed text-[#77685E]">
                  Conheça nossos produtos, consulte os preços
                  e monte seu carrinho.
                </p>

                <Link
                    href="/cliente/cardapio"
                    className="mt-4 inline-flex h-auto items-center font-semibold text-[#6F2438] hover:underline">
                        Explorar cardápio
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-[#E8DDD3] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5E9DC] text-[#6F2438]">
                  <ClipboardList className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#6F2438]">
                  Meus pedidos
                </h3>

                <p className="mt-2 leading-relaxed text-[#77685E]">
                  Consulte seus pedidos e acompanhe o andamento
                  quando a integração estiver disponível.
                </p>

                <Link
                    href="/cliente/pedidos"
                    className="mt-4 inline-flex h-auto items-center font-semibold text-[#6F2438] hover:underline">
                        Consultar pedidos
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        <Card className="border-[#E8DDD3] bg-white shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#6F2438]">
              Uma experiência feita para você
            </h2>

            <p className="mt-3 max-w-3xl leading-relaxed text-[#77685E]">
              Navegue pelo cardápio e escolha o que mais combina
              com você. Estamos preparando uma experiência simples
              para facilitar seus pedidos, seja no restaurante ou
              para entrega.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
