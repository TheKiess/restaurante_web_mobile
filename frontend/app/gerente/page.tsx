/**
 * Desenvolvimento da pagina do gerente, pode ser acessada por /gerente
 * Template base: Next Shadcn Admin (reoring/next-shadcn-admin).
 * Utilizado template base do repositório acima
 * Utilizado IA para manter principalmente as consistências visuais e o padrão das interfaces
 * Realizadas modiificações necessárias para cada interface
 * Boa parte das interfaces foram reutilizadas em outras páginas para manter o padrão
 * Cores do globals.css mantidas 
 */
"use client";

import { useEffect, useState } from "react";
import Link                    from "next/link";
import { apiGet }              from "@/lib/api";
import estilos                 from "@/componentes/Painel/Painel.module.css";
import estilosPagina           from "./page.module.css";

type ItemPedidoApi = {
  id_item_pedido: number;
  id_comanda: number | string;
  qt_quantidade: number | string;
  vl_unitario: number | string;
  id_situacao: string;
  dt_pedido: string;
};

type Indicadores = {
  faturamento: number;
  pedidos: number;
  ticketMedio: number;
};

const indicadoresVazios: Indicadores = {
  faturamento: 0,
  pedidos: 0,
  ticketMedio: 0,
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function calcularIndicadores(
  itens: ItemPedidoApi[]
): Indicadores {
  const itensValidos = itens.filter(
    (item) =>
      String(item.id_situacao).trim().toUpperCase() !==
      "CANCELADO"
  );
  
  const comandas    = new Set(itensValidos.map((item) => String(item.id_comanda)));
  const pedidos     = comandas.size;
  const faturamento = itensValidos.reduce((total, item) => {
    return total + (Number(item.qt_quantidade) || 0 * Number(item.vl_unitario) || 0);
  }, 0);


  return {
    faturamento,
    pedidos,
    ticketMedio: pedidos > 0 ? faturamento / pedidos : 0,
  };
}

const atalhos = [
  {
    titulo: "Pedidos",
    descricao:
      "Consulte e gerencie os pedidos realizados no restaurante.",
    href: "/gerente/pedidos",
    simbolo: "01",
    acao: "Gerenciar pedidos",
  },
  {
    titulo: "Mesas",
    descricao:
      "Visualize as mesas e gerencie a organização do salão.",
    href: "/gerente/mesas",
    simbolo: "02",
    acao: "Gerenciar mesas",
  },
  {
    titulo: "Cardápio",
    descricao:
      "Consulte e administre os produtos oferecidos pelo restaurante.",
    href: "/gerente/cardapio",
    simbolo: "03",
    acao: "Gerenciar cardápio",
  },
  {
    titulo: "Relatórios",
    descricao:
      "Analise as vendas e acompanhe os resultados do restaurante.",
    href: "/gerente/relatorios",
    simbolo: "04",
    acao: "Ver relatórios",
  },
];

export default function GerentePage() {
  const [indicadores, setIndicadores] =
    useState<Indicadores>(indicadoresVazios);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try
      {
        setCarregando(true);
        setErro("");

        const itens =
          await apiGet<ItemPedidoApi[]>("itens-pedido");

        if (ativo) {
          setIndicadores(calcularIndicadores(itens));
        }
      }
      catch (error)
      {
        console.error(
          "Erro ao carregar indicadores do gerente:",
          error
        );

        if (ativo)
        {
          setErro(
            "Não foi possível carregar os indicadores. Verifique se a API está funcionando."
          );
        }
      }
      finally
      {
        if (ativo)
          setCarregando(false);
      }
    }

    carregarDados();

    return () => { ativo = false; };
  }, []);

  const cards = [
    {
      titulo: "Faturamento",
      valor: formatarMoeda(indicadores.faturamento),
      descricao: "Valor dos itens não cancelados",
      icone: "R$",
    },
    {
      titulo: "Pedidos",
      valor: String(indicadores.pedidos),
      descricao: "Comandas com itens não cancelados",
      icone: "#",
    },
    {
      titulo: "Ticket médio",
      valor: formatarMoeda(indicadores.ticketMedio),
      descricao: "Faturamento médio por comanda",
      icone: "↗",
    },
  ];

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecalhoComAcao}>
        <div>
          <p className="sobretitulo">Área administrativa</p>
          <h1 className={estilos.titulo}>Painel do Gerente</h1>
          <p className={estilos.descricao}>
            Acompanhe os resultados e gerencie seu restaurante.
          </p>
        </div>

        <Link
          href="/gerente/relatorios"
          className={`${estilos.botao} ${estilos.botaoPrimario}`}
        >
          Ver relatórios →
        </Link>
      </header>

      <section className={estilosPagina.secao}>
        <h2 className={estilos.tituloCartao}>Visão geral</h2>

        {erro && (
          <div role="alert" className={`${estilos.alerta} ${estilos.alertaErro}`}>
            {erro}
          </div>
        )}

        <div className={estilosPagina.indicadores}>
          {cards.map((card) => (
            <div key={card.titulo} className={estilosPagina.indicador}>
              <div className={estilosPagina.indicadorTopo}>
                <div>
                  <p className={estilosPagina.indicadorRotulo}>{card.titulo}</p>

                  <p className={estilosPagina.indicadorValor}>
                    {carregando ? "Carregando..." : card.valor}
                  </p>
                </div>

                <div className={estilosPagina.icone}>{card.icone}</div>
              </div>

              <p className={estilosPagina.indicadorTexto}>{card.descricao}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={estilosPagina.secao}>
        <h2 className={estilos.tituloCartao}>Gestão do restaurante</h2>

        <div className={estilosPagina.atalhos}>
          {atalhos.map((atalho) => (
            <Link
              key={atalho.href}
              href={atalho.href}
              className={estilosPagina.atalho}
            >
              <div className={estilosPagina.atalhoTopo}>
                <span className={estilosPagina.icone}>{atalho.simbolo}</span>
                <span className={estilosPagina.atalhoSeta}>→</span>
              </div>

              <h3 className={estilosPagina.atalhoTitulo}>{atalho.titulo}</h3>

              <p className={estilosPagina.atalhoTexto}>{atalho.descricao}</p>

              <span className={estilosPagina.atalhoAcao}>{atalho.acao} →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
