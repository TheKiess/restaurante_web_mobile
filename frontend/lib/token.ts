import type { Perfil }         from "@/lib/constantes";
import { OBJ_ROTA_POR_PERFIL } from "@/lib/constantes";

export interface PayloadToken {
  sub: number;
  ds_apelido: string;
  perfil: Perfil;
  exp: number;
}

/**
 * Só lê o conteúdo do token e confere a validade, quem confere a assinatura é o backend.
 */
export function decodificarToken(dsToken?: string): PayloadToken | null
{
  if (!dsToken)
    return null;

  try
  {
    const dsCorpo = dsToken.split(".")[1];
    const payload = JSON.parse(Buffer.from(dsCorpo, "base64url").toString("utf-8"));

    if (typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now())
      return null;

    if (!(payload.perfil in OBJ_ROTA_POR_PERFIL))
      return null;

    return payload as PayloadToken;
  }
  catch
  {
    return null;
  }
}
