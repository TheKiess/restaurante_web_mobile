import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ReservasService }                                                     from './reservas.service.js';
import { CreateReservaDto }                                                    from './dto/create-reserva.dto.js';
import { UpdateReservaDto }                                                    from './dto/update-reserva.dto.js';
import { ListarReservasQueryDto }                                              from './dto/listar-reservas-query.dto.js';
import { Roles }                                                               from '../auth/roles.decorator.js';
import type { RequisicaoAutenticada }                                          from '../auth/auth.types.js';
import { Perfil }                                                              from '../generated/prisma/enums.js';

@Controller('reservas')
@Roles(Perfil.GERENCIA, Perfil.GARCOM, Perfil.CLIENTE)
export class ReservasController
{
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  criarReserva(@Body() createReservaDto: CreateReservaDto, @Req() request: RequisicaoAutenticada)
  {
    return this.reservasService.criarReserva(createReservaDto, request.usuario);
  }

  @Get()
  listarReservas(@Query() listarReservasQueryDto: ListarReservasQueryDto, @Req() request: RequisicaoAutenticada)
  {
    return this.reservasService.listarReservas(listarReservasQueryDto, request.usuario);
  }

  @Get(':id')
  buscarReservaPorId(@Param('id', ParseIntPipe) nrId: number, @Req() request: RequisicaoAutenticada)
  {
    return this.reservasService.buscarReservaPorId(nrId, request.usuario);
  }

  @Patch(':id')
  atualizarReserva(
    @Param('id', ParseIntPipe) nrId: number,
    @Body() updateReservaDto: UpdateReservaDto,
    @Req() request: RequisicaoAutenticada
  )
  {
    return this.reservasService.atualizarReserva(nrId, updateReservaDto, request.usuario);
  }

  @Patch(':id/cancelar')
  cancelarReserva(@Param('id', ParseIntPipe) nrId: number, @Req() request: RequisicaoAutenticada)
  {
    return this.reservasService.cancelarReserva(nrId, request.usuario);
  }

  @Roles(Perfil.GERENCIA, Perfil.GARCOM)
  @Post(':id/checkin')
  fazerCheckin(@Param('id', ParseIntPipe) nrId: number, @Req() request: RequisicaoAutenticada)
  {
    return this.reservasService.fazerCheckin(nrId, request.usuario.sub);
  }
}
