import { Type }                                         from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { SituacaoReserva }                              from '../../generated/prisma/enums.js';

export class ListarReservasQueryDto
{
  @IsOptional()
  @IsEnum(SituacaoReserva)
  id_situacao?: SituacaoReserva;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_mesa?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_usuario?: number;

  @IsOptional()
  @IsDateString()
  dt_de?: string;

  @IsOptional()
  @IsDateString()
  dt_ate?: string;
}
