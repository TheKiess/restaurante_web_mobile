import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ItensPedidoService } from './itens-pedido.service.js';
import { CreateItensPedidoDto } from './dto/create-itens-pedido.dto.js';
import { UpdateItensPedidoDto } from './dto/update-itens-pedido.dto.js';
import { AlterarSituacaoItemPedidoDto } from './dto/alterar-situacao-item-pedido.dto.js';
import { ListarItensPedidoQueryDto } from './dto/listar-itens-pedido-query.dto.js';

@Controller('itens-pedido')
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

  @Patch(':id/situacao')
  alterarSituacaoItemPedido(@Param('id', ParseIntPipe) nrId: number,
    @Body() alterarSituacaoItemPedidoDto: AlterarSituacaoItemPedidoDto
  )
  {
    return this.itensPedidoService.alterarSituacaoItemPedido(nrId, alterarSituacaoItemPedidoDto);
  }
}
