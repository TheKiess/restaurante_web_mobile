import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateComandaDto
{
  @IsOptional()
  @IsInt()
  @Min(1)
  id_mesa?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_cliente?: number;
}
