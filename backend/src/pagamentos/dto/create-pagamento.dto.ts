import { IsEnum, IsInt, IsNumber, Min } from 'class-validator';
import { FormaPagamento } from '../../generated/prisma/enums.js';

export class CreatePagamentoDto
{
  @IsInt()
  @Min(1)
  id_comanda: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  vl_pago: number;

  @IsEnum(FormaPagamento)
  forma_pagamento: FormaPagamento;
}