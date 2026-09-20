import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TipoItem } from '../../generated/prisma/enums.js';

export class CreateItensCardapioDto
{
  @IsInt()
  @Min(1)
  id_categoria: number;

  @IsString()
  @IsNotEmpty()
  nm_item: string;

  @IsOptional()
  @IsString()
  ds_item?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  vl_unitario: number;

  @IsEnum(TipoItem)
  tipo_item: TipoItem;

  @IsOptional()
  @IsBoolean()
  disponivel?: boolean;
}