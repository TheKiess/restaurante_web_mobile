"use client";

import Link                    from "next/link";
import { OBJ_ROTA_POR_PERFIL } from "@/lib/constantes";
import { sairDaSessao }        from "@/lib/sessao";
import { useSessao }           from "@/lib/useSessao";
import estilos                 from "./AcoesSessao.module.css";

export default function AcoesSessao()
{
  const usuario = useSessao();

  if (!usuario)
    return <Link href="/login" className="botao botaoContorno">Entrar</Link>;

  return (
    <>
      <Link href={OBJ_ROTA_POR_PERFIL[usuario.perfil]} className="botao botaoPreenchido">Painel</Link>
      <button type="button" onClick={sairDaSessao} className={estilos.sair}>Sair</button>
    </>
  );
}
