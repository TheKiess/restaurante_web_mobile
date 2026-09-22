import { IsInt, Min } from 'class-validator';

export class CreateMesaDto
{
  @IsInt()
  @Min(1)
  nr_mesa: number;

  @IsInt()
  @Min(1)
  qt_lugares: number;
}
