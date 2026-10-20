
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api";

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

const moeda = (valor: number) =>
  valor.toLocaleString("pt-BR", {
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
        backgroundColor: "#FAF7F0",
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

      pdf.addImage(imagem, "PNG", 0, posicao, larguraImagem, alturaImagem);
      restante -= alturaPagina;

      while (restante > 0) {
        posicao = restante - alturaImagem;
        pdf.addPage();
        pdf.addImage(imagem, "PNG", 0, posicao, larguraImagem, alturaImagem);
        restante -= alturaPagina;
      }

      pdf.save("relatorio-restaurante.pdf");
    } catch (e) {
      console.error("Erro ao gerar PDF:", e);
      setErro("Não foi possível gerar o PDF. Tente novamente.");
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7F0] p-4 text-[#3B2525] md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#6B1727]">
              Relatórios
            </h1>
            <p className="mt-1 text-sm text-[#725D55]">
              Acompanhe o desempenho do restaurante.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void carregarItens()}
            disabled={carregando}
            className="rounded-lg border border-[#6B1727] bg-white px-4 py-2 text-sm font-semibold text-[#6B1727] hover:bg-[#F3E7D5] disabled:opacity-50"
          >
            {carregando ? "Atualizando..." : "Atualizar dados"}
          </button>
        </div>

        <Card className="mb-6 border-[#E5D6C4] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-[#6B1727]">
              Filtrar relatório
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                { valor: "hoje", texto: "Hoje" },
                { valor: "seteDias", texto: "7 dias" },
                { valor: "trintaDias", texto: "30 dias" },
                { valor: "mes", texto: "Por mês" },
                { valor: "personalizado", texto: "Personalizado" },
              ].map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => setPeriodo(opcao.valor as Periodo)}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    periodo === opcao.valor
                      ? "border-[#6B1727] bg-[#6B1727] text-white"
                      : "border-[#D8C6B2] bg-white text-[#6B1727] hover:bg-[#F3E7D5]"
                  }`}
                >
                  {opcao.texto}
                </button>
              ))}
            </div>

            {periodo === "mes" && (
              <div className="flex flex-col gap-2 sm:max-w-xs">
                <label htmlFor="mes" className="text-sm font-medium">
                  Selecione o mês
                </label>
                <input
                  id="mes"
                  type="month"
                  value={mesSelecionado}
                  onChange={(e) => setMesSelecionado(e.target.value)}
                  className="rounded-lg border border-[#D8C6B2] bg-white p-2"
                />
              </div>
            )}

            {periodo === "personalizado" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="dataInicio" className="text-sm font-medium">
                    Data inicial
                  </label>
                  <input
                    id="dataInicio"
                    type="date"
                    value={dataInicio}
                    max={dataFim}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="rounded-lg border border-[#D8C6B2] bg-white p-2"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="dataFim" className="text-sm font-medium">
                    Data final
                  </label>
                  <input
                    id="dataFim"
                    type="date"
                    value={dataFim}
                    min={dataInicio}
                    max={hoje}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="rounded-lg border border-[#D8C6B2] bg-white p-2"
                  />
                </div>
              </div>
            )}

            <p className="text-sm text-[#725D55]">
              Período selecionado:{" "}
              <span className="font-semibold capitalize">{tituloPeriodo}</span>
            </p>
          </CardContent>
        </Card>

        {erro && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {erro}
          </div>
        )}

        <div ref={relatorioRef} className="space-y-6 bg-[#FAF7F0] p-1">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-[#E5D6C4] bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#725D55]">
                  Valor dos pedidos válidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#6B1727]">
                  {carregando ? "..." : moeda(totalVendido)}
                </div>
                <p className="mt-1 text-xs text-[#88756B]">
                  Itens não cancelados
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#E5D6C4] bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#725D55]">
                  Comandas com pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#6B1727]">
                  {carregando ? "..." : totalComandas}
                </div>
                <p className="mt-1 text-xs text-[#88756B]">
                  Comandas distintas no período
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#E5D6C4] bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#725D55]">
                  Itens vendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#6B1727]">
                  {carregando ? "..." : totalItens}
                </div>
                <p className="mt-1 text-xs text-[#88756B]">
                  Quantidade não cancelada
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#E5D6C4] bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#725D55]">
                  Itens cancelados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#6B1727]">
                  {carregando ? "..." : totalCancelados}
                </div>
                <p className="mt-1 text-xs text-[#88756B]">
                  Quantidade cancelada no período
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#E5D6C4] bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#6B1727]">
                Situação dos pedidos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Badge className="bg-[#EADFCB] text-[#634B32] hover:bg-[#EADFCB]">
                Aguardando: {carregando ? "..." : totalAguardando}
              </Badge>
              <Badge className="bg-[#F4D7A1] text-[#76501A] hover:bg-[#F4D7A1]">
                Em preparo: {carregando ? "..." : totalEmPreparo}
              </Badge>
              <Badge className="bg-[#D9E8CF] text-[#35572E] hover:bg-[#D9E8CF]">
                Prontos: {carregando ? "..." : totalProntos}
              </Badge>
              <Badge className="bg-[#D8E5F5] text-[#2F4E75] hover:bg-[#D8E5F5]">
                Entregues: {carregando ? "..." : totalEntregues}
              </Badge>
              <Badge className="bg-[#F3D7D7] text-[#8A2A2A] hover:bg-[#F3D7D7]">
                Cancelados: {carregando ? "..." : itensCancelados.length}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-[#E5D6C4] bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#6B1727]">
                Vendas por dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dadosGrafico.length === 0 ? (
                <p className="py-12 text-center text-sm text-[#88756B]">
                  {carregando
                    ? "Carregando dados..."
                    : "Não há pedidos registrados neste período."}
                </p>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGrafico}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5D6C4" />
                      <XAxis dataKey="data" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(valor: number) =>
                          valor.toLocaleString("pt-BR")
                        }
                      />
                      <Tooltip
                        formatter={(valor) => moeda(Number(valor))}
                        labelStyle={{ color: "#3B2525" }}
                      />
                      <Bar
                        dataKey="vendas"
                        name="Vendas"
                        fill="#6B1727"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#E5D6C4] bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#6B1727]">
                Produtos mais vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#E5D6C4]">
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Valor total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosAgrupados.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="h-24 text-center text-[#88756B]"
                      >
                        {carregando
                          ? "Carregando..."
                          : "Nenhum produto encontrado no período."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    produtosAgrupados.map((produto) => (
                      <TableRow
                        key={produto.nome}
                        className="border-[#F0E6DA]"
                      >
                        <TableCell className="font-medium">
                          {produto.nome}
                        </TableCell>
                        <TableCell className="text-right">
                          {produto.quantidade}
                        </TableCell>
                        <TableCell className="text-right">
                          {moeda(produto.total)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-[#E5D6C4] bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-[#6B1727]">
                Resumo do relatório
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[#5F4A42]">
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
              <p className="text-xs text-[#88756B]">
                O valor total é calculado pela quantidade multiplicada pelo
                preço unitário dos itens não cancelados. Não representa
                necessariamente pagamentos recebidos.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-center gap-3 pb-6">
            <button
              type="button"
              onClick={exportarCSV}
              disabled={carregando}
              className="rounded-lg border border-[#6B1727] bg-white px-4 py-2 text-sm font-semibold text-[#6B1727] hover:bg-[#F3E7D5] disabled:opacity-50"
            >
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={() => void exportarPDF()}
              disabled={carregando}
              className="rounded-lg bg-[#6B1727] px-4 py-2 text-sm font-semibold text-white hover:bg-[#50111D] disabled:opacity-50"
            >
              Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
