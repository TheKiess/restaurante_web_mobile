
import { apiGet } from "@/lib/api";

export type IndicadoresVendas = {
  faturamento: number;
  pedidos: number;
  ticketMedio: number;
  pedidosCancelados: number;
};

export type PeriodoRelatorio = "hoje" | "seteDias" | "trintaDias";

export async function buscarIndicadores(
  periodo: PeriodoRelatorio
): Promise<IndicadoresVendas> {
  return apiGet<IndicadoresVendas>(
    `relatorios/indicadores?periodo=${encodeURIComponent(periodo)}`
  );
}
