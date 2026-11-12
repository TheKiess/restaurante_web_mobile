import { Type }                                                             from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsNumber, Max, Min, ValidateNested } from 'class-validator';

export class IngredienteReceitaDto
{
  @IsInt()
  @Min(1)
  id_insumo: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(9999999)
  qt_insumo: number;
}

export class DefinirReceitaDto
{
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => IngredienteReceitaDto)
  ingredientes: IngredienteReceitaDto[];
}
