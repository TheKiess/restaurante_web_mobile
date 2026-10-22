"use client";

import Link                    from "next/link";
import { useRouter }           from "next/navigation";
import { OBJ_ROTA_POR_PERFIL } from "@/lib/constantes";
import { encerrarSessao }      from "@/lib/sessao";
import { useSessao }           from "@/lib/useSessao";
import estilos                 from "./AcoesSessao.module.css";

export default function AcoesSessao()
{
  const router = useRouter();
  const usuario = useSessao();

  async function sair()
  {
    await encerrarSessao();
    router.push("/login");
    router.refresh();
  }

  if (!usuario)
    return <Link href="/login" className="botao botaoContorno">Entrar</Link>;

  return (
    <>
      <Link href={OBJ_ROTA_POR_PERFIL[usuario.perfil]} className="botao botaoPreenchido">Painel</Link>
      <button type="button" onClick={sair} className={estilos.sair}>Sair</button>
    </>
  );
}
