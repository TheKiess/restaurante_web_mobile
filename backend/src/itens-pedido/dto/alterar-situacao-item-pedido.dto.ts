import { IsEnum } from 'class-validator';
import { SituacaoItemPedido } from '../../generated/prisma/enums.js';

export class AlterarSituacaoItemPedidoDto
{
  @IsEnum(SituacaoItemPedido)
  id_situacao: SituacaoItemPedido;
}