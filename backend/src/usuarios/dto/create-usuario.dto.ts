import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { Perfil } from '../../generated/prisma/enums.js';

export class CreateUsuarioDto
{
  @IsString()
  @IsNotEmpty()
  nm_pessoa: string;

  @IsOptional()
  @Matches(/^(\d{11}|\d{14})$/, { message: 'ds_cnpj_cpf deve ter 11 ou 14 dígitos numéricos' })
  ds_cnpj_cpf?: string;

  @IsOptional()
  @IsEmail()
  ds_email?: string;

  @IsOptional()
  @IsString()
  ds_telefone?: string;

  @IsString()
  @MinLength(3)
  ds_apelido: string;

  @IsString()
  @MinLength(6)
  ds_senha: string;

  @IsOptional()
  @IsEnum(Perfil)
  perfil?: Perfil;
}
