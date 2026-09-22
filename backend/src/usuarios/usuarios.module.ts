import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { UsuariosController } from './usuarios.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CryptModule } from '../crypt/crypt.module.js';

@Module({
  imports: [PrismaModule, CryptModule],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})

export class UsuariosModule {}