import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PagamentosService } from './pagamentos.service.js';
import { CreatePagamentoDto } from './dto/create-pagamento.dto.js';
import { AlterarSituacaoPagamentoDto } from './dto/alterar-situacao-pagamento.dto.js';
import { ListarPagamentosQueryDto } from './dto/listar-pagamentos-query.dto.js';

@Controller('pagamentos')
export class PagamentosController
{
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post()
  registrarPagamento(@Body() createPagamentoDto: CreatePagamentoDto)
  {
    return this.pagamentosService.registrarPagamento(createPagamentoDto);
  }

  @Get()
  listarPagamentos(@Query() listarPagamentosQueryDto: ListarPagamentosQueryDto)
  {
    return this.pagamentosService.listarPagamentos(listarPagamentosQueryDto);
  }

  @Get(':id')
  buscarPagamentoPorId(@Param('id', ParseIntPipe) nrId: number)
  {
    return this.pagamentosService.buscarPagamentoPorId(nrId);
  }

  @Patch(':id/situacao')
  alterarSituacaoPagamento(@Param('id', ParseIntPipe) nrId: number,
    @Body() alterarSituacaoPagamentoDto: AlterarSituacaoPagamentoDto
  )
  {
    return this.pagamentosService.alterarSituacaoPagamento(nrId, alterarSituacaoPagamentoDto);
  }
}