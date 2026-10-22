import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService }                        from '@nestjs/jwt';
import { PrismaService }                     from '../prisma/prisma.service.js';
import { CryptService }                      from '../crypt/crypt.service.js';
import type { Perfil }                       from '../generated/prisma/enums.js';
import { LoginDto }                          from './dto/login.dto.js';
import type { PayloadToken }                 from './auth.types.js';

const MSG_LOGIN_INVALIDO = 'Apelido, e-mail ou senha inválidos!';

interface UsuarioComPessoa
{
  id_usuario: number;
  ds_apelido: string;
  perfil: Perfil;
  pessoa: { nm_pessoa: string };
}

@Injectable()
export class AuthService
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptService: CryptService,
    private readonly jwtService: JwtService,
  ) {}

  async entrar(loginDto: LoginDto)
  {
    const dsLogin = loginDto.ds_login.trim();
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { ds_apelido: dsLogin },
          { pessoa: { ds_email: { equals: dsLogin, mode: 'insensitive' } } },
        ],
      },
      include: { pessoa: true },
    });

    if (!usuario)
      throw new UnauthorizedException(MSG_LOGIN_INVALIDO);

    if (!await this.cryptService.compararSenha(loginDto.ds_senha, usuario.ds_senha))
      throw new UnauthorizedException(MSG_LOGIN_INVALIDO);

    const payload: PayloadToken = {
      sub: usuario.id_usuario,
      ds_apelido: usuario.ds_apelido,
      perfil: usuario.perfil,
    };

    return {
      ds_token: await this.jwtService.signAsync(payload),
      usuario: this.montarUsuarioLogado(usuario),
    };
  }

  async buscarUsuarioLogado(nrId: number)
  {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: nrId },
      include: { pessoa: true },
    });

    if (!usuario)
      throw new UnauthorizedException('Usuário não encontrado!');

    return this.montarUsuarioLogado(usuario);
  }

  private montarUsuarioLogado(usuario: UsuarioComPessoa)
  {
    return {
      id_usuario: usuario.id_usuario,
      ds_apelido: usuario.ds_apelido,
      nm_pessoa: usuario.pessoa.nm_pessoa,
      perfil: usuario.perfil,
    };
  }
}
