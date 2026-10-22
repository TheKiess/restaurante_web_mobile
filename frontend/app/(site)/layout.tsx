import Cabecalho from "@/componentes/Cabecalho/Cabecalho";
import Rodape    from "@/componentes/Rodape/Rodape";

export default function SiteLayout({ children }: LayoutProps<"/">)
{
  return (
    <>
      <Cabecalho />
        <main>{children}</main>
      <Rodape />
    </>
  );
}
