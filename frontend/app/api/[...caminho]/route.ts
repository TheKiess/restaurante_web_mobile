import { cookies }          from "next/headers";
import { NextResponse }     from "next/server";
import { NM_COOKIE_SESSAO } from "@/lib/constantes";
import { URL_API }          from "@/lib/servidor";

async function encaminharRequisicao(
  request: Request,
  { params }: { params: Promise<{ caminho: string[] }> }
)
{
  const { caminho } = await params;
  const dsToken     = (await cookies()).get(NM_COOKIE_SESSAO)?.value;
  const dsDestino   = `${URL_API}/${caminho.join("/")}${new URL(request.url).search}`;
  const cabecalhos  = new Headers({ Accept: "application/json" });
  const dsTipo      = request.headers.get("content-type");

  if (dsTipo)
    cabecalhos.set("Content-Type", dsTipo);

  if (dsToken)
    cabecalhos.set("Authorization", `Bearer ${dsToken}`);

  try
  {
    const resposta = await fetch(dsDestino, {
      method: request.method,
      headers: cabecalhos,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(),
      cache: "no-store",
    });
    const saida = new NextResponse(resposta.body, {
      status: resposta.status,
      headers: { "Content-Type": resposta.headers.get("content-type") ?? "application/json" },
    });

    if (resposta.status === 401 && dsToken)
      saida.cookies.delete(NM_COOKIE_SESSAO);

    return saida;
  }
  catch
  {
    return NextResponse.json({ message: "Não foi possível conectar ao servidor." },
      { status: 502 }
    );
  }
}

export {
  encaminharRequisicao as GET,
  encaminharRequisicao as POST,
  encaminharRequisicao as PATCH,
  encaminharRequisicao as PUT,
  encaminharRequisicao as DELETE,
};
