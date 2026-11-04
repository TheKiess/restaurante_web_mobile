import { IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { UnidadeMedida } from '../../generated/prisma/enums.js';

export class CreateInsumoDto
{
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nm_insumo: string;

  @IsEnum(UnidadeMedida)
  unidade_medida: UnidadeMedida;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(9999999)
  qt_estoque_minimo?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(9999999)
  qt_estoque_inicial?: number;
}
