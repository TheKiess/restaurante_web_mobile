import { NextResponse, type NextRequest }        from "next/server";
import { NM_COOKIE_SESSAO, OBJ_ROTA_POR_PERFIL } from "@/lib/constantes";
import { verificarAcesso }                       from "@/lib/sessao";
import { decodificarToken }                      from "@/lib/token";

export function proxy(request: NextRequest) {
  const dsRota  = request.nextUrl.pathname;
  const payload = decodificarToken(request.cookies.get(NM_COOKIE_SESSAO)?.value);

  if (dsRota === "/login")
  {
    if (!payload)
      return NextResponse.next();

    return NextResponse.redirect(new URL(OBJ_ROTA_POR_PERFIL[payload.perfil], request.url));
  }

  if (!payload)
  {
    const urlLogin = new URL("/login", request.url);
    urlLogin.searchParams.set("de", dsRota);

    const resposta = NextResponse.redirect(urlLogin);
    resposta.cookies.delete(NM_COOKIE_SESSAO);

    return resposta;
  }

  if (!verificarAcesso(dsRota, payload.perfil))
    return NextResponse.redirect(new URL(OBJ_ROTA_POR_PERFIL[payload.perfil], request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/gerente/:path*", "/garcom/:path*", "/cozinha/:path*", "/cliente/:path*"],
};
