
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
}                    from "recharts";
import jsPDF         from "jspdf";
import html2canvas   from "html2canvas";
import { apiGet }    from "@/lib/api";
import estilos       from "@/componentes/Painel/Painel.module.css";
import estilosPagina from "./page.module.css";

type ItemPedidoApi = {
  id_item_pedido: number;
  id_comanda: number;
  qt_quantidade: number;
  vl_unitario: number | string;
  id_situacao: string;
  dt_pedido: string;
  item_cardapio?: {
    nm_item: string;
  } | null;
  comanda?: {
    id_comanda: number;
    mesa?: {
      nr_mesa: number;
    } | null;
  } | null;
};

type Periodo = "hoje" | "seteDias" | "trintaDias" | "mes" | "personalizado";

const moeda = (valor: number) => valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const dataLocal = (data: Date) => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

const inicioDoDia = (valor: string) => new Date(`${valor}T00:00:00`);

const formatarData = (valor: string) => {
  if (!valor) return "—";
  return new Date(`${valor}T12:00:00`).toLocaleDateString("pt-BR");
};

export default function PaginaRelatorios() {
  const hoje = dataLocal(new Date());
  const primeiroDiaMes = `${hoje.slice(0, 7)}-01`;

  const [itens, setItens] = useState<ItemPedidoApi[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [periodo, setPeriodo] = useState<Periodo>("hoje");
  const [mesSelecionado, setMesSelecionado] = useState(hoje.slice(0, 7));
  const [dataInicio, setDataInicio] = useState(primeiroDiaMes);
  const [dataFim, setDataFim] = useState(hoje);

  const relatorioRef = useRef<HTMLDivElement>(null);

  const carregarItens = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await apiGet<ItemPedidoApi[]>("itens-pedido");
      setItens(Array.isArray(resposta) ? resposta : []);
    } catch (e) {
      console.error("Erro ao carregar relatórios:", e);
      setErro(
        "Não foi possível carregar os dados. Verifique se o backend está em execução."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarItens();
  }, [carregarItens]);

  const intervalo = useMemo(() => {
    const agora = new Date();
    let inicio: Date;
    let fim = inicioDoDia(hoje);

    if (periodo === "hoje") {
      inicio = inicioDoDia(hoje);
    } else if (periodo === "seteDias") {
      inicio = new Date(fim);
      inicio.setDate(inicio.getDate() - 6);
    } else if (periodo === "trintaDias") {
      inicio = new Date(fim);
      inicio.setDate(inicio.getDate() - 29);
    } else if (periodo === "mes") {
      inicio = inicioDoDia(`${mesSelecionado}-01`);
      const [ano, mes] = mesSelecionado.split("-").map(Number);
      fim = new Date(ano, mes, 0);
    } else {
      inicio = inicioDoDia(dataInicio);
      fim = inicioDoDia(dataFim);
    }

    // Não permite incluir datas futuras no período selecionado.
    if (fim > inicioDoDia(hoje)) fim = inicioDoDia(hoje);

    return {
      inicio: dataLocal(inicio),
      fim: dataLocal(fim),
      dataInicio: inicio,
      dataFim: fim,
      agora,
    };
  }, [periodo, hoje, mesSelecionado, dataInicio, dataFim]);

  const itensDoPeriodo = useMemo(() => {
    if (intervalo.dataFim < intervalo.dataInicio) return [];

    return itens.filter((item) => {
      if (!item.dt_pedido) return false;

      const data = dataLocal(new Date(item.dt_pedido));

      return data >= intervalo.inicio && data <= intervalo.fim;
    });
  }, [itens, intervalo]);

  const itensValidos = useMemo(
    () => itensDoPeriodo.filter((item) => item.id_situacao !== "CANCELADO"),
    [itensDoPeriodo]
  );

  const totalVendido = itensValidos.reduce(
    (total, item) =>
      total + item.qt_quantidade * Number(item.vl_unitario),
    0
  );

  const totalItens = itensValidos.reduce(
    (total, item) => total + item.qt_quantidade,
    0
  );

  const totalComandas = new Set(
    itensValidos.map((item) => item.id_comanda)
  ).size;

  const itensCancelados = itensDoPeriodo.filter(
    (item) => item.id_situacao === "CANCELADO"
  );

  const totalCancelados = itensCancelados.reduce(
    (total, item) => total + item.qt_quantidade,
    0
  );

  const totalAguardando = itensDoPeriodo.filter(
    (item) => item.id_situacao === "AGUARDANDO"
  ).length;

  const totalEmPreparo = itensDoPeriodo.filter(
    (item) => item.id_situacao === "EM_PREPARO"
  ).length;

  const totalProntos = itensDoPeriodo.filter(
    (item) => item.id_situacao === "PRONTO"
  ).length;

  const totalEntregues = itensDoPeriodo.filter(
    (item) => item.id_situacao === "ENTREGUE"
  ).length;

  const produtosAgrupados = useMemo(() => {
    const agrupados = new Map<
      string,
      { nome: string; quantidade: number; total: number }
    >();

    itensValidos.forEach((item) => {
      const nome = item.item_cardapio?.nm_item ?? "Produto sem nome";
      const atual = agrupados.get(nome) ?? {
        nome,
        quantidade: 0,
        total: 0,
      };

      atual.quantidade += item.qt_quantidade;
      atual.total += item.qt_quantidade * Number(item.vl_unitario);

      agrupados.set(nome, atual);
    });

    return Array.from(agrupados.values()).sort(
      (a, b) => b.quantidade - a.quantidade
    );
  }, [itensValidos]);

  const dadosGrafico = useMemo(() => {
    const porDia = new Map<
      string,
      { data: string; valor: number; pedidos: Set<number> }
    >();

    itensValidos.forEach((item) => {
      const chave = dataLocal(new Date(item.dt_pedido));
      const registro = porDia.get(chave) ?? {
        data: chave,
        valor: 0,
        pedidos: new Set<number>(),
      };

      registro.valor += item.qt_quantidade * Number(item.vl_unitario);
      registro.pedidos.add(item.id_comanda);
      porDia.set(chave, registro);
    });

    return Array.from(porDia.values())
      .sort((a, b) => a.data.localeCompare(b.data))
      .map((registro) => ({
        data: formatarData(registro.data),
        vendas: Number(registro.valor.toFixed(2)),
        pedidos: registro.pedidos.size,
      }));
  }, [itensValidos]);

  const tituloPeriodo = useMemo(() => {
    if (periodo === "hoje") return "Hoje";
    if (periodo === "seteDias") return "Últimos 7 dias";
    if (periodo === "trintaDias") return "Últimos 30 dias";
    if (periodo === "mes") {
      const [ano, mes] = mesSelecionado.split("-").map(Number);
      return new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
    }
    return `${formatarData(dataInicio)} até ${formatarData(dataFim)}`;
  }, [periodo, mesSelecionado, dataInicio, dataFim]);

  const exportarCSV = () => {
    const linhas = [
      ["Relatório de vendas"],
      [`Período: ${tituloPeriodo}`],
      [],
      ["Produto", "Quantidade", "Valor total"],
      ...produtosAgrupados.map((produto) => [
        produto.nome,
        String(produto.quantidade),
        produto.total.toFixed(2).replace(".", ","),
      ]),
      [],
      ["Total vendido", totalVendido.toFixed(2).replace(".", ",")],
      ["Comandas com itens válidos", String(totalComandas)],
      ["Itens vendidos", String(totalItens)],
      ["Quantidade de itens cancelados", String(totalCancelados)],
    ];

    const csv = "\uFEFF" + linhas
      .map((linha) =>
        linha.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(";")
      )
      .join("\r\n");

    const arquivo = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-restaurante.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportarPDF = async () => {
    if (!relatorioRef.current) return;

    try {
      const canvas = await html2canvas(relatorioRef.current, {
        scale: 2,
        backgroundColor: "#f8f2e8",
        useCORS: true,
      });

      const imagem = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const larguraPagina = pdf.internal.pageSize.getWidth();
      const alturaPagina = pdf.internal.pageSize.getHeight();
      const larguraImagem = larguraPagina;
      const alturaImagem = (canvas.height * larguraImagem) / canvas.width;

      let restante = alturaImagem;
      let posicao = 0;

      pdf.addImage(imagem, "PNG", 0, posicao, larguraImagem, alturaImagem, undefined, "FAST");
      restante -= alturaPagina;

      while (restante > 0) {
        posicao = restante - alturaImagem;
        pdf.addPage();
        pdf.addImage(imagem, "PNG", 0, posicao, larguraImagem, alturaImagem, undefined, "FAST");
        restante -= alturaPagina;
      }

      pdf.save("relatorio-restaurante.pdf");
    } catch (e) {
      console.error("Erro ao gerar PDF:", e);
      setErro("Não foi possível gerar o PDF. Tente novamente.");
    }
  };

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecalhoComAcao}>
        <div>
          <p className="sobretitulo">Administração</p>
          <h1 className={estilos.titulo}>Relatórios</h1>
          <p className={estilos.descricao}>
            Acompanhe o desempenho do restaurante.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void carregarItens()}
          disabled={carregando}
          className={`${estilos.botao} ${estilos.botaoSecundario}`}
        >
          {carregando ? "Atualizando..." : "Atualizar dados"}
        </button>
      </header>

      <section className={estilos.cartao}>
        <h2 className={estilos.tituloCartao}>Filtrar relatório</h2>

        <div className={`${estilos.botoes} ${estilos.espacoTopo}`}>
          {[
            { valor: "hoje",          texto: "Hoje" },
            { valor: "seteDias",      texto: "7 dias" },
            { valor: "trintaDias",    texto: "30 dias" },
            { valor: "mes",           texto: "Por mês" },
            { valor: "personalizado", texto: "Personalizado" },
          ].map((opcao) => (
            <button
              key={opcao.valor}
              type="button"
              onClick={() => setPeriodo(opcao.valor as Periodo)}
              aria-pressed={periodo === opcao.valor}
              className={`${estilos.botao} ${estilos.botaoPequeno} ${
                periodo === opcao.valor
                  ? estilos.botaoPrimario
                  : estilos.botaoSecundario
              }`}
            >
              {opcao.texto}
            </button>
          ))}
        </div>

        {periodo === "mes" && (
          <div className={estilosPagina.campoFiltro}>
            <label htmlFor="mes" className={estilos.rotulo}>
              Selecione o mês
            </label>
            <input
              id="mes"
              type="month"
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className={estilos.entrada}
            />
          </div>
        )}

        {periodo === "personalizado" && (
          <div className={`${estilos.camposLinha} ${estilos.espacoTopo}`}>
            <div>
              <label htmlFor="dataInicio" className={estilos.rotulo}>
                Data inicial
              </label>
              <input
                id="dataInicio"
                type="date"
                value={dataInicio}
                max={dataFim}
                onChange={(e) => setDataInicio(e.target.value)}
                className={estilos.entrada}
              />
            </div>
            <div>
              <label htmlFor="dataFim" className={estilos.rotulo}>
                Data final
              </label>
              <input
                id="dataFim"
                type="date"
                value={dataFim}
                min={dataInicio}
                max={hoje}
                onChange={(e) => setDataFim(e.target.value)}
                className={estilos.entrada}
              />
            </div>
          </div>
        )}

        <p className={estilosPagina.periodoSelecionado}>
          Período selecionado:{" "}
          <span className={estilosPagina.capitalizar}>{tituloPeriodo}</span>
        </p>
      </section>

      {erro && (
        <div role="alert" className={`${estilos.alerta} ${estilos.alertaErro}`}>
          {erro}
        </div>
      )}

      <div ref={relatorioRef} className={estilosPagina.relatorio}>
        <section className={estilos.estatisticas}>
          <div className={estilos.cartao}>
            <p className={estilos.estatisticaRotulo}>Valor dos pedidos válidos</p>
            <p className={estilos.estatisticaValor}>
              {carregando ? "..." : moeda(totalVendido)}
            </p>
            <p className={estilos.textoPequeno}>Itens não cancelados</p>
          </div>

          <div className={estilos.cartao}>
            <p className={estilos.estatisticaRotulo}>Comandas com pedidos</p>
            <p className={estilos.estatisticaValor}>
              {carregando ? "..." : totalComandas}
            </p>
            <p className={estilos.textoPequeno}>Comandas distintas no período</p>
          </div>

          <div className={estilos.cartao}>
            <p className={estilos.estatisticaRotulo}>Itens vendidos</p>
            <p className={estilos.estatisticaValor}>
              {carregando ? "..." : totalItens}
            </p>
            <p className={estilos.textoPequeno}>Quantidade não cancelada</p>
          </div>

          <div className={estilos.cartao}>
            <p className={estilos.estatisticaRotulo}>Itens cancelados</p>
            <p className={estilos.estatisticaValor}>
              {carregando ? "..." : totalCancelados}
            </p>
            <p className={estilos.textoPequeno}>Quantidade cancelada no período</p>
          </div>
        </section>

        <section className={estilos.cartao}>
          <h2 className={estilos.tituloCartao}>Situação dos pedidos</h2>

          <div className={`${estilos.botoes} ${estilos.espacoTopo}`}>
            <span className={`${estilos.seloEstado} ${estilosPagina.seloGrande} ${estilos.seloAguardando}`}>
              Aguardando: {carregando ? "..." : totalAguardando}
            </span>
            <span className={`${estilos.seloEstado} ${estilosPagina.seloGrande} ${estilos.seloEmPreparo}`}>
              Em preparo: {carregando ? "..." : totalEmPreparo}
            </span>
            <span className={`${estilos.seloEstado} ${estilosPagina.seloGrande} ${estilos.seloPronto}`}>
              Prontos: {carregando ? "..." : totalProntos}
            </span>
            <span className={`${estilos.seloEstado} ${estilosPagina.seloGrande} ${estilos.seloEntregue}`}>
              Entregues: {carregando ? "..." : totalEntregues}
            </span>
            <span className={`${estilos.seloEstado} ${estilosPagina.seloGrande} ${estilos.seloCancelado}`}>
              Cancelados: {carregando ? "..." : itensCancelados.length}
            </span>
          </div>
        </section>

        <section className={estilos.cartao}>
          <h2 className={estilos.tituloCartao}>Vendas por dia</h2>

          {dadosGrafico.length === 0 ? (
            <p className={estilos.carregando}>
              {carregando
                ? "Carregando dados..."
                : "Não há pedidos registrados neste período."}
            </p>
          ) : (
            <div className={estilosPagina.grafico}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4d8c8" />
                  <XAxis dataKey="data" tick={{ fontSize: 12, fill: "#6a5558" }} />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6a5558" }}
                    tickFormatter={(valor: number) =>
                      valor.toLocaleString("pt-BR")
                    }
                  />
                  <Tooltip
                    formatter={(valor) => moeda(Number(valor))}
                    labelStyle={{ color: "#2a1a1c" }}
                  />
                  <Bar
                    dataKey="vendas"
                    name="Vendas"
                    fill="#4a1620"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className={estilos.cartaoTabela}>
          <div className={estilos.cabecalhoCartao}>
            <h2 className={estilos.tituloCartao}>Produtos mais vendidos</h2>
          </div>

          <div className={estilos.tabelaRolagem}>
            <table className={estilos.tabela}>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th className={estilos.alinharDireita}>Quantidade</th>
                  <th className={estilos.alinharDireita}>Valor total</th>
                </tr>
              </thead>
              <tbody>
                {produtosAgrupados.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <p className={estilos.carregando}>
                        {carregando
                          ? "Carregando..."
                          : "Nenhum produto encontrado no período."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  produtosAgrupados.map((produto) => (
                    <tr key={produto.nome}>
                      <td className={estilos.negrito}>{produto.nome}</td>
                      <td className={estilos.alinharDireita}>
                        {produto.quantidade}
                      </td>
                      <td className={estilos.alinharDireita}>
                        {moeda(produto.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={estilos.cartao}>
          <h2 className={estilos.tituloCartao}>Resumo do relatório</h2>

          <div className={estilosPagina.resumo}>
            <p>
              <strong>Período:</strong> {tituloPeriodo}
            </p>
            <p>
              <strong>Valor dos itens não cancelados:</strong>{" "}
              {carregando ? "Carregando..." : moeda(totalVendido)}
            </p>
            <p>
              <strong>Produtos diferentes vendidos:</strong>{" "}
              {carregando ? "..." : produtosAgrupados.length}
            </p>
            <p>
              <strong>Tempo médio de preparo:</strong> Não disponível nos
              dados atuais da API.
            </p>
            <p className={estilosPagina.nota}>
              O valor total é calculado pela quantidade multiplicada pelo
              preço unitário dos itens não cancelados. Não representa
              necessariamente pagamentos recebidos.
            </p>
          </div>
        </section>
      </div>

      <div className={`${estilos.botoes} ${estilosPagina.exportar}`}>
        <button
          type="button"
          onClick={exportarCSV}
          disabled={carregando}
          className={`${estilos.botao} ${estilos.botaoSecundario}`}
        >
          Exportar CSV
        </button>
        <button
          type="button"
          onClick={() => void exportarPDF()}
          disabled={carregando}
          className={`${estilos.botao} ${estilos.botaoPrimario}`}
        >
          Exportar PDF
        </button>
      </div>
    </div>
  );
}
