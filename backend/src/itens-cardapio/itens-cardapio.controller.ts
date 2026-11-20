import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor }                                                                                                           from '@nestjs/platform-express';
import { ItensCardapioService }                                                                                                      from './itens-cardapio.service.js';
import { CreateItensCardapioDto }                                                                                                    from './dto/create-itens-cardapio.dto.js';
import { NR_TAMANHO_MAXIMO_IMAGEM }                                                                                                  from './imagem-cardapio.js';
import type { ArquivoEnviado }                                                                                                       from './imagem-cardapio.js';
import { DefinirReceitaDto }                                                                                                         from './dto/definir-receita.dto.js';
import { UpdateItensCardapioDto }                                                                                                    from './dto/update-itens-cardapio.dto.js';
import { Public }                                                                                                                    from '../auth/public.decorator.js';
import { Roles }                                                                                                                     from '../auth/roles.decorator.js';
import { Perfil }                                                                                                                    from '../generated/prisma/enums.js';

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

  @Public()
  @Get()
  listarItensCardapio()
  {
    return this.itensCardapioService.listarItensCardapio();
  }

  @Public()
  @Get(':id')
  buscarItemCardapioPorId(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.itensCardapioService.buscarItemCardapioPorId(nrId);
  }

  @Roles(Perfil.GERENCIA, Perfil.COZINHA)
  @Get(':id/receita')
  buscarReceita(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.itensCardapioService.buscarReceita(nrId);
  }

  @Put(':id/receita')
  definirReceita(@Param('id', ParseIntPipe) nrId: number, @Body() definirReceitaDto: DefinirReceitaDto)
  {
    return this.itensCardapioService.definirReceita(nrId, definirReceitaDto);
  }

  @Post(':id/imagem')
  @UseInterceptors(FileInterceptor('imagem', { limits: { fileSize: NR_TAMANHO_MAXIMO_IMAGEM, files: 1 } }))
  salvarImagem(@Param('id', ParseIntPipe) nrId: number, @UploadedFile() arquivo: ArquivoEnviado | undefined)
  {
    return this.itensCardapioService.salvarImagem(nrId, arquivo);
  }

  @Delete(':id/imagem')
  removerImagem(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.itensCardapioService.removerImagem(nrId);
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