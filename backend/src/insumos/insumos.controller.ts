import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { InsumosService }                                                                        from './insumos.service.js';
import { CreateInsumoDto }                                                                       from './dto/create-insumo.dto.js';
import { UpdateInsumoDto }                                                                       from './dto/update-insumo.dto.js';
import { Roles }                                                                                 from '../auth/roles.decorator.js';
import { Perfil }                                                                                from '../generated/prisma/enums.js';

@Controller('insumos')
@Roles(Perfil.GERENCIA)
export class InsumosController
{
  constructor(private readonly insumosService: InsumosService) {}

  @Post()
  criarInsumo(@Body() createInsumoDto: CreateInsumoDto)
  {
    return this.insumosService.criarInsumo(createInsumoDto);
  }

  @Roles(Perfil.GERENCIA, Perfil.COZINHA)
  @Get()
  listarInsumos()
  {
    return this.insumosService.listarInsumos();
  }

  @Roles(Perfil.GERENCIA, Perfil.COZINHA)
  @Get('estoque-baixo')
  listarInsumosComEstoqueBaixo()
  {
    return this.insumosService.listarInsumosComEstoqueBaixo();
  }

  @Roles(Perfil.GERENCIA, Perfil.COZINHA)
  @Get(':id')
  buscarInsumoPorId(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.insumosService.buscarInsumoPorId(nrId);
  }

  @Patch(':id')
  atualizarInsumo(@Param('id', ParseIntPipe) nrId: number, @Body() updateInsumoDto: UpdateInsumoDto)
  {
    return this.insumosService.atualizarInsumo(nrId, updateInsumoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerInsumo(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.insumosService.removerInsumo(nrId);
  }
}
