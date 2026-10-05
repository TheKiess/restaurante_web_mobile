import type { Metadata } from "next";
import Cabecalho from "@/componentes/Cabecalho/Cabecalho";
import Rodape from "@/componentes/Rodape/Rodape";
import { DS_SISTEMA, NM_SISTEMA } from "@/lib/constantes";
import "./globals.css";

export const metadata: Metadata = {
  title: NM_SISTEMA,
  description: DS_SISTEMA,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>
        <Cabecalho />
        <main>{children}</main>
        <Rodape />
      </body>
    </html>
  );
}
