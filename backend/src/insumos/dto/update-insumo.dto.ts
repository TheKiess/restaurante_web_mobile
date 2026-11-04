import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateInsumoDto }       from './create-insumo.dto.js';

// A unidade e a quantidade em estoque não mudam por aqui: o estoque só muda por movimento.
export class UpdateInsumoDto extends PartialType(OmitType(CreateInsumoDto, ['unidade_medida', 'qt_estoque_inicial'] as const)) {}
