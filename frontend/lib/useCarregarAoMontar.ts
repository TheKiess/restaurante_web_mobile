"use client";

import { useEffect } from "react";

/**
 * Faz a primeira carga da tela logo depois de ela aparecer. O setTimeout tira a carga do
 * corpo do efeito, que não deve chamar setState direto, e o clearTimeout evita carga dupla
 * quando o React monta o componente duas vezes em desenvolvimento.
 */
export function useCarregarAoMontar(carregar: () => Promise<void>): void
{
  useEffect(() => {
    const idTemporizador = setTimeout(() => void carregar(), 0);
    return () => clearTimeout(idTemporizador);
  }, [carregar]);
}
