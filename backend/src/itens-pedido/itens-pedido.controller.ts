
import {Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req} from '@nestjs/common';
import { Perfil, OrigemPedido } from '../generated/prisma/enums.js';
import { Roles } from '../auth/roles.decorator.js';
import type { RequisicaoAutenticada } from '../auth/auth.types.js';
import { ItensPedidoService } from './itens-pedido.service.js';
import { CreateItensPedidoDto } from './dto/create-itens-pedido.dto.js';
import { UpdateItensPedidoDto } from './dto/update-itens-pedido.dto.js';
import { AlterarSituacaoItemPedidoDto } from './dto/alterar-situacao-item-pedido.dto.js';
import { ListarItensPedidoQueryDto } from './dto/listar-itens-pedido-query.dto.js';
import type { AutorDoItem } from './itens-pedido.service.js';
@Controller('itens-pedido')
@Roles(Perfil.GERENCIA, Perfil.GARCOM)
export class ItensPedidoController {
  constructor(
    private readonly itensPedidoService: ItensPedidoService,
  ) {}

  // Lançar um item no pedido
  @Post()
  @Roles(Perfil.GERENCIA, Perfil.GARCOM, Perfil.CLIENTE)
  lancarItemPedido(
    @Body() createItensPedidoDto: CreateItensPedidoDto,
    @Req() requisicao: RequisicaoAutenticada,
  ) {
    const usuario = requisicao.usuario;

    const ehCliente = usuario.perfil === Perfil.CLIENTE;

    const autorDoItem: AutorDoItem = {
      nrIdUsuario: usuario.sub,
      idOrigem: ehCliente
        ? OrigemPedido.APP
        : OrigemPedido.SALAO,
    };

    if (ehCliente) {
      autorDoItem.nrIdClienteDono = usuario.sub;
    }

    return this.itensPedidoService.lancarItemPedido(
      createItensPedidoDto,
      autorDoItem,
    );
  }

  // Listar itens de pedido
  @Get()
  listarItensPedido(
    @Query() listarItensPedidoQueryDto: ListarItensPedidoQueryDto,
  ) {
    return this.itensPedidoService.listarItensPedido(
      listarItensPedidoQueryDto,
    );
  }

  // Listar fila da cozinha
  @Get('fila')
  @Roles(Perfil.GERENCIA, Perfil.GARCOM, Perfil.COZINHA)
  listarFilaCozinha() {
    return this.itensPedidoService.listarFilaCozinha();
  }

  // Buscar item de pedido por ID
  @Get(':id')
  buscarItemPedidoPorId(
    @Param('id', ParseIntPipe) nrId: number,
  ) {
    return this.itensPedidoService.buscarItemPedidoPorId(nrId);
  }

  // Atualizar item de pedido
  @Patch(':id')
  atualizarItemPedido(
    @Param('id', ParseIntPipe) nrId: number,
    @Body() updateItensPedidoDto: UpdateItensPedidoDto,
  ) {
    return this.itensPedidoService.atualizarItemPedido(
      nrId,
      updateItensPedidoDto,
    );
  }

  // Alterar situação do item de pedido
  @Patch(':id/situacao')
  @Roles(Perfil.GERENCIA, Perfil.GARCOM, Perfil.COZINHA)
  alterarSituacaoItemPedido(
    @Param('id', ParseIntPipe) nrId: number,
    @Body() alterarSituacaoItemPedidoDto: AlterarSituacaoItemPedidoDto,
  ) {
    return this.itensPedidoService.alterarSituacaoItemPedido(
      nrId,
      alterarSituacaoItemPedidoDto,
    );
  }
}
