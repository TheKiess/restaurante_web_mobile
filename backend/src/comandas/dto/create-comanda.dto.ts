import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateComandaDto
{
  @IsInt()
  @Min(1)
  id_usuario: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_mesa?: number;
}
