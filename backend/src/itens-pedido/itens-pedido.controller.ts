import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ItensPedidoService }                                                  from './itens-pedido.service.js';
import { CreateItensPedidoDto }                                                from './dto/create-itens-pedido.dto.js';
import { UpdateItensPedidoDto }                                                from './dto/update-itens-pedido.dto.js';
import { AlterarSituacaoItemPedidoDto }                                        from './dto/alterar-situacao-item-pedido.dto.js';
import { CancelarItemClienteDto }                                              from './dto/cancelar-item-cliente.dto.js';
import { ListarItensPedidoQueryDto }                                           from './dto/listar-itens-pedido-query.dto.js';
import { Roles }                                                               from '../auth/roles.decorator.js';
import type { RequisicaoAutenticada }                                          from '../auth/auth.types.js';
import { OrigemPedido, Perfil }                                                from '../generated/prisma/enums.js';
import { CreatePedidoRetiradaDto }                                             from './dto/create-pedido-retirada.dto.js';

@Controller('itens-pedido')
@Roles(Perfil.GERENCIA, Perfil.GARCOM)
export class ItensPedidoController
{
  constructor(private readonly itensPedidoService: ItensPedidoService) {}

  @Roles(Perfil.CLIENTE)
  @Post('retirada')
  criarPedidoRetirada(
    @Body() createPedidoRetiradaDto: CreatePedidoRetiradaDto,
    @Req() request: RequisicaoAutenticada,
  )
  {
    return this.itensPedidoService.criarPedidoRetirada(
      createPedidoRetiradaDto,
      request.usuario.sub,
    );
  }

  @Roles(Perfil.GERENCIA, Perfil.GARCOM, Perfil.CLIENTE)
  @Post()
  lancarItemPedido(@Body() createItensPedidoDto: CreateItensPedidoDto, @Req() request: RequisicaoAutenticada)
  {
    const flCliente = request.usuario.perfil === Perfil.CLIENTE;
    return this.itensPedidoService.lancarItemPedido(createItensPedidoDto, {
      nrIdUsuario: request.usuario.sub,
      idOrigem: flCliente ? OrigemPedido.APP : OrigemPedido.SALAO,
      nrIdClienteDono: flCliente ? request.usuario.sub : undefined
    });
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

  @Roles(Perfil.CLIENTE)
  @Get('meus')
  listarMeusPedidos(@Req() request: RequisicaoAutenticada)
  {
    return this.itensPedidoService.listarItensDoCliente(request.usuario.sub);
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

  @Roles(Perfil.CLIENTE)
  @Patch(':id/cancelar')
  cancelarItemDoCliente(
    @Param('id', ParseIntPipe) nrId: number,
    @Body() cancelarItemClienteDto: CancelarItemClienteDto,
    @Req() request: RequisicaoAutenticada
  )
  {
    return this.itensPedidoService.cancelarItemDoCliente(nrId, cancelarItemClienteDto.id_comanda, request.usuario.sub);
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
