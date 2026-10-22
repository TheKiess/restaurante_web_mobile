import { NextResponse }     from "next/server";
import { NM_COOKIE_SESSAO } from "@/lib/constantes";

export async function POST()
{
  const saida = new NextResponse(null, { status: 204 });
  saida.cookies.delete(NM_COOKIE_SESSAO);
  return saida;
}
