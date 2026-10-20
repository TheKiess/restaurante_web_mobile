/**
 * Aba lateral da pagina de gerente, com navegação para outras páginas
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/gerente", label: "Início" },
  { href: "/gerente/pedidos", label: "Pedidos" },
  { href: "/gerente/mesas", label: "Mesas" },
  { href: "/gerente/cardapio", label: "Cardápio" },
  { href: "/gerente/categorias", label: "Categorias" },
  { href: "/gerente/relatorios", label: "Relatórios" },
];


export default function MenuGerente() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 bg-[#6F2438] p-5 text-white md:min-h-screen md:w-64">
      <h2 className="mb-8 text-2xl font-bold">
        Restaurante
      </h2>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#E8D5D9]">
        Área do gerente
      </p>

      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const ativo =
            pathname === link.href ||
            (link.href !== "/gerente" &&
              pathname.startsWith(`${link.href}/`));

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={ativo ? "page" : undefined}
              className={`rounded-lg px-4 py-3 transition-colors ${
                ativo
                  ? "bg-[#87364D] font-semibold"
                  : "hover:bg-[#87364D]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
