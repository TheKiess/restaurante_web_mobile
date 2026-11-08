"use client";

import { useEffect, useRef } from "react";

/**
 * Chama a função de carga a cada nrSegundos enquanto a aba está aberta e visível, e uma vez
 * quando a pessoa volta para a aba. A função deve atualizar a tela em segundo plano, sem
 * mostrar "Carregando...", para a lista não piscar.
 */
export function useAtualizacaoAutomatica(carregar: () => Promise<void>, nrSegundos: number): void
{
  const refCarregar = useRef(carregar);

  useEffect(() => { refCarregar.current = carregar; }, [carregar]);
  useEffect(() => {
    const atualizarSeVisivel = () => {
      if (document.visibilityState === "visible")
        void refCarregar.current();
    };

    document.addEventListener("visibilitychange", atualizarSeVisivel);

    return () => {
      window.clearInterval(window.setInterval(atualizarSeVisivel, nrSegundos * 1000));
      document.removeEventListener("visibilitychange", atualizarSeVisivel);
    };
  }, [nrSegundos]);
}
