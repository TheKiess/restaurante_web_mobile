import Cabecalho from "@/componentes/Cabecalho/Cabecalho";
import Rodape    from "@/componentes/Rodape/Rodape";

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
