
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ItemPedidoRetiradaDto {
  @IsInt()
  @Min(1)
  id_item_cardapio: number;

  @IsInt()
  @Min(1)
  @Max(99)
  qt_quantidade: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  ds_observacao?: string;
}

export class CreatePedidoRetiradaDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoRetiradaDto)
  itens: ItemPedidoRetiradaDto[];
}
