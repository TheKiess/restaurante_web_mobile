export function formatarMoeda(valor: number | string | null | undefined): string
{
  const vlNumero = Number(valor);

  if (valor === null || valor === undefined || Number.isNaN(vlNumero))
    return "—";

  return vlNumero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarDataHora(dsData: string | null | undefined): string
{
  if (!dsData)
    return "—";

  const data = new Date(dsData);

  if (Number.isNaN(data.getTime()))
    return "—";

  return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
