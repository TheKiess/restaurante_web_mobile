import Cabecalho from "@/componentes/Cabecalho/Cabecalho";
import Rodape    from "@/componentes/Rodape/Rodape";

// Isso aqui é apenas uma gambiarra do tamanho do mundo, depois apagar.
export default function LoginLayout({ children }: LayoutProps<"/login">)
{
  return (
    <>
      <Cabecalho />
      <main>{children}</main>
      <Rodape />
    </>
  );
}
