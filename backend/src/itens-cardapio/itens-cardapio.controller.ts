import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ItensCardapioService } from './itens-cardapio.service.js';
import { CreateItensCardapioDto } from './dto/create-itens-cardapio.dto.js';
import { UpdateItensCardapioDto } from './dto/update-itens-cardapio.dto.js';

@Controller('itens-cardapio')
export class ItensCardapioController
{
  constructor(private readonly itensCardapioService: ItensCardapioService) {}

  @Post()
  criarItemCardapio(@Body() createItensCardapioDto: CreateItensCardapioDto)
  {
    return this.itensCardapioService.criarItemCardapio(createItensCardapioDto);
  }

  @Get()
  listarItensCardapio()
  {
    return this.itensCardapioService.listarItensCardapio();
  }

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