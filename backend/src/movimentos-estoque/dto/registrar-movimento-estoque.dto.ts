import { IsIn, IsInt, IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { TipoMovimento }                                                                from '../../generated/prisma/enums.js';

// A saída de estoque (consumo) é automática, feita quando o pedido é preparado.
export const ARR_TIPOS_MOVIMENTO_MANUAL = [TipoMovimento.ENTRADA, TipoMovimento.PERDA];

export class RegistrarMovimentoEstoqueDto
{
  @IsInt()
  @Min(1)
  id_insumo: number;

  @IsIn(ARR_TIPOS_MOVIMENTO_MANUAL)
  tipo_movimento: TipoMovimento;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(9999999)
  qt_movimento: number;

  @ValidateIf((dto: RegistrarMovimentoEstoqueDto) => dto.tipo_movimento === TipoMovimento.PERDA || dto.ds_motivo !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  ds_motivo?: string;
}
