import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TipoMovimento } from '../generated/prisma/enums.js';
import { CreateInsumoDto } from './dto/create-insumo.dto.js';
import { UpdateInsumoDto } from './dto/update-insumo.dto.js';

@Injectable()
export class InsumosService
{
  constructor(private readonly prisma: PrismaService) {}

  criarInsumo(createInsumoDto: CreateInsumoDto)
  {
    const { qt_estoque_inicial, ...dadosInsumo } = createInsumoDto;
    const qtInicial                              = qt_estoque_inicial ?? 0;

    return this.prisma.$transaction(async (tx) => {
      const insumo = await tx.insumo.create({ data: { ...dadosInsumo, qt_estoque: qtInicial } });

      if (qtInicial > 0)
        await tx.movimentoEstoque.create({
          data: {
            id_insumo: insumo.id_insumo,
            tipo_movimento: TipoMovimento.ENTRADA,
            qt_movimento: qtInicial,
            ds_motivo: 'Estoque inicial',
          },
        });

      return insumo;
    });
  }

  listarInsumos()
  {
    return this.prisma.insumo.findMany({ orderBy: { nm_insumo: 'asc' } });
  }

  async listarInsumosComEstoqueBaixo()
  {
    const arrInsumos = await this.prisma.insumo.findMany({ orderBy: { nm_insumo: 'asc' } });

    return arrInsumos.filter((insumo) => insumo.qt_estoque_minimo.gt(0) && insumo.qt_estoque.lte(insumo.qt_estoque_minimo));
  }

  async buscarInsumoPorId(nrId: number)
  {
    const insumo = await this.prisma.insumo.findUnique({ where: { id_insumo: nrId } });

    if (!insumo)
      throw new NotFoundException(`Insumo ${nrId} não encontrado!`);

    return insumo;
  }

  async atualizarInsumo(nrId: number, updateInsumoDto: UpdateInsumoDto)
  {
    await this.buscarInsumoPorId(nrId);
    return this.prisma.insumo.update({ where: { id_insumo: nrId }, data: updateInsumoDto });
  }

  async removerInsumo(nrId: number)
  {
    await this.buscarInsumoPorId(nrId);
    return this.prisma.insumo.delete({ where: { id_insumo: nrId } });
  }
}
