import { Transform }           from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class BuscarClientesQueryDto
{
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  busca: string;
}
