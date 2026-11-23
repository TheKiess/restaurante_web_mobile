import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Throttle }                                                                                           from '@nestjs/throttler';
import { UsuariosService }                                                                                    from './usuarios.service.js';
import { CreateUsuarioDto }                                                                                   from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto }                                                                                   from './dto/update-usuario.dto.js';
import { UpdateMeuPerfilDto }                                                                                 from './dto/update_perfil.dto.js';
import { BuscarClientesQueryDto }                                                                             from './dto/buscar-clientes-query.dto.js';
import { ListarUsuariosQueryDto }                                                                             from './dto/listar-usuarios-query.dto.js';
import { Public }                                                                                             from '../auth/public.decorator.js';
import { Roles }                                                                                              from '../auth/roles.decorator.js';
import { LimiteTentativasGuard }                                                                              from '../auth/limite-tentativas.guard.js';
import type { RequisicaoAutenticada }                                                                         from '../auth/auth.types.js';
import { Perfil }                                                                                             from '../generated/prisma/enums.js';

@Controller('usuarios')
@Roles(Perfil.GERENCIA)
export class UsuariosController
{
  constructor(private readonly usuariosService: UsuariosService) {}

  @Public()
  @Post()
  @UseGuards(LimiteTentativasGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  criarUsuario(@Body() createUsuarioDto: CreateUsuarioDto, @Req() request: RequisicaoAutenticada)
  {
    if (createUsuarioDto.perfil && createUsuarioDto.perfil !== Perfil.CLIENTE && !(request.usuario?.perfil === Perfil.GERENCIA))
      throw new ForbiddenException('Somente a gerência pode criar usuários com este perfil!');

    return this.usuariosService.criarUsuario(createUsuarioDto);
  }

  @Get()
  listarUsuarios(@Query() listarUsuariosQueryDto: ListarUsuariosQueryDto)
  {
    return this.usuariosService.listarUsuarios(listarUsuariosQueryDto);
  }

  @Roles(Perfil.GERENCIA, Perfil.GARCOM)
  @Get('clientes')
  buscarClientes(@Query() buscarClientesQueryDto: BuscarClientesQueryDto)
  {
    return this.usuariosService.buscarClientes(buscarClientesQueryDto.busca);
  }

  @Roles(Perfil.CLIENTE)
  @Get('me')
  buscarMeuPerfil(@Req() request: RequisicaoAutenticada)
  {
    return this.usuariosService.buscarUsuarioPorId(
      request.usuario.sub
    );
  }


  @Get(':id')
  buscarUsuarioPorId(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.usuariosService.buscarUsuarioPorId(nrId);
  }

  @Roles(Perfil.CLIENTE)
  @Patch('me')
  atualizarMeuPerfil(
    @Body() updateMeuPerfilDto: UpdateMeuPerfilDto,
    @Req() request: RequisicaoAutenticada
  )
  {
    return this.usuariosService.atualizarUsuario(
      request.usuario.sub,
      updateMeuPerfilDto,
      request.usuario.sub
    );
  }

  @Patch(':id')
  atualizarUsuario(
    @Param('id', ParseIntPipe) nrId: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @Req() request: RequisicaoAutenticada
  )
  {
    return this.usuariosService.atualizarUsuario(nrId, updateUsuarioDto, request.usuario.sub);
  }
}