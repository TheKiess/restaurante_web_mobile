import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector }                                                        from '@nestjs/core';
import { JwtService }                                                       from '@nestjs/jwt';
import { IS_PUBLIC_KEY }                                                    from './public.decorator.js';
import type { PayloadToken, RequisicaoAutenticada }                         from './auth.types.js';

@Injectable()
export class JwtAuthGuard implements CanActivate
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
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

    try
    {
      request.usuario = await this.jwtService.verifyAsync<PayloadToken>(dsToken);
    }
    catch
    {
      if (rotaPublica)
        return true;

      throw new UnauthorizedException('Token inválido ou expirado!');
    }

    return true;
  }

  private extrairToken(request: RequisicaoAutenticada): string | undefined
  {
    const [dsTipo, dsToken] = request.headers.authorization?.split(' ') ?? [];

    return dsTipo === 'Bearer' ? dsToken : undefined;
  }
}
