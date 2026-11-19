import { IsInt, Min, ValidateIf } from 'class-validator';

export class VincularClienteDto
{
  // null remove o cliente da comanda
  @ValidateIf((dto: VincularClienteDto) => dto.id_cliente !== null)
  @IsInt()
  @Min(1)
  id_cliente: number | null;
}
