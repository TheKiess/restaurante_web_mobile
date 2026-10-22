import LayoutPainel          from "@/componentes/LayoutPainel/LayoutPainel";
import { ARR_LINKS_CLIENTE } from "@/lib/constantes";

export default function ClienteLayout({ children }: LayoutProps<"/cliente">)
{
  return (
    <LayoutPainel nmArea="Área do cliente" arrLinks={ARR_LINKS_CLIENTE}>
      {children}
    </LayoutPainel>
  );
}
