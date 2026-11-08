import { Transform }                     from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Perfil }                        from '../../generated/prisma/enums.js';

export class ListarUsuariosQueryDto
{
  @IsOptional()
  @IsEnum(Perfil)
  perfil?: Perfil;

  // funcionarios = true traz só gerência, garçom e cozinha
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  funcionarios?: boolean;
}
