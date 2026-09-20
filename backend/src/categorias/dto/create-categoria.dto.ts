import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCategoriaDto
{
  @IsString()
  @IsNotEmpty()
  nm_categoria: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_categoria_pai?: number;
}
