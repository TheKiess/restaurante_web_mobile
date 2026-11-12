import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { UsuariosService }                                                                         from './usuarios.service.js';
import { CreateUsuarioDto }                                                                        from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto }                                                                        from './dto/update-usuario.dto.js';
import { ListarUsuariosQueryDto }                                                                  from './dto/listar-usuarios-query.dto.js';
import { Public }                                                                                  from '../auth/public.decorator.js';
import { Roles }                                                                                   from '../auth/roles.decorator.js';
import type { RequisicaoAutenticada }                                                              from '../auth/auth.types.js';
import { Perfil }                                                                                  from '../generated/prisma/enums.js';

@Controller('usuarios')
@Roles(Perfil.GERENCIA)
export class UsuariosController
{
  constructor(private readonly usuariosService: UsuariosService) {}

  @Public()
  @Post()
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

  @Get(':id')
  buscarUsuarioPorId(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.usuariosService.buscarUsuarioPorId(nrId);
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