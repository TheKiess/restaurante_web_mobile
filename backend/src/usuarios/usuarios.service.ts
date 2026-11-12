import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService }                                    from '../prisma/prisma.service.js';
import { travarGerentesAtivos }                             from '../prisma/travas.js';
import { Perfil }                                           from '../generated/prisma/enums.js';
import { CryptService }                                     from '../crypt/crypt.service.js';
import { CreateUsuarioDto }                                 from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto }                                 from './dto/update-usuario.dto.js';
import { ListarUsuariosQueryDto }                           from './dto/listar-usuarios-query.dto.js';

@Injectable()
export class UsuariosService
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptService: CryptService
  ) {}

  async criarUsuario(createUsuarioDto: CreateUsuarioDto)
  {
    const { nm_pessoa, ds_cnpj_cpf, ds_email, ds_telefone, ds_apelido, ds_senha, perfil } = createUsuarioDto;
    await this.validarDadosUnicos(ds_apelido, ds_email, ds_cnpj_cpf);
    const dsSenhaHash = await this.cryptService.gerarHashSenha(ds_senha);

    return this.prisma.usuario.create({
      data: {
        ds_apelido,
        ds_senha: dsSenhaHash,
        perfil,
        pessoa: { create: { nm_pessoa, ds_cnpj_cpf, ds_email, ds_telefone } },
      },
      omit: { ds_senha: true },
      include: { pessoa: true }
    });
  }

  listarUsuarios(listarUsuariosQueryDto: ListarUsuariosQueryDto)
  {
    const { perfil, funcionarios } = listarUsuariosQueryDto;

    return this.prisma.usuario.findMany({
      where: {
        perfil,
        ...(funcionarios ? {
          perfil: perfil ?? { not: Perfil.CLIENTE }
        } : {})
      },
      omit: { ds_senha: true },
      include: { pessoa: true },
      orderBy: {
        pessoa: { nm_pessoa: 'asc' }
      }
    });
  }

  async buscarUsuarioPorId(nrId: number)
  {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: nrId },
      omit: { ds_senha: true },
      include: { pessoa: true }
    });

    if (!usuario)
      throw new NotFoundException(`Usuário ${nrId} não encontrado!`);

    return usuario;
  }

  async atualizarUsuario(nrId: number, updateUsuarioDto: UpdateUsuarioDto, nrIdUsuarioLogado: number)
  {
    const usuarioAtual = await this.buscarUsuarioPorId(nrId);
    const {
      nm_pessoa,
      ds_cnpj_cpf,
      ds_email,
      ds_telefone,
      ds_senha,
      ...dadosUsuario
    } = updateUsuarioDto;

    if (dadosUsuario.id_ativo === false && nrId === nrIdUsuarioLogado)
      throw new ConflictException('Você não pode inativar a própria conta!');

    await this.validarDadosUnicos(
      dadosUsuario.ds_apelido !== usuarioAtual.ds_apelido ? dadosUsuario.ds_apelido : undefined,
      ds_email !== usuarioAtual.pessoa.ds_email ? ds_email : undefined,
      ds_cnpj_cpf !== usuarioAtual.pessoa.ds_cnpj_cpf ? ds_cnpj_cpf : undefined
    );

    const dsSenhaHash     = ds_senha ? await this.cryptService.gerarHashSenha(ds_senha) : undefined;
    const flPerdeGerencia = usuarioAtual.perfil === Perfil.GERENCIA && usuarioAtual.id_ativo &&
      ((!!dadosUsuario.perfil && dadosUsuario.perfil !== Perfil.GERENCIA) || dadosUsuario.id_ativo === false);

    return this.prisma.$transaction(async (transacao) => {
      if (flPerdeGerencia)
      {
        await travarGerentesAtivos(transacao);

        const nrOutrosGerentes = await transacao.usuario.count({
          where: {
            perfil: Perfil.GERENCIA,
            id_ativo: true, id_usuario: { not: nrId }
          }
        });

        if (nrOutrosGerentes === 0)
          throw new ConflictException('Precisa existir pelo menos um gerente ativo!');
      }

      return transacao.usuario.update({
        where: { id_usuario: nrId },
        data: {
          ...dadosUsuario,
          ds_senha: dsSenhaHash,
          pessoa: { update: { nm_pessoa, ds_cnpj_cpf, ds_email, ds_telefone } },
        },
        omit: { ds_senha: true },
        include: { pessoa: true }
      });
    });
  }

  private async validarDadosUnicos(dsApelido?: string, dsEmail?: string, dsCnpjCpf?: string)
  {
    if (dsApelido && await this.prisma.usuario.findUnique({ where: { ds_apelido: dsApelido } }))
      throw new ConflictException('Apelido já está em uso!');

    if (dsEmail && await this.prisma.pessoa.findUnique({ where: { ds_email: dsEmail } }))
      throw new ConflictException('E-mail já cadastrado!');

    if (dsCnpjCpf && await this.prisma.pessoa.findUnique({ where: { ds_cnpj_cpf: dsCnpjCpf } }))
      throw new ConflictException('CPF/CNPJ já cadastrado!');
  }
}