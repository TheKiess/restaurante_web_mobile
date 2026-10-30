import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector }                                                     from '@nestjs/core';
import type { Perfil }                                                   from '../generated/prisma/enums.js';
import { IS_PUBLIC_KEY }                                                 from './public.decorator.js';
import { ROLES_KEY }                                                     from './roles.decorator.js';
import type { RequisicaoAutenticada }                                    from './auth.types.js';

@Injectable()
export class RolesGuard implements CanActivate
{
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean
  {
    const alvos = [context.getHandler(), context.getClass()];

    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, alvos))
      return true;

    const arrPerfis = this.reflector.getAllAndOverride<Perfil[] | undefined>(ROLES_KEY, alvos);

    if (!arrPerfis || arrPerfis.length === 0)
      return true;

    const request = context.switchToHttp().getRequest<RequisicaoAutenticada>();

    if (!arrPerfis.includes(request.usuario?.perfil))
      throw new ForbiddenException('Você não tem permissão para acessar este recurso!');

    return true;
  }
}
