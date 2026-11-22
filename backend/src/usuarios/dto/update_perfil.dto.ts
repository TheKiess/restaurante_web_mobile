
import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUsuarioDto }      from './create-usuario.dto.js';

export class UpdateMeuPerfilDto extends PartialType(
  PickType(CreateUsuarioDto, [
    'nm_pessoa',
    'ds_cnpj_cpf',
    'ds_email',
    'ds_telefone',
    'ds_apelido',
    'ds_senha'
  ] as const)
) {}
