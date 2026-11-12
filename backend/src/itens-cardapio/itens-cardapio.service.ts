import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService }                                      from '../prisma/prisma.service.js';
import { CreateItensCardapioDto }                             from './dto/create-itens-cardapio.dto.js';
import { UpdateItensCardapioDto }                             from './dto/update-itens-cardapio.dto.js';
import { DefinirReceitaDto }                                  from './dto/definir-receita.dto.js';

@Injectable()
export class ItensCardapioService
{
  constructor(private readonly prisma: PrismaService) {}

  async criarItemCardapio(createItensCardapioDto: CreateItensCardapioDto)
  {
    await this.validarCategoria(createItensCardapioDto.id_categoria);
    return this.prisma.itemCardapio.create({ data: createItensCardapioDto });
  }

  listarItensCardapio()
  {
    return this.prisma.itemCardapio.findMany({ include: { categoria: true } });
  }

  async buscarItemCardapioPorId(nrId: number)
  {
    const item = await this.prisma.itemCardapio.findUnique({
      where: { id_item_cardapio: nrId },
      include: { categoria: true },
    });

    if (!item)
      throw new NotFoundException(`Item ${nrId} não encontrado!`);

    return item;
  }

  async atualizarItemCardapio(nrId: number, updateItensCardapioDto: UpdateItensCardapioDto)
  {
    await this.buscarItemCardapioPorId(nrId);

    if (updateItensCardapioDto.id_categoria)
      await this.validarCategoria(updateItensCardapioDto.id_categoria);

    return this.prisma.itemCardapio.update({ where: { id_item_cardapio: nrId }, data: updateItensCardapioDto });
  }

  async removerItemCardapio(nrId: number)
  {
    await this.buscarItemCardapioPorId(nrId);
    return this.prisma.itemCardapio.delete({ where: { id_item_cardapio: nrId } });
  }

  async buscarReceita(nrId: number)
  {
    await this.buscarItemCardapioPorId(nrId);

    return this.prisma.receita.findMany({
      where: { id_item_cardapio: nrId },
      include: { insumo: { select: { nm_insumo: true, unidade_medida: true }}},
      orderBy: { id_insumo: 'asc' },
    });
  }

  // Troca a receita inteira, lista vazia remove os ingredientes (o item deixa de consumir estoque).
  async definirReceita(nrId: number, definirReceitaDto: DefinirReceitaDto)
  {
    await this.buscarItemCardapioPorId(nrId);

    const { ingredientes } = definirReceitaDto;
    const arrIdsInsumo     = ingredientes.map((ingrediente) => ingrediente.id_insumo);

    if (new Set(arrIdsInsumo).size !== arrIdsInsumo.length)
      throw new BadRequestException('Há insumo repetido na receita!');

    const arrInsumosEncontrados = await this.prisma.insumo.findMany({ where: { id_insumo: { in: arrIdsInsumo } } });
    const nrInsumoInexistente   = arrIdsInsumo.find((nrIdInsumo) => !arrInsumosEncontrados.some((insumo) => insumo.id_insumo === nrIdInsumo));

    if (nrInsumoInexistente)
      throw new NotFoundException(`Insumo ${nrInsumoInexistente} não encontrado!`);

    await this.prisma.$transaction([
      this.prisma.receita.deleteMany({ where: { id_item_cardapio: nrId } }),
      this.prisma.receita.createMany({
        data: ingredientes.map((ingrediente) => ({
          id_item_cardapio: nrId, id_insumo: ingrediente.id_insumo, qt_insumo: ingrediente.qt_insumo
        })),
      }),
    ]);

    return this.buscarReceita(nrId);
  }

  private async validarCategoria(nrIdCategoria: number)
  {
    const categoria = await this.prisma.categoria.findUnique({ where: { id_categoria: nrIdCategoria } });

    if (!categoria)
      throw new NotFoundException(`Categoria ${nrIdCategoria} não encontrada!`);
  }
}