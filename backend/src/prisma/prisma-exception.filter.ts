import { ArgumentsHost, Catch, ConflictException, NotFoundException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '../generated/prisma/client.js';

interface MetaErroPrisma
{
  modelName?: string;
  target?: string[] | string;
  driverAdapterError?: {
    cause?: {
      constraint?: {
        index?: string;
        fields?: string[]
      }
    }
  };
}

@Catch(Prisma.PrismaClientKnownRequestError) export class PrismaExceptionFilter extends BaseExceptionFilter
{
  catch(erro: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost)
  {
    switch (erro.code)
    {
      case 'P2002':
        return super.catch(new ConflictException(this.montarMensagemDuplicado(erro)), host);
      case 'P2003':
        return super.catch(new ConflictException('Operação não permitida: o registro está ligado a outros dados!'), host);
      case 'P2025':
        return super.catch(new NotFoundException('Registro não encontrado!'), host);
      default:
        return super.catch(erro, host);
    }
  }

  private montarMensagemDuplicado(erro: Prisma.PrismaClientKnownRequestError)
  {
    const dsCampos = this.descobrirCampos(erro.meta as MetaErroPrisma | undefined);
    return dsCampos ? `Já existe um registro com este valor em ${dsCampos}!` : 'Já existe um registro com este valor!';
  }

  private descobrirCampos(meta?: MetaErroPrisma)
  {
    if (!meta)
      return undefined;

    if (Array.isArray(meta.target))
      return meta.target.join(', ');

    if (typeof meta.target === 'string')
      return meta.target;

    const constraint = meta.driverAdapterError?.cause?.constraint;

    if (constraint?.fields?.length)
      return constraint.fields.join(', ');

    if (constraint?.index && meta.modelName)
      return constraint.index.replace(`${meta.modelName}_`, '').replace(/_key$/, '');

    return undefined;
  }
}
