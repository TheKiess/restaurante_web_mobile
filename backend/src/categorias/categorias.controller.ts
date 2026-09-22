import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CategoriasService } from './categorias.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';

@Controller('categorias')
export class CategoriasController
{
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  criarCategoria(@Body() createCategoriaDto: CreateCategoriaDto)
  {
    return this.categoriasService.criarCategoria(createCategoriaDto);
  }

  @Get()
  listarCategorias()
  {
    return this.categoriasService.listarCategorias();
  }

  @Get(':id')
  buscarCategoriaPorId(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.categoriasService.buscarCategoriaPorId(nrId);
  }

  @Patch(':id')
  atualizarCategoria(@Param('id', ParseIntPipe) nrId: number, @Body() updateCategoriaDto: UpdateCategoriaDto)
  {
    return this.categoriasService.atualizarCategoria(nrId, updateCategoriaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removerCategoria(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.categoriasService.removerCategoria(nrId);
  }
}
