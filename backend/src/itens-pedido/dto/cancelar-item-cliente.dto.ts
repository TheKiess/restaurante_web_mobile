import { IsInt, Min } from 'class-validator';

export class CancelarItemClienteDto
{
  @IsInt()
  @Min(1)
  id_comanda: number;
}
