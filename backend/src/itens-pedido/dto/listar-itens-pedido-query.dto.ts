import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { SituacaoItemPedido } from '../../generated/prisma/enums.js';

export class ListarItensPedidoQueryDto
{
  @IsOptional()
  @IsEnum(SituacaoItemPedido)
  id_situacao?: SituacaoItemPedido;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_comanda?: number;
}