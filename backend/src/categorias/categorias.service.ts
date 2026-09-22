import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';

@Injectable()
export class CategoriasService
{
  constructor(private readonly prisma: PrismaService) {}

  async criarCategoria(createCategoriaDto: CreateCategoriaDto)
  {
    if (createCategoriaDto.id_categoria_pai)
      await this.buscarCategoriaPorId(createCategoriaDto.id_categoria_pai);

    return this.prisma.categoria.create({ data: createCategoriaDto });
  }

  listarCategorias()
  {
    return this.prisma.categoria.findMany();
  }

  async buscarCategoriaPorId(nrId: number)
  {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id_categoria: nrId },
      include: { subcategorias: true },
    });

    if (!categoria)
      throw new NotFoundException(`Categoria ${nrId} não encontrada`);

    return categoria;
  }

  async atualizarCategoria(nrId: number, updateCategoriaDto: UpdateCategoriaDto)
  {
    await this.buscarCategoriaPorId(nrId);

    if (updateCategoriaDto.id_categoria_pai === nrId)
      throw new BadRequestException('Uma categoria não pode ser pai dela mesma');

    if (updateCategoriaDto.id_categoria_pai)
      await this.buscarCategoriaPorId(updateCategoriaDto.id_categoria_pai);

    return this.prisma.categoria.update({ where: { id_categoria: nrId }, data: updateCategoriaDto });
  }

  async removerCategoria(nrId: number)
  {
    await this.buscarCategoriaPorId(nrId);
    return this.prisma.categoria.delete({ where: { id_categoria: nrId } });
  }
}
