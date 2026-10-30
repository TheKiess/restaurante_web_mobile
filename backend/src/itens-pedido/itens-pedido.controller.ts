import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ItensPedidoService }                                             from './itens-pedido.service.js';
import { CreateItensPedidoDto }                                           from './dto/create-itens-pedido.dto.js';
import { UpdateItensPedidoDto }                                           from './dto/update-itens-pedido.dto.js';
import { AlterarSituacaoItemPedidoDto }                                   from './dto/alterar-situacao-item-pedido.dto.js';
import { ListarItensPedidoQueryDto }                                      from './dto/listar-itens-pedido-query.dto.js';
import { Roles }                                                          from '../auth/roles.decorator.js';
import { Perfil }                                                         from '../generated/prisma/enums.js';

@Controller('itens-pedido')
@Roles(Perfil.GERENCIA, Perfil.GARCOM)
export class ItensPedidoController
{
  constructor(private readonly itensPedidoService: ItensPedidoService) {}

  @Post()
  lancarItemPedido(@Body() createItensPedidoDto: CreateItensPedidoDto)
  {
    return this.itensPedidoService.lancarItemPedido(createItensPedidoDto);
  }

  @Get()
  listarItensPedido(@Query() listarItensPedidoQueryDto: ListarItensPedidoQueryDto)
  {
    return this.itensPedidoService.listarItensPedido(listarItensPedidoQueryDto);
  }

  @Roles(Perfil.GERENCIA, Perfil.GARCOM, Perfil.COZINHA)
  @Get('fila')
  listarFilaCozinha()
  {
    return this.itensPedidoService.listarFilaCozinha();
  }

  @Get(':id')
  buscarItemPedidoPorId(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.itensPedidoService.buscarItemPedidoPorId(nrId);
  }

  @Patch(':id')
  atualizarItemPedido(@Param('id', ParseIntPipe) nrId: number, @Body() updateItensPedidoDto: UpdateItensPedidoDto)
  {
    return this.itensPedidoService.atualizarItemPedido(nrId, updateItensPedidoDto);
  }

  @Roles(Perfil.GERENCIA, Perfil.GARCOM, Perfil.COZINHA)
  @Patch(':id/situacao')
  alterarSituacaoItemPedido(@Param('id', ParseIntPipe) nrId: number,
    @Body() alterarSituacaoItemPedidoDto: AlterarSituacaoItemPedidoDto
  )
  {
    return this.itensPedidoService.alterarSituacaoItemPedido(nrId, alterarSituacaoItemPedidoDto);
  }
}
