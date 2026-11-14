"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPatch }                         from "@/lib/api";
import { useCarregarAoMontar }                      from "@/lib/useCarregarAoMontar";
import estilos                                      from "@/estilos/Painel.module.css";

type MesaDoPainel = {
  id_mesa: number;
  nr_mesa: number;
  qt_lugares: number;
  situacao: "LIVRE" | "OCUPADA" | "RESERVADA";
};

type Propriedades = {
  nrIdComanda: number;
  aoTrocar: (dsMensagem: string) => void;
  aoFechar: ()                   => void;
  aoErro: (dsMensagem: string)   => void;
};

export default function TrocarMesa({ nrIdComanda, aoTrocar, aoFechar, aoErro }: Propriedades)
{
  const [arrMesasLivres, setArrMesasLivres] = useState<MesaDoPainel[]>([]);
  const [dsMesaEscolhida, setDsMesaEscolhida] = useState("");
  const [flCarregando,   setFlCarregando]   = useState(true);
  const [flSalvando,     setFlSalvando]     = useState(false);
  const refAoErro                         = useRef(aoErro);

  // A função do pai muda a cada renderização: guardada aqui para não disparar nova busca de mesas.
  useEffect(() => { refAoErro.current = aoErro; }, [aoErro]);

  const carregarMesas = useCallback(async () => {
    try
    {
      const painel = await apiGet<{ mesas: MesaDoPainel[] }>("mesas/painel");

      setArrMesasLivres(painel.mesas.filter((mesa) => mesa.situacao === "LIVRE"));
    }
    catch (erro)
    {
      refAoErro.current(erro instanceof Error ? erro.message : "Não foi possível carregar as mesas livres.");
    }
    finally
    {
      setFlCarregando(false);
    }
  }, []);

  useCarregarAoMontar(carregarMesas);

  async function trocar()
  {
    if (!dsMesaEscolhida)
    {
      aoErro("Escolha a mesa de destino.");
      return;
    }

    setFlSalvando(true);

    try
    {
      await apiPatch(`comandas/${nrIdComanda}`, { id_mesa: Number(dsMesaEscolhida) });
      aoTrocar("Comanda movida para a nova mesa.");
    }
    catch (erro)
    {
      aoErro(erro instanceof Error ? erro.message : "Não foi possível trocar a mesa.");
    }
    finally
    {
      setFlSalvando(false);
    }
  }

  return (
    <div className={`${estilos.formulario} ${estilos.espacoTopo}`}>
      <label htmlFor={`mesa_destino_${nrIdComanda}`} className={estilos.rotulo}>Mover a comanda para</label>
      <select
        id={`mesa_destino_${nrIdComanda}`}
        value={dsMesaEscolhida}
        onChange={(evento) => setDsMesaEscolhida(evento.target.value)}
        disabled={flCarregando}
        className={estilos.entrada}
      >
        <option value="">{flCarregando ? "Carregando..." : arrMesasLivres.length === 0 ? "Nenhuma mesa livre" : "Escolha uma mesa livre"}</option>
        {arrMesasLivres.map((mesa) => (
          <option key={mesa.id_mesa} value={mesa.id_mesa}>Mesa {mesa.nr_mesa} ({mesa.qt_lugares} lugares)</option>
        ))}
      </select>

      <div className={estilos.botoes}>
        <button
          type="button"
          onClick={() => void trocar()}
          disabled={flSalvando || flCarregando}
          className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.botaoPequeno}`}
        >
          {flSalvando ? "Movendo..." : "Trocar mesa"}
        </button>
        <button type="button" onClick={aoFechar} className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
