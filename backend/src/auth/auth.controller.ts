import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle }                                                          from '@nestjs/throttler';
import { AuthService }                                                       from './auth.service.js';
import { Public }                                                            from './public.decorator.js';
import { LimiteTentativasGuard }                                             from './limite-tentativas.guard.js';
import { LoginDto }                                                          from './dto/login.dto.js';
import type { RequisicaoAutenticada }                                        from './auth.types.js';

@Controller('auth')
export class AuthController
{
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LimiteTentativasGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  entrar(@Body() loginDto: LoginDto)
  {
    return this.authService.entrar(loginDto);
  }

  @Get('me')
  buscarUsuarioLogado(@Req() request: RequisicaoAutenticada)
  {
    return this.authService.buscarUsuarioLogado(request.usuario.sub);
  }
}
