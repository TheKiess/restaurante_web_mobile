import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMesaDto } from './dto/create-mesa.dto.js';
import { UpdateMesaDto } from './dto/update-mesa.dto.js';

@Injectable()
export class MesasService
{
  constructor(private readonly prisma: PrismaService) {}

  criarMesa(createMesaDto: CreateMesaDto)
  {
    return this.prisma.mesa.create({ data: createMesaDto });
  }

  listarMesas()
  {
    return this.prisma.mesa.findMany();
  }

  async buscarMesaPorId(nrId: number)
  {
    const mesa = await this.prisma.mesa.findUnique({ where: { id_mesa: nrId } });

    if (!mesa)
      throw new NotFoundException(`Mesa ${nrId} não encontrada`);

    return mesa;
  }

  async atualizarMesa(nrId: number, updateMesaDto: UpdateMesaDto)
  {
    await this.buscarMesaPorId(nrId);
    return this.prisma.mesa.update({ where: { id_mesa: nrId }, data: updateMesaDto });
  }

  async removerMesa(nrId: number)
  {
    await this.buscarMesaPorId(nrId);
    return this.prisma.mesa.delete({ where: { id_mesa: nrId } });
  }
}
