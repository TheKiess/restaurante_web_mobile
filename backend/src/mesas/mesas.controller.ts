import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MesasService } from './mesas.service.js';
import { CreateMesaDto } from './dto/create-mesa.dto.js';
import { UpdateMesaDto } from './dto/update-mesa.dto.js';

@Controller('mesas')
export class MesasController
{
  constructor(private readonly mesasService: MesasService) {}

  @Post()
  criarMesa(@Body() createMesaDto: CreateMesaDto)
  {
    return this.mesasService.criarMesa(createMesaDto);
  }

  @Get()
  listarMesas()
  {
    return this.mesasService.listarMesas();
  }

  @Get(':id')
  buscarMesaPorId(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.mesasService.buscarMesaPorId(nrId);
  }

  @Patch(':id')
  atualizarMesa(@Param('id', ParseIntPipe) nrId: number, @Body() updateMesaDto: UpdateMesaDto)
  {
    return this.mesasService.atualizarMesa(nrId, updateMesaDto);
  }

  @Delete(':id')
  removerMesa(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.mesasService.removerMesa(nrId);
  }
}
