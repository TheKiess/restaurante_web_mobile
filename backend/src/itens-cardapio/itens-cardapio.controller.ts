import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ItensCardapioService }                                                                  from './itens-cardapio.service.js';
import { CreateItensCardapioDto }                                                                from './dto/create-itens-cardapio.dto.js';
import { UpdateItensCardapioDto }                                                                from './dto/update-itens-cardapio.dto.js';
import { Roles, TODOS_OS_PERFIS }                                                                from '../auth/roles.decorator.js';
import { Perfil }                                                                                from '../generated/prisma/enums.js';

@Controller('itens-cardapio')
@Roles(Perfil.GERENCIA)
export class ItensCardapioController
{
  constructor(private readonly itensCardapioService: ItensCardapioService) {}

  @Post()
  criarItemCardapio(@Body() createItensCardapioDto: CreateItensCardapioDto)
  {
    return this.itensCardapioService.criarItemCardapio(createItensCardapioDto);
  }

  @Roles(...TODOS_OS_PERFIS)
  @Get()
  listarItensCardapio()
  {
    return this.itensCardapioService.listarItensCardapio();
  }

  @Roles(...TODOS_OS_PERFIS)
  @Get(':id')
  buscarItemCardapioPorId(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.itensCardapioService.buscarItemCardapioPorId(nrId);
  }

  @Patch(':id')
  atualizarItemCardapio(@Param('id', ParseIntPipe) nrId: number, @Body() updateItensCardapioDto: UpdateItensCardapioDto)
  {
    return this.itensCardapioService.atualizarItemCardapio(nrId, updateItensCardapioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerItemCardapio(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.itensCardapioService.removerItemCardapio(nrId);
  }
}