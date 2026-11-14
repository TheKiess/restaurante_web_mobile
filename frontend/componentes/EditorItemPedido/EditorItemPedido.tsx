"use client";

import { useState, type FormEvent } from "react";
import { apiPatch }                 from "@/lib/api";
import estilos                      from "@/estilos/Painel.module.css";

type Propriedades = {
  item: {
    id_item_pedido: number;
    qt_quantidade: number;
    ds_observacao?: string | null;
  };
  aoSalvar: (dsMensagem: string) => void;
  aoCancelar: ()                 => void;
  aoErro: (dsMensagem: string)   => void;
};

const QT_MAXIMA = 99;

export default function EditorItemPedido({ item, aoSalvar, aoCancelar, aoErro }: Propriedades)
{
  const [dsQuantidade, setDsQuantidade] = useState(String(item.qt_quantidade));
  const [dsObservacao, setDsObservacao] = useState(item.ds_observacao ?? "");
  const [flSalvando,   setFlSalvando]   = useState(false);

  async function salvar(evento: FormEvent<HTMLFormElement>)
  {
    evento.preventDefault();

    const nrQuantidade = Number(dsQuantidade);

    if (!Number.isInteger(nrQuantidade) || nrQuantidade < 1 || nrQuantidade > QT_MAXIMA)
    {
      aoErro(`A quantidade deve ser um número inteiro de 1 a ${QT_MAXIMA}.`);
      return;
    }

    setFlSalvando(true);

    try
    {
      // null apaga a observação
      await apiPatch(`itens-pedido/${item.id_item_pedido}`, {
        qt_quantidade: nrQuantidade,
        ds_observacao: dsObservacao.trim() || null,
      });

      aoSalvar("Item atualizado com sucesso!");
    }
    catch (erro)
    {
      aoErro(erro instanceof Error ? erro.message : "Não foi possível atualizar o item.");
    }
    finally
    {
      setFlSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className={`${estilos.formulario} ${estilos.espacoTopo}`}>
      <div className={estilos.camposLinha}>
        <div>
          <label htmlFor={`quantidade_item_${item.id_item_pedido}`} className={estilos.rotulo}>Quantidade</label>
          <input
            id={`quantidade_item_${item.id_item_pedido}`}
            type="number"
            min="1"
            max={QT_MAXIMA}
            step="1"
            value={dsQuantidade}
            onChange={(evento) => setDsQuantidade(evento.target.value)}
            className={estilos.entrada}
          />
        </div>

        <div>
          <label htmlFor={`observacao_item_${item.id_item_pedido}`} className={estilos.rotulo}>Observação</label>
          <input
            id={`observacao_item_${item.id_item_pedido}`}
            type="text"
            value={dsObservacao}
            onChange={(evento) => setDsObservacao(evento.target.value)}
            maxLength={200}
            placeholder="Ex.: sem cebola"
            className={estilos.entrada}
          />
        </div>
      </div>

      <div className={estilos.botoes}>
        <button type="submit" disabled={flSalvando} className={`${estilos.botao} ${estilos.botaoPrimario} ${estilos.botaoPequeno}`}>
          {flSalvando ? "Salvando..." : "Salvar item"}
        </button>
        <button type="button" onClick={aoCancelar} className={`${estilos.botao} ${estilos.botaoSecundario} ${estilos.botaoPequeno}`}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
