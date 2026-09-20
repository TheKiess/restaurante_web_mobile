import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';

@Controller('usuarios')
export class UsuariosController
{
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  criarUsuario(@Body() createUsuarioDto: CreateUsuarioDto)
  {
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