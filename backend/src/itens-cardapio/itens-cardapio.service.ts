import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateItensCardapioDto } from './dto/create-itens-cardapio.dto.js';
import { UpdateItensCardapioDto } from './dto/update-itens-cardapio.dto.js';

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

  private async validarCategoria(nrIdCategoria: number)
  {
    const categoria = await this.prisma.categoria.findUnique({ where: { id_categoria: nrIdCategoria } });

    if (!categoria)
      throw new NotFoundException(`Categoria ${nrIdCategoria} não encontrada!`);
  }
}