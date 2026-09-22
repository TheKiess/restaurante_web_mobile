import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { SituacaoPagamento } from '../../generated/prisma/enums.js';

export class ListarPagamentosQueryDto
{
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_comanda?: number;

  @IsOptional()
  @IsEnum(SituacaoPagamento)
  id_situacao?: SituacaoPagamento;
}