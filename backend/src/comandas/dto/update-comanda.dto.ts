import { IsInt, Min } from 'class-validator';

export class UpdateComandaDto
{
  @IsInt()
  @Min(1)
  id_mesa: number;
}
