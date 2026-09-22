import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateItensPedidoDto
{
  @IsInt()
  @Min(1)
  id_comanda: number;

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