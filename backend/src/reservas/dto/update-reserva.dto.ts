import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateReservaDto
{
  @IsOptional()
  @IsInt()
  @Min(1)
  id_mesa?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  qt_pessoas?: number;

  @IsOptional()
  @IsDateString()
  dt_reserva?: string;
}
