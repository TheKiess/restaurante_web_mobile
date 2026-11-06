import { Type }                                         from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { TipoMovimento }                                from '../../generated/prisma/enums.js';

export class ListarMovimentosEstoqueQueryDto
{
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_insumo?: number;

  @IsOptional()
  @IsEnum(TipoMovimento)
  tipo_movimento?: TipoMovimento;

  @IsOptional()
  @IsDateString()
  dt_de?: string;

  @IsOptional()
  @IsDateString()
  dt_ate?: string;
}
