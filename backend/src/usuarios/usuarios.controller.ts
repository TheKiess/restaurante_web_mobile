import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { Public } from '../auth/public.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import type { RequisicaoAutenticada } from '../auth/auth.types.js';
import { Perfil } from '../generated/prisma/enums.js';

@Controller('usuarios')
@Roles(Perfil.GERENCIA)
export class UsuariosController
{
  constructor(private readonly usuariosService: UsuariosService) {}

  @Public()
  @Post()
  criarUsuario(@Body() createUsuarioDto: CreateUsuarioDto, @Req() request: RequisicaoAutenticada)
  {
    const ehGerencia = request.usuario?.perfil === Perfil.GERENCIA;

    if (createUsuarioDto.perfil && createUsuarioDto.perfil !== Perfil.CLIENTE && !ehGerencia)
      throw new ForbiddenException('Somente a gerência pode criar usuários com este perfil!');

    return this.usuariosService.criarUsuario(createUsuarioDto);
  }

  @Get()
  listarUsuarios()
  {
    return this.usuariosService.listarUsuarios();
  }

  @Get(':id')
  buscarUsuarioPorId(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.usuariosService.buscarUsuarioPorId(nrId);
  }

  @Patch(':id')
  atualizarUsuario(@Param('id', ParseIntPipe) nrId: number, @Body() updateUsuarioDto: UpdateUsuarioDto)
  {
    return this.usuariosService.atualizarUsuario(nrId, updateUsuarioDto);
  }
}