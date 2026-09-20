import { IsIn } from 'class-validator';
import { SituacaoPagamento } from '../../generated/prisma/enums.js';

export class AlterarSituacaoPagamentoDto
{
  @IsIn([SituacaoPagamento.CONFIRMADO, SituacaoPagamento.RECUSADO])
  id_situacao: SituacaoPagamento;
}