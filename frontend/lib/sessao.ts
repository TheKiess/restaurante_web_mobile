import { OBJ_PERFIS_POR_AREA, type Perfil } from "@/lib/constantes";

export interface UsuarioSessao {
  id_usuario: number;
  ds_apelido: string;
  nm_pessoa: string;
  perfil: Perfil;
}

export function obterAreaDaRota(dsRota: string): string | undefined
{
  if (!dsRota)
    return undefined;

  return Object.keys(OBJ_PERFIS_POR_AREA).find(
    (dsArea) => dsRota === dsArea || dsRota.startsWith(`${dsArea}/`)
  );
}

export function verificarAcesso(dsRota: string, perfil: Perfil): boolean
{
  if (!dsRota || !perfil)
    return false;

  const dsArea = obterAreaDaRota(dsRota);

  if (!dsArea)
    return true;

  return OBJ_PERFIS_POR_AREA[dsArea].includes(perfil);
}

export async function buscarSessao(sinal?: AbortSignal): Promise<UsuarioSessao | null>
{
  const resposta = await fetch("/api/auth/me", { cache: "no-store", signal: sinal });
  return resposta.ok ? ((await resposta.json()) as UsuarioSessao) : null;
}

export async function encerrarSessao(): Promise<void>
{
  await fetch("/api/auth/logout", { method: "POST" });
}
