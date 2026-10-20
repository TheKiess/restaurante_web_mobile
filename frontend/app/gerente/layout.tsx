
import MenuGerente from "@/components/gerente/menu-gerente";

export default function GerenteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#FAF7F2] md:flex">
      <MenuGerente />

      <main className="min-w-0 flex-1 p-5 md:p-8">
        {children}
      </main>
    </div>
  );
}
