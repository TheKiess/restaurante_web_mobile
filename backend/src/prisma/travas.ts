import { Prisma } from '../generated/prisma/client.js';

/**
 * Travas de linha do Postgres (SELECT ... FOR UPDATE).
 * Quem pedir a trava depois espera a transação anterior terminar, então as
 * conferências feitas depois da trava já enxergam o que a outra pessoa gravou.
 * Regra de uso: travar a comanda antes da mesa, sempre dentro de uma transação.
 */
export async function travarComanda(transacao: Prisma.TransactionClient, nrIdComanda: number): Promise<void>
{
  await transacao.$queryRaw`SELECT "id_comanda" FROM "Comanda" WHERE "id_comanda" = ${nrIdComanda} FOR UPDATE`;
}

export async function travarMesa(transacao: Prisma.TransactionClient, nrIdMesa: number): Promise<void>
{
  await transacao.$queryRaw`SELECT "id_mesa" FROM "Mesa" WHERE "id_mesa" = ${nrIdMesa} FOR UPDATE`;
}
