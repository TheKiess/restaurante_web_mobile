import { SetMetadata } from '@nestjs/common';
import { Perfil }      from '../generated/prisma/enums.js';

export const ROLES_KEY                 = 'perfis';
export const TODOS_OS_PERFIS: Perfil[] = Object.values(Perfil);
export const Roles                     = (...arrPerfis: Perfil[]) => SetMetadata(ROLES_KEY, arrPerfis);
