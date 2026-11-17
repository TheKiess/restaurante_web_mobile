
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';

import { ItensCardapioService } from './itens-cardapio.service.js';

import { CreateItensCardapioDto } from './dto/create-itens-cardapio.dto.js';
import { DefinirReceitaDto } from './dto/definir-receita.dto.js';
import { UpdateItensCardapioDto } from './dto/update-itens-cardapio.dto.js';

import { Roles, TODOS_OS_PERFIS } from '../auth/roles.decorator.js';
import { Public } from '../auth/public.decorator.js';

import { Perfil } from '../generated/prisma/enums.js';

@Controller('itens-cardapio')
@Roles(Perfil.GERENCIA)
export class ItensCardapioController {
  constructor(
    private readonly itensCardapioService: ItensCardapioService,
  ) {}

  // Cadastrar item do cardápio
  @Post()
  criarItemCardapio(
    @Body() createItensCardapioDto: CreateItensCardapioDto,
  ) {
    return this.itensCardapioService.criarItemCardapio(
      createItensCardapioDto,
    );
  }

  // Listar cardápio - acesso público
  @Get()
  @Public()
  @Roles(...TODOS_OS_PERFIS)
  listarItensCardapio() {
    return this.itensCardapioService.listarItensCardapio();
  }

  // Buscar item por ID - acesso público
  @Get(':id')
  @Public()
  @Roles(...TODOS_OS_PERFIS)
  buscarItemCardapioPorId(
    @Param('id', ParseIntPipe) nrId: number,
  ) {
    return this.itensCardapioService.buscarItemCardapioPorId(nrId);
  }

  // Buscar receita - gerente e cozinha
  @Get(':id/receita')
  @Roles(Perfil.GERENCIA, Perfil.COZINHA)
  buscarReceita(
    @Param('id', ParseIntPipe) nrId: number,
  ) {
    return this.itensCardapioService.buscarReceita(nrId);
  }

  // Definir receita
  @Put(':id/receita')
  definirReceita(
    @Param('id', ParseIntPipe) nrId: number,
    @Body() definirReceitaDto: DefinirReceitaDto,
  ) {
    return this.itensCardapioService.definirReceita(
      nrId,
      definirReceitaDto,
    );
  }

  // Atualizar item
  @Patch(':id')
  atualizarItemCardapio(
    @Param('id', ParseIntPipe) nrId: number,
    @Body() updateItensCardapioDto: UpdateItensCardapioDto,
  ) {
    return this.itensCardapioService.atualizarItemCardapio(
      nrId,
      updateItensCardapioDto,
    );
  }

  // Remover item
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerItemCardapio(
    @Param('id', ParseIntPipe) nrId: number,
  ) {
    return this.itensCardapioService.removerItemCardapio(nrId);
  }
}
