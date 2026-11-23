import { Injectable }     from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Conta as tentativas pelo login informado e, sem login no corpo, pelo IP,
 * pelo site, todas as requisições chegam ao backend com o IP do servidor Next,
 * então só o IP bloquearia todo mundo junto.
 */
@Injectable()
export class LimiteTentativasGuard extends ThrottlerGuard
{
  protected override async getTracker(req: Record<string, unknown>): Promise<string>
  {
    const objCorpo = req.body as { ds_login?: unknown } | undefined;
    const dsLogin  = typeof objCorpo?.ds_login === 'string' ? objCorpo.ds_login.trim().toLowerCase() : '';

    return dsLogin ? `login:${dsLogin}` : String(req.ip ?? 'sem-ip');
  }
}
