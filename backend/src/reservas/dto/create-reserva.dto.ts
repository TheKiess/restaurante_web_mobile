import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreateReservaDto
{
  @IsOptional()
  @IsInt()
  @Min(1)
  id_usuario?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_mesa?: number;

  @IsInt()
  @Min(1)
  @Max(50)
  qt_pessoas: number;

  @IsDateString()
  dt_reserva: string;
}
