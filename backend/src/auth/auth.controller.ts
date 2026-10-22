import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService }                                                       from './auth.service.js';
import { JwtAuthGuard }                                                      from './jwt-auth.guard.js';
import { LoginDto }                                                          from './dto/login.dto.js';
import type { RequisicaoAutenticada }                                        from './auth.types.js';

@Controller('auth')
export class AuthController
{
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  entrar(@Body() loginDto: LoginDto)
  {
    return this.authService.entrar(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  buscarUsuarioLogado(@Req() request: RequisicaoAutenticada)
  {
    return this.authService.buscarUsuarioLogado(request.usuario.sub);
  }
}
