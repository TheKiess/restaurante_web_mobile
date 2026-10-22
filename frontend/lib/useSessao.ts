"use client";

import { useEffect, useState }              from "react";
import { buscarSessao, type UsuarioSessao } from "@/lib/sessao";

export function useSessao(): UsuarioSessao | null
{
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);

  useEffect(() => {
    const controlador = new AbortController();

    buscarSessao(controlador.signal)
      .then(setUsuario)
      .catch(() => undefined);

    return () => controlador.abort();
  }, []);

  return usuario;
}
