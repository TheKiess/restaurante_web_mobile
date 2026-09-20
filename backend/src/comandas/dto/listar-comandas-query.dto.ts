import { IsEnum, IsOptional } from 'class-validator';
import { SituacaoComanda } from '../../generated/prisma/enums.js';

export class ListarComandasQueryDto
{
  @IsOptional()
  @IsEnum(SituacaoComanda)
  id_situacao?: SituacaoComanda;
}
