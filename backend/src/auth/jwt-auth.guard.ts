import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { PayloadToken, RequisicaoAutenticada } from './auth.types.js';

@Injectable()
export class JwtAuthGuard implements CanActivate
{
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean>
  {
    const request = context.switchToHttp().getRequest<RequisicaoAutenticada>();
    const dsToken = this.extrairToken(request);

    if (!dsToken)
      throw new UnauthorizedException('Token não informado!');

    try
    {
      request.usuario = await this.jwtService.verifyAsync<PayloadToken>(dsToken);
    }
    catch
    {
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
