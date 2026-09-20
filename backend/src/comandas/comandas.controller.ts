import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ComandasService } from './comandas.service.js';
import { CreateComandaDto } from './dto/create-comanda.dto.js';
import { UpdateComandaDto } from './dto/update-comanda.dto.js';
import { ListarComandasQueryDto } from './dto/listar-comandas-query.dto.js';

@Controller('comandas')
export class ComandasController
{
  constructor(private readonly comandasService: ComandasService) {}

  @Post()
  abrirComanda(@Body() createComandaDto: CreateComandaDto)
  {
    return this.comandasService.abrirComanda(createComandaDto);
  }

  @Get()
  listarComandas(@Query() listarComandasQueryDto: ListarComandasQueryDto)
  {
    return this.comandasService.listarComandas(listarComandasQueryDto);
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

  @Patch(':id/cancelar')
  cancelarComanda(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.comandasService.cancelarComanda(nrId);
  }
}
