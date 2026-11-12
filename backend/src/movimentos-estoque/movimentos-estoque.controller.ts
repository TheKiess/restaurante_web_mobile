import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MovimentosEstoqueService }           from './movimentos-estoque.service.js';
import { RegistrarMovimentoEstoqueDto }       from './dto/registrar-movimento-estoque.dto.js';
import { ListarMovimentosEstoqueQueryDto }    from './dto/listar-movimentos-estoque-query.dto.js';
import { Roles }                              from '../auth/roles.decorator.js';
import { Perfil }                             from '../generated/prisma/enums.js';

@Controller('movimentos-estoque')
@Roles(Perfil.GERENCIA)
export class MovimentosEstoqueController
{
  constructor(private readonly movimentosEstoqueService: MovimentosEstoqueService) {}

  @Post()
  registrarMovimento(@Body() registrarMovimentoEstoqueDto: RegistrarMovimentoEstoqueDto)
  {
    return this.movimentosEstoqueService.registrarMovimento(registrarMovimentoEstoqueDto);
  }

  @Get()
  listarMovimentos(@Query() listarMovimentosEstoqueQueryDto: ListarMovimentosEstoqueQueryDto)
  {
    return this.movimentosEstoqueService.listarMovimentos(listarMovimentosEstoqueQueryDto);
  }
}
