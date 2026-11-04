import LayoutPainel          from "@/componentes/LayoutPainel/LayoutPainel";
import { ARR_LINKS_GERENTE } from "@/lib/constantes";

export default function GerenteLayout({ children }: LayoutProps<"/gerente">)
{
  return (
    <LayoutPainel nmArea="Área do gerente" arrLinks={ARR_LINKS_GERENTE}>
      <main className="painelPrincipal">{children}</main>
    </LayoutPainel>
  );
}
