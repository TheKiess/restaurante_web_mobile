import { NestFactory }     from '@nestjs/core';
import { AppModule }       from './app.module.js';
import { PrismaService }   from './prisma/prisma.service.js';
import { UsuariosService } from './usuarios/usuarios.service.js';
import { Perfil }          from './generated/prisma/enums.js';

async function criarGerenteInicial()
{
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

  try
  {
    const dsApelido = process.env.ADMIN_APELIDO;
    const dsSenha   = process.env.ADMIN_SENHA;

    if (!dsApelido || !dsSenha)
      throw new Error('Informe ADMIN_APELIDO e ADMIN_SENHA no .env para criar o gerente inicial.');

    const usuarioExistente = await app.get(PrismaService).usuario.findUnique({ where: { ds_apelido: dsApelido } });

    if (usuarioExistente)
    {
      console.log(`O usuário "${dsApelido}" já existe. Nada foi alterado.`);
      return;
    }

    await app.get(UsuariosService).criarUsuario({
      nm_pessoa: process.env.ADMIN_NOME ?? 'Gerente',
      ds_apelido: dsApelido,
      ds_senha: dsSenha,
      perfil: Perfil.GERENCIA,
    });

    console.log(`Gerente "${dsApelido}" criado.`);
  }
  finally
  {
    await app.close();
  }
}

criarGerenteInicial().catch((erro: Error) =>
{
  console.error(erro.message);
  process.exitCode = 1;
});
