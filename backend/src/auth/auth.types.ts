import type { Request } from 'express';
import type { Perfil } from '../generated/prisma/enums.js';

export interface PayloadToken
{
  sub: number;
  ds_apelido: string;
  perfil: Perfil;
}

export interface RequisicaoAutenticada extends Request
{
  usuario: PayloadToken;
}
