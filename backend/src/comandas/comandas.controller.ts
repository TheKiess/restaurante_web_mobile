import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ComandasService }                                                     from './comandas.service.js';
import { CreateComandaDto }                                                    from './dto/create-comanda.dto.js';
import { UpdateComandaDto }                                                    from './dto/update-comanda.dto.js';
import { VincularClienteDto }                                                  from './dto/vincular-cliente.dto.js';
import { ListarComandasQueryDto }                                              from './dto/listar-comandas-query.dto.js';
import { Roles }                                                               from '../auth/roles.decorator.js';
import type { RequisicaoAutenticada }                                          from '../auth/auth.types.js';
import { Perfil }                                                              from '../generated/prisma/enums.js';

@Controller('comandas')
@Roles(Perfil.GERENCIA, Perfil.GARCOM)
export class ComandasController
{
  constructor(private readonly comandasService: ComandasService) {}

  @Post()
  abrirComanda(@Body() createComandaDto: CreateComandaDto, @Req() request: RequisicaoAutenticada)
  {
    return this.comandasService.abrirComanda(createComandaDto, request.usuario.sub);
  }

  @Get()
  listarComandas(@Query() listarComandasQueryDto: ListarComandasQueryDto)
  {
    return this.comandasService.listarComandas(listarComandasQueryDto);
  }

  @Roles(Perfil.CLIENTE)
  @Get('minhas')
  listarMinhasComandas(@Query() listarComandasQueryDto: ListarComandasQueryDto, @Req() request: RequisicaoAutenticada)
  {
    return this.comandasService.listarMinhasComandas(request.usuario.sub, listarComandasQueryDto);
  }

  @Roles(Perfil.CLIENTE)
  @Get('minhas/:id')
  buscarMinhaComanda(@Param('id', ParseIntPipe) nrId: number, @Req() request: RequisicaoAutenticada)
  {
    return this.comandasService.buscarMinhaComanda(nrId, request.usuario.sub);
  }

  @Get(':id')
  buscarComandaPorId(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.comandasService.buscarComandaPorId(nrId);
  }

  @Patch(':id')
  atualizarComanda(@Param('id', ParseIntPipe) nrId: number, @Body() updateComandaDto: UpdateComandaDto)
  {
    return this.comandasService.atualizarComanda(nrId, updateComandaDto);
  }

  @Patch(':id/cliente')
  vincularCliente(@Param('id', ParseIntPipe) nrId: number, @Body() vincularClienteDto: VincularClienteDto)
  {
    return this.comandasService.vincularCliente(nrId, vincularClienteDto);
  }

  @Patch(':id/fechar')
  fecharComanda(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.comandasService.fecharComanda(nrId);
  }

  @Patch(':id/cancelar')
  cancelarComanda(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.comandasService.cancelarComanda(nrId);
  }
}
