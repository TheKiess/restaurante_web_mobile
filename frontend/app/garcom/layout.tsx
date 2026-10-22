import LayoutPainel         from "@/componentes/LayoutPainel/LayoutPainel";
import { ARR_LINKS_GARCOM } from "@/lib/constantes";

export default function GarcomLayout({ children }: LayoutProps<"/garcom">)
{
  return (
    <LayoutPainel nmArea="Área do garçom" arrLinks={ARR_LINKS_GARCOM}>
      {children}
    </LayoutPainel>
  );
}
