import LayoutPainel          from "@/componentes/LayoutPainel/LayoutPainel";
import { ARR_LINKS_COZINHA } from "@/lib/constantes";

export default function CozinhaLayout({ children }: LayoutProps<"/cozinha">)
{
  return (
    <LayoutPainel nmArea="Área da cozinha" arrLinks={ARR_LINKS_COZINHA}>
      <main className="min-w-0 p-5 md:p-8">{children}</main>
    </LayoutPainel>
  );
}
