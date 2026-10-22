import { NextResponse }     from "next/server";
import { NM_COOKIE_SESSAO } from "@/lib/constantes";
import { URL_API }          from "@/lib/servidor";
import { decodificarToken } from "@/lib/token";

const NR_SEGUNDOS_PADRAO = 8 * 60 * 60;

export async function POST(request: Request)
{
  let resposta: Response;

  try
  {
    resposta = await fetch(`${URL_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
  }
  catch
  {
    return NextResponse.json({ message: "Não foi possível conectar ao servidor." },
      { status: 502 }
    );
  }

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok)
    return NextResponse.json(corpo ?? { message: "Não foi possível entrar." }, { status: resposta.status });

  const nrExpira   = decodificarToken(corpo.ds_token)?.exp;
  const nrSegundos = nrExpira ? nrExpira - Math.floor(Date.now() / 1000) : NR_SEGUNDOS_PADRAO;
  const saida      = NextResponse.json({ usuario: corpo.usuario });

  saida.cookies.set(NM_COOKIE_SESSAO, corpo.ds_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: nrSegundos,
  });

  return saida;
}
