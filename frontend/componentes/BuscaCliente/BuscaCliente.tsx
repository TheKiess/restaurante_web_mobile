"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet }                      from "@/lib/api";
import estilos                         from "@/estilos/Painel.module.css";

export type ClienteBusca = {
  id_usuario: number;
  ds_apelido: string;
  pessoa: {
    nm_pessoa: string;
    ds_telefone: string | null;
  };
};

type Propriedades = {
  clienteEscolhido: ClienteBusca | null;
  aoEscolher: (cliente: ClienteBusca | null) => void;
  idCampo: string;
  nmRotulo?: string;
};

const NR_MILISSEGUNDOS_ESPERA = 300;
const QT_MINIMA_LETRAS        = 2;

export default function BuscaCliente({clienteEscolhido, aoEscolher, idCampo, nmRotulo = "Cliente (opcional)"}: Propriedades)
{
  const [dsBusca,       setDsBusca]       = useState("");
  const [arrResultados, setArrResultados] = useState<ClienteBusca[]>([]);
  const [flBuscou,      setFlBuscou]      = useState(false);
  const [dsErro,        setDsErro]        = useState("");
  const refTemporizador                   = useRef<number | undefined>(undefined);
  const refRequisicao                     = useRef(0);

  useEffect(() => { return () => window.clearTimeout(refTemporizador.current); }, []);

  async function buscar(dsTermo: string)
  {
    const nrRequisicao = ++refRequisicao.current;

    try
    {
      const arrClientes = await apiGet<ClienteBusca[]>(`usuarios/clientes?busca=${encodeURIComponent(dsTermo)}`);

      // Resposta de uma busca antiga não pode sobrescrever a mais nova.
      if (nrRequisicao !== refRequisicao.current)
        return;

      setArrResultados(arrClientes);
      setFlBuscou(true);
      setDsErro("");
    }
    catch (erro)
    {
      if (nrRequisicao !== refRequisicao.current)
        return;

      setDsErro(erro instanceof Error ? erro.message : "Não foi possível buscar os clientes.");
    }
  }

  function aoDigitar(dsTexto: string)
  {
    setDsBusca(dsTexto);
    window.clearTimeout(refTemporizador.current);
    refRequisicao.current++;

    if (dsTexto.trim().length < QT_MINIMA_LETRAS)
    {
      setArrResultados([]);
      setFlBuscou(false);
      return;
    }

    refTemporizador.current = window.setTimeout(() => void buscar(dsTexto.trim()), NR_MILISSEGUNDOS_ESPERA);
  }

  function escolher(cliente: ClienteBusca | null)
  {
    aoEscolher(cliente);
    setDsBusca("");
    setArrResultados([]);
    setFlBuscou(false);
  }

  if (clienteEscolhido)
  {
    return (
      <div>
        <p className={estilos.rotulo}>{nmRotulo}</p>

        <div className={estilos.itemLancado}>
          <div>
            <p className={estilos.negrito}>{clienteEscolhido.pessoa.nm_pessoa}</p>
            <p className={estilos.subtituloCartao}>
              {clienteEscolhido.ds_apelido}
              {clienteEscolhido.pessoa.ds_telefone && ` · ${clienteEscolhido.pessoa.ds_telefone}`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => escolher(null)}
            className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}
          >
            Remover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={idCampo} className={estilos.rotulo}>{nmRotulo}</label>
      <input
        id={idCampo}
        type="search"
        value={dsBusca}
        onChange={(evento) => aoDigitar(evento.target.value)}
        placeholder="Busque por nome, login ou telefone"
        autoComplete="off"
        maxLength={60}
        className={estilos.entrada}
      />

      {dsErro && <p className={`${estilos.observacao} ${estilos.espacoTopo}`}>{dsErro}</p>}

      {flBuscou && arrResultados.length === 0 && (
        <p className={`${estilos.observacao} ${estilos.espacoTopo}`}>Nenhum cliente encontrado.</p>
      )}

      {arrResultados.length > 0 && (
        <div className={`${estilos.listaItens} ${estilos.espacoTopo}`}>
          {arrResultados.map((cliente) => (
            <button
              key={cliente.id_usuario}
              type="button"
              onClick={() => escolher(cliente)}
              className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno} ${estilos.larguraCompleta}`}
            >
              {cliente.pessoa.nm_pessoa} · {cliente.ds_apelido}
              {cliente.pessoa.ds_telefone && ` · ${cliente.pessoa.ds_telefone}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
