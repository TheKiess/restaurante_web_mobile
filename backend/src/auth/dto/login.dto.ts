import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto
{
  @IsString()
  @IsNotEmpty()
  ds_login: string;

  @IsString()
  @IsNotEmpty()
  ds_senha: string;
}
