import { BadRequestException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class CryptService
{
  async gerarHashSenha(dsSenha: string): Promise<string>
  {
    if (!dsSenha)
      throw new BadRequestException('A senha não pode ser vazia');

    return bcrypt.hash(dsSenha, SALT_ROUNDS);
  }

  async compararSenha(dsSenha: string, dsHash: string): Promise<boolean>
  {
    if (!dsSenha || !dsHash)
      return false;

    return bcrypt.compare(dsSenha, dsHash);
  }
}