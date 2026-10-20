import Link from "next/link";
import { ArrowRight, ClipboardList, Utensils, PackageCheck, Banknote, } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function GarcomPage() {
  return (
    <main className="min-h-screen bg-[#F8F4EF] px-4 py-8 text-[#3F302D] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="rounded-2xl bg-[#6F2438] p-8 text-[#F5E9DC] shadow-sm sm:p-12">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-white">
              Painel operacional
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              Garçom
            </h1>

            <p className="mt-2 text-white">
              Registre pedidos, acompanhe comandas, finalize pagamentos.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-bold">
            O que você deseja fazer?
          </h2>

          <div className="grid gap-6 pt-4 md:grid-cols-2">
            <Card className="border-[#E8DDD3] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5E9DC] text-[#6F2438]">
                  <Utensils className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#6F2438]">
                  Pedidos
                </h3>

                <p className="mt-2 leading-relaxed text-[#77685E]">
                  Cadastre um novo pedido e consulte os já existentes aqui.
                </p>

                <Link
                    href="/garcom/pedidos"
                    className="mt-4 inline-flex h-auto items-center font-semibold text-[#6F2438] hover:underline">
                        Cadastro de Pedidos
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-[#E8DDD3] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5E9DC] text-[#6F2438]">
                  <PackageCheck className="text-red-600 h-6 w-6 shrink-0"/>
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#6F2438]">
                  Entregas
                </h3>

                <p className="mt-2 leading-relaxed text-[#77685E]">
                  Confira os itens já prontos para entrega ou entregues.
                </p>

                <Link
                    href="/garcom/entregas"
                    className="mt-4 inline-flex h-auto items-center font-semibold text-[#6F2438] hover:underline">
                        Consultar entregas
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-[#E8DDD3] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5E9DC] text-[#6F2438]">
                  <Banknote className="text-emerald-600 h-6 w-6"/>
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#6F2438]">
                  Pagamentos
                </h3>

                <p className="mt-2 leading-relaxed text-[#77685E]">
                  Confira e finalize as comandas aqui.
                </p>

                <Link
                    href="/garcom/pagamentos"
                    className="mt-4 inline-flex h-auto items-center font-semibold text-[#6F2438] hover:underline">
                        Realizar pagamento
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
                  Comandas
                </h3>

                <p className="mt-2 leading-relaxed text-[#77685E]">
                  Confira as comandas em aberto e já finalizadas aqui.
                </p>

                <Link
                    href="/garcom/comandas"
                    className="mt-4 inline-flex h-auto items-center font-semibold text-[#6F2438] hover:underline">
                        Consultar comandas
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
