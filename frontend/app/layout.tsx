import type { Metadata }                  from "next";
import { DS_RESTAURANTE, NM_RESTAURANTE } from "@/lib/constantes";
import "./globals.css";

export const metadata: Metadata = {
  title: NM_RESTAURANTE,
  description: DS_RESTAURANTE,
};

export default function RootLayout({ children }: LayoutProps<"/">)
{
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
