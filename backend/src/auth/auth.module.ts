import { Module }         from '@nestjs/common';
import { ConfigService }  from '@nestjs/config';
import { JwtModule }      from '@nestjs/jwt';
import { PrismaModule }   from '../prisma/prisma.module.js';
import { CryptModule }    from '../crypt/crypt.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService }    from './auth.service.js';
import { JwtAuthGuard }   from './jwt-auth.guard.js';

@Module({
  imports: [
    PrismaModule,
    CryptModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') ?? '8h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})

export class AuthModule {}
