import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector }                                                        from '@nestjs/core';
import { JwtService }                                                       from '@nestjs/jwt';
import { IS_PUBLIC_KEY }                                                    from './public.decorator.js';
import { PrismaService }                                                    from '../prisma/prisma.service.js';
import type { PayloadToken, RequisicaoAutenticada }                         from './auth.types.js';

@Injectable()
export class JwtAuthGuard implements CanActivate
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean>
  {
    const rotaPublica = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<RequisicaoAutenticada>();
    const dsToken = this.extrairToken(request);

    if (!dsToken && rotaPublica)
      return true;

    if (!dsToken)
      throw new UnauthorizedException('Token não informado!');

    let payload: PayloadToken;

    try
    {
      payload = await this.jwtService.verifyAsync<PayloadToken>(dsToken);
    }
    catch
    {
      if (rotaPublica)
        return true;

      throw new UnauthorizedException('Token inválido ou expirado!');
    }

    // O token pode ser antigo: vale o que está no banco agora (usuário ainda ativo e perfil atual).
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: payload.sub },
      select: { id_ativo: true, perfil: true },
    });

    if (!usuario?.id_ativo)
    {
      if (rotaPublica)
        return true;

      throw new UnauthorizedException('Usuário inativo ou removido!');
    }

    request.usuario = { ...payload, perfil: usuario.perfil };

    return true;
  }

  private extrairToken(request: RequisicaoAutenticada): string | undefined
  {
    const [dsTipo, dsToken] = request.headers.authorization?.split(' ') ?? [];

    return dsTipo === 'Bearer' ? dsToken : undefined;
  }
}
