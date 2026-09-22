import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateItensPedidoDto } from './create-itens-pedido.dto.js';

export class UpdateItensPedidoDto extends PartialType(PickType(CreateItensPedidoDto, ['qt_quantidade', 'ds_observacao'] as const)) {}