import { Prisma } from '../generated/prisma/client.js';

// Travas de linha do Postgres (SELECT ... FOR UPDATE).
// Quem pedir a trava depois espera a transação anterior terminar, então as
// conferências feitas depois da trava já enxergam o que a outra pessoa gravou.
// Regra de uso, sempre dentro de uma transação: travar a comanda antes da mesa e, se for
// mexer no estoque, os insumos por último e em ordem crescente de id (evita deadlock).

export async function travarComanda(transacao: Prisma.TransactionClient, nrIdComanda: number): Promise<void>
{
  await transacao.$queryRaw`
    SELECT "id_comanda"
      FROM "Comanda"
     WHERE "id_comanda" = ${nrIdComanda} FOR UPDATE`;
}

export async function travarMesa(transacao: Prisma.TransactionClient, nrIdMesa: number): Promise<void>
{
  await transacao.$queryRaw`
    SELECT "id_mesa"
      FROM "Mesa"
     WHERE "id_mesa" = ${nrIdMesa} FOR UPDATE`;
}

export async function travarInsumos(transacao: Prisma.TransactionClient, arrIdsInsumo: number[]): Promise<void>
{
  if (arrIdsInsumo.length === 0)
    return;

  await transacao.$queryRaw`
    SELECT "id_insumo"
      FROM "Insumo"
     WHERE "id_insumo" IN (${Prisma.join(arrIdsInsumo)})
     ORDER BY "id_insumo" FOR UPDATE`;
}

// Trava todos os gerentes ativos, para duas pessoas não tirarem o acesso uma da outra ao mesmo tempo.
export async function travarGerentesAtivos(transacao: Prisma.TransactionClient): Promise<void>
{
  await transacao.$queryRaw`
    SELECT "id_usuario"
      FROM "Usuario"
     WHERE "perfil" = 'GERENCIA' AND "id_ativo" = true
     ORDER BY "id_usuario" FOR UPDATE`;
}
