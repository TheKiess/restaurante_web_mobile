// Esse popular foi inteiramente pedido ao Claude para ser criado de forma que dê para fazer testes...

import { NestFactory }          from '@nestjs/core';
import { AppModule }            from './app.module.js';
import { CryptService }         from './crypt/crypt.service.js';
import { PrismaService }        from './prisma/prisma.service.js';
import type { Prisma }          from './generated/prisma/client.js';
import {
  FormaPagamento,
  OrigemPedido,
  Perfil,
  SituacaoComanda,
  SituacaoItemPedido,
  SituacaoPagamento,
  SituacaoReserva,
  TipoItem,
  TipoMovimento,
  UnidadeMedida
}                               from './generated/prisma/enums.js';
import { somarMinutos }         from './reservas/regras-reserva.js';
import { NR_MINUTOS_TOLERANCIA_CHECKIN } from './reservas/reservas.constantes.js';

// Popula o banco com dados de demonstração: usuários, mesas, cardápio, estoque, 30 dias de comandas,
// pagamentos, reservas e um salão "ao vivo" (comandas abertas e fila da cozinha).
// Uso: npm run popular    (o banco precisa estar vazio, exceto pelo gerente criado pelo npm run seed)

const NR_SEMENTE        = 20261123;
const DS_SENHA_PADRAO   = 'Senha@123';
const NR_DIAS_HISTORICO = 30;
const NR_CLIENTES       = 40;
const NR_TAMANHO_LOTE   = 1000;

type InsumoBase = { nm: string; un: UnidadeMedida; min: number };
type ItemBase   = {
  categoria: string;
  nm: string;
  ds: string;
  vl: number;
  tipo: TipoItem;
  receita: Record<string, number>;
  peso: number;
  disponivel?: boolean;
};

const ARR_INSUMOS: InsumoBase[] = [
  { nm: 'Pão de hambúrguer',   un: UnidadeMedida.UN, min: 60 },
  { nm: 'Carne bovina',        un: UnidadeMedida.KG, min: 6 },
  { nm: 'Queijo mussarela',    un: UnidadeMedida.KG, min: 5 },
  { nm: 'Bacon',               un: UnidadeMedida.KG, min: 3 },
  { nm: 'Alface',              un: UnidadeMedida.KG, min: 2 },
  { nm: 'Tomate',              un: UnidadeMedida.KG, min: 3 },
  { nm: 'Cebola',              un: UnidadeMedida.KG, min: 3 },
  { nm: 'Maionese',            un: UnidadeMedida.KG, min: 2 },
  { nm: 'Batata',              un: UnidadeMedida.KG, min: 12 },
  { nm: 'Peito de frango',     un: UnidadeMedida.KG, min: 8 },
  { nm: 'Presunto',            un: UnidadeMedida.KG, min: 3 },
  { nm: 'Calabresa',           un: UnidadeMedida.KG, min: 4 },
  { nm: 'Catupiry',            un: UnidadeMedida.KG, min: 2 },
  { nm: 'Azeitona',            un: UnidadeMedida.KG, min: 1 },
  { nm: 'Massa de pizza',      un: UnidadeMedida.UN, min: 30 },
  { nm: 'Molho de tomate',     un: UnidadeMedida.L,  min: 6 },
  { nm: 'Óleo de fritura',     un: UnidadeMedida.L,  min: 10 },
  { nm: 'Farinha de rosca',    un: UnidadeMedida.KG, min: 2 },
  { nm: 'Farinha de trigo',    un: UnidadeMedida.KG, min: 5 },
  { nm: 'Leite condensado',    un: UnidadeMedida.UN, min: 10 },
  { nm: 'Ovos',                un: UnidadeMedida.UN, min: 40 },
  { nm: 'Leite',               un: UnidadeMedida.L,  min: 8 },
  { nm: 'Chocolate em pó',     un: UnidadeMedida.KG, min: 1 },
  { nm: 'Laranja',             un: UnidadeMedida.KG, min: 10 },
  { nm: 'Polpa de maracujá',   un: UnidadeMedida.KG, min: 4 },
  { nm: 'Açúcar',              un: UnidadeMedida.KG, min: 4 },
  { nm: 'Sorvete de creme',    un: UnidadeMedida.L,  min: 5 },
  { nm: 'Coca-Cola lata',      un: UnidadeMedida.UN, min: 48 },
  { nm: 'Guaraná lata',        un: UnidadeMedida.UN, min: 48 },
  { nm: 'Água mineral',        un: UnidadeMedida.UN, min: 48 },
  { nm: 'Cerveja lata',        un: UnidadeMedida.UN, min: 72 },
  { nm: 'Cerveja long neck',   un: UnidadeMedida.UN, min: 48 },
];

// categoria "Bebidas" é pai de Refrigerantes, Sucos e Cervejas
const ARR_CATEGORIAS_PAI = ['Lanches', 'Pizzas', 'Porções', 'Bebidas', 'Sobremesas'];
const ARR_SUBCATEGORIAS  = ['Refrigerantes', 'Sucos', 'Cervejas'];

const ARR_ITENS: ItemBase[] = [
  { categoria: 'Lanches', nm: 'X-Burger',          ds: 'Pão, hambúrguer, queijo e maionese', vl: 22.9, tipo: TipoItem.PREPARADO, peso: 10, receita: { 'Pão de hambúrguer': 1, 'Carne bovina': 0.15, 'Queijo mussarela': 0.03, 'Maionese': 0.02 } },
  { categoria: 'Lanches', nm: 'X-Salada',          ds: 'Hambúrguer, queijo, alface e tomate', vl: 24.9, tipo: TipoItem.PREPARADO, peso: 8, receita: { 'Pão de hambúrguer': 1, 'Carne bovina': 0.15, 'Queijo mussarela': 0.03, 'Alface': 0.02, 'Tomate': 0.04, 'Maionese': 0.02 } },
  { categoria: 'Lanches', nm: 'X-Bacon',           ds: 'Hambúrguer, queijo e bacon crocante', vl: 27.9, tipo: TipoItem.PREPARADO, peso: 9, receita: { 'Pão de hambúrguer': 1, 'Carne bovina': 0.15, 'Queijo mussarela': 0.03, 'Bacon': 0.04, 'Maionese': 0.02 } },
  { categoria: 'Lanches', nm: 'X-Frango',          ds: 'Filé de frango grelhado, queijo e alface', vl: 25.9, tipo: TipoItem.PREPARADO, peso: 6, receita: { 'Pão de hambúrguer': 1, 'Peito de frango': 0.15, 'Queijo mussarela': 0.03, 'Alface': 0.02, 'Maionese': 0.02 } },
  { categoria: 'Lanches', nm: 'X-Tudo',            ds: 'Hambúrguer, ovo, bacon, presunto, queijo e salada', vl: 32.9, tipo: TipoItem.PREPARADO, peso: 7, receita: { 'Pão de hambúrguer': 1, 'Carne bovina': 0.15, 'Queijo mussarela': 0.05, 'Bacon': 0.04, 'Presunto': 0.03, 'Ovos': 1, 'Alface': 0.02, 'Tomate': 0.04 } },
  { categoria: 'Lanches', nm: 'Hambúrguer Duplo',  ds: 'Dois hambúrgueres, queijo e cebola', vl: 34.9, tipo: TipoItem.PREPARADO, peso: 5, receita: { 'Pão de hambúrguer': 1, 'Carne bovina': 0.3, 'Queijo mussarela': 0.06, 'Cebola': 0.03, 'Maionese': 0.02 } },
  { categoria: 'Pizzas',  nm: 'Pizza Mussarela',   ds: 'Molho de tomate e muita mussarela', vl: 39.9, tipo: TipoItem.PREPARADO, peso: 6, receita: { 'Massa de pizza': 1, 'Molho de tomate': 0.15, 'Queijo mussarela': 0.25 } },
  { categoria: 'Pizzas',  nm: 'Pizza Calabresa',   ds: 'Calabresa fatiada e cebola', vl: 42.9, tipo: TipoItem.PREPARADO, peso: 7, receita: { 'Massa de pizza': 1, 'Molho de tomate': 0.15, 'Queijo mussarela': 0.2, 'Calabresa': 0.2, 'Cebola': 0.05 } },
  { categoria: 'Pizzas',  nm: 'Pizza Frango com Catupiry', ds: 'Frango desfiado e catupiry', vl: 45.9, tipo: TipoItem.PREPARADO, peso: 5, receita: { 'Massa de pizza': 1, 'Molho de tomate': 0.15, 'Queijo mussarela': 0.15, 'Peito de frango': 0.2, 'Catupiry': 0.15 } },
  { categoria: 'Pizzas',  nm: 'Pizza Portuguesa',  ds: 'Presunto, ovo, cebola e azeitona', vl: 46.9, tipo: TipoItem.PREPARADO, peso: 3, disponivel: false, receita: { 'Massa de pizza': 1, 'Molho de tomate': 0.15, 'Queijo mussarela': 0.2, 'Presunto': 0.1, 'Ovos': 2, 'Cebola': 0.05, 'Azeitona': 0.03 } },
  { categoria: 'Porções', nm: 'Batata Frita',      ds: 'Porção crocante para dividir', vl: 24.9, tipo: TipoItem.PREPARADO, peso: 9, receita: { 'Batata': 0.4, 'Óleo de fritura': 0.1 } },
  { categoria: 'Porções', nm: 'Frango a Passarinho', ds: 'Frango empanado e frito', vl: 36.9, tipo: TipoItem.PREPARADO, peso: 5, receita: { 'Peito de frango': 0.5, 'Farinha de trigo': 0.05, 'Óleo de fritura': 0.15 } },
  { categoria: 'Porções', nm: 'Anéis de Cebola',   ds: 'Cebola empanada e frita', vl: 22.9, tipo: TipoItem.PREPARADO, peso: 4, receita: { 'Cebola': 0.3, 'Farinha de rosca': 0.1, 'Óleo de fritura': 0.12 } },
  { categoria: 'Porções', nm: 'Calabresa Acebolada', ds: 'Calabresa frita com cebola', vl: 34.9, tipo: TipoItem.PREPARADO, peso: 4, receita: { 'Calabresa': 0.4, 'Cebola': 0.15 } },
  { categoria: 'Refrigerantes', nm: 'Coca-Cola Lata', ds: '350 ml', vl: 6.5, tipo: TipoItem.REVENDA, peso: 12, receita: { 'Coca-Cola lata': 1 } },
  { categoria: 'Refrigerantes', nm: 'Guaraná Lata',   ds: '350 ml', vl: 6, tipo: TipoItem.REVENDA, peso: 8, receita: { 'Guaraná lata': 1 } },
  { categoria: 'Refrigerantes', nm: 'Água Mineral',   ds: '500 ml', vl: 4, tipo: TipoItem.REVENDA, peso: 7, receita: { 'Água mineral': 1 } },
  { categoria: 'Sucos', nm: 'Suco de Laranja',   ds: 'Natural, 400 ml', vl: 9.9, tipo: TipoItem.PREPARADO, peso: 5, receita: { 'Laranja': 0.5, 'Açúcar': 0.02 } },
  { categoria: 'Sucos', nm: 'Suco de Maracujá',  ds: 'Da polpa, 400 ml', vl: 9.9, tipo: TipoItem.PREPARADO, peso: 4, receita: { 'Polpa de maracujá': 0.15, 'Açúcar': 0.03 } },
  { categoria: 'Cervejas', nm: 'Cerveja Lata',   ds: '350 ml', vl: 7.5, tipo: TipoItem.REVENDA, peso: 10, receita: { 'Cerveja lata': 1 } },
  { categoria: 'Cervejas', nm: 'Long Neck',      ds: '330 ml', vl: 11.9, tipo: TipoItem.REVENDA, peso: 8, receita: { 'Cerveja long neck': 1 } },
  { categoria: 'Sobremesas', nm: 'Pudim',        ds: 'Pudim de leite condensado', vl: 14.9, tipo: TipoItem.PREPARADO, peso: 3, receita: { 'Leite condensado': 1, 'Leite': 0.3, 'Ovos': 3 } },
  { categoria: 'Sobremesas', nm: 'Sorvete 2 Bolas', ds: 'Sorvete de creme com calda', vl: 12.9, tipo: TipoItem.PREPARADO, peso: 4, receita: { 'Sorvete de creme': 0.15 } },
  { categoria: 'Sobremesas', nm: 'Brownie com Sorvete', ds: 'Brownie quente com sorvete', vl: 16.9, tipo: TipoItem.PREPARADO, peso: 3, disponivel: false, receita: { 'Chocolate em pó': 0.05, 'Farinha de trigo': 0.05, 'Ovos': 2, 'Sorvete de creme': 0.1 } },
];

const ARR_NOMES      = ['Ana', 'Bruno', 'Carla', 'Diego', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João', 'Karina', 'Lucas', 'Mariana', 'Nicolas', 'Olívia', 'Pedro', 'Rafaela', 'Samuel', 'Tatiane', 'Vinícius'];
const ARR_SOBRENOMES = ['Almeida', 'Barbosa', 'Cardoso', 'Dias', 'Ferreira', 'Gomes', 'Lima', 'Machado', 'Nascimento', 'Oliveira', 'Pereira', 'Ribeiro', 'Santos', 'Teixeira', 'Souza', 'Rocha'];
const ARR_LUGARES    = [2, 2, 4, 4, 4, 4, 6, 6, 6, 8, 8, 10];

class Aleatorio
{
  private nrEstado: number;

  constructor(nrSemente: number)
  {
    this.nrEstado = nrSemente;
  }

  proximo(): number
  {
    this.nrEstado = (this.nrEstado + 0x6d2b79f5) | 0;

    let nrValor = Math.imul(this.nrEstado ^ (this.nrEstado >>> 15), 1 | this.nrEstado);

    nrValor = (nrValor + Math.imul(nrValor ^ (nrValor >>> 7), 61 | nrValor)) ^ nrValor;

    return ((nrValor ^ (nrValor >>> 14)) >>> 0) / 4294967296;
  }

  inteiro(nrMinimo: number, nrMaximo: number): number
  {
    return nrMinimo + Math.floor(this.proximo() * (nrMaximo - nrMinimo + 1));
  }

  chance(nrProbabilidade: number): boolean
  {
    return this.proximo() < nrProbabilidade;
  }

  escolher<T>(arrOpcoes: T[]): T
  {
    if (arrOpcoes.length === 0)
      throw new Error('Não há opções para sortear.');

    return arrOpcoes[this.inteiro(0, arrOpcoes.length - 1)] as T;
  }

  escolherPonderado<T extends { peso: number }>(arrOpcoes: T[]): T
  {
    const nrTotal = arrOpcoes.reduce((nrSoma, opcao) => nrSoma + opcao.peso, 0);
    let nrSorteado = this.proximo() * nrTotal;

    for (const opcao of arrOpcoes)
    {
      nrSorteado -= opcao.peso;

      if (nrSorteado < 0)
        return opcao;
    }

    return arrOpcoes[arrOpcoes.length - 1] as T;
  }

  embaralhar<T>(arrOpcoes: T[]): T[]
  {
    const arrCopia = [...arrOpcoes];

    for (let nrIndice = arrCopia.length - 1; nrIndice > 0; nrIndice--)
    {
      const nrTroca = this.inteiro(0, nrIndice);

      [arrCopia[nrIndice], arrCopia[nrTroca]] = [arrCopia[nrTroca] as T, arrCopia[nrIndice] as T];
    }

    return arrCopia;
  }
}

type ItemSemeado = {
  idItem: number;
  nmItem: string;
  vlCentavos: number;
  idTipo: TipoItem;
  peso: number;
  idBebida: boolean;
  idSobremesa: boolean;
  idDisponivel: boolean;
  arrReceita: { idInsumo: number; nrMilesimos: number }[];
};

type ClienteSemeado = { idUsuario: number };
type MesaSemeada    = { idMesa: number; qtLugares: number };

type ParametrosComanda = {
  dtAbertura: Date;
  idUsuario: number;
  idCliente: number | null;
  idMesa: number | null;
  idReserva?: number;
  idSituacao: SituacaoComanda;
};

class PovoadorBanco
{
  private readonly aleatorio = new Aleatorio(NR_SEMENTE);
  private readonly dtAgora   = new Date();

  private arrGarcons: number[]            = [];
  private arrClientes: ClienteSemeado[]   = [];
  private arrMesas: MesaSemeada[]         = [];
  private arrItens: ItemSemeado[]         = [];
  private mapInsumos                      = new Map<string, { idInsumo: number; nrMinimo: number }>();

  private arrReservas: Prisma.ReservaCreateManyInput[]               = [];
  private arrComandas: Prisma.ComandaCreateManyInput[]               = [];
  private arrItensPedido: Prisma.ItemPedidoCreateManyInput[]         = [];
  private arrPagamentos: Prisma.PagamentoCreateManyInput[]           = [];
  private arrMovimentos: Prisma.MovimentoEstoqueCreateManyInput[]    = [];
  private mapConsumo                                                 = new Map<number, number>();
  private mapEstoqueFinal                                            = new Map<number, number>();

  private nrIdComanda   = 0;
  private nrIdItem      = 0;
  private nrIdPagamento = 0;
  private nrIdReserva   = 0;

  private nrCpfBase = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptService: CryptService,
  ) {}

  async popular()
  {
    await this.validarBancoVazio();

    const dsSenhaHash = await this.cryptService.gerarHashSenha(DS_SENHA_PADRAO);

    await this.prisma.$transaction(async (transacao) =>
    {
      await this.criarUsuarios(transacao, dsSenhaHash);
      await this.criarMesas(transacao);
      await this.criarCardapio(transacao);

      this.simularHistorico();
      this.simularSalaoAoVivo();
      this.simularReservasAvulsas();
      this.gerarMovimentosDeEstoque();

      await this.gravarEstoque(transacao);
      await this.gravarSimulacao(transacao);
      await this.ajustarSequencias(transacao);
    }, { timeout: 180_000, maxWait: 20_000 });

    this.imprimirResumo();
  }

  private async validarBancoVazio()
  {
    if (process.env.NODE_ENV === 'production')
      throw new Error('Este script é só para desenvolvimento e não roda com NODE_ENV=production.');

    const arrContagens = await Promise.all([
      this.prisma.mesa.count(),
      this.prisma.categoria.count(),
      this.prisma.itemCardapio.count(),
      this.prisma.insumo.count(),
      this.prisma.comanda.count(),
      this.prisma.reserva.count(),
    ]);

    if (arrContagens.some((nrContagem) => nrContagem > 0))
      throw new Error('O banco já tem dados. Para recomeçar do zero, rode: npx prisma migrate reset (e depois npm run seed).');
  }

  // ---------- base: usuários, mesas, cardápio e estoque ----------

  private gerarCpf(): string
  {
    // sequência única de 9 dígitos + 2 dígitos verificadores
    this.nrCpfBase += this.aleatorio.inteiro(7, 997);

    const arrBase = String(100_000_000 + this.nrCpfBase).slice(-9).split('').map(Number);
    const calcular = (arrDigitos: number[]) =>
    {
      const nrSoma   = arrDigitos.reduce((nrAcumulado, nrDigito, nrIndice) => nrAcumulado + nrDigito * (arrDigitos.length + 1 - nrIndice), 0);
      const nrResto  = (nrSoma * 10) % 11;

      return nrResto === 10 ? 0 : nrResto;
    };
    const nrPrimeiro = calcular(arrBase);
    const nrSegundo  = calcular([...arrBase, nrPrimeiro]);

    return [...arrBase, nrPrimeiro, nrSegundo].join('');
  }

  private async criarUsuario(transacao: Prisma.TransactionClient, dsSenhaHash: string, perfil: Perfil, dsApelido: string, nmPessoa: string)
  {
    const usuario = await transacao.usuario.create({
      data: {
        ds_apelido: dsApelido,
        ds_senha: dsSenhaHash,
        perfil,
        pessoa: {
          create: {
            nm_pessoa: nmPessoa,
            ds_cnpj_cpf: this.gerarCpf(),
            ds_email: `${dsApelido}@exemplo.com.br`,
            ds_telefone: `119${String(this.aleatorio.inteiro(10_000_000, 99_999_999))}`,
          },
        },
      },
    });

    return usuario.id_usuario;
  }

  private async criarUsuarios(transacao: Prisma.TransactionClient, dsSenhaHash: string)
  {
    const arrNomes = this.aleatorio.embaralhar(
      ARR_NOMES.flatMap((nmNome) => ARR_SOBRENOMES.map((nmSobrenome) => `${nmNome} ${nmSobrenome}`))
    );

    for (let nrIndice = 1; nrIndice <= 4; nrIndice++)
      this.arrGarcons.push(await this.criarUsuario(transacao, dsSenhaHash, Perfil.GARCOM, `garcom${nrIndice}`, arrNomes.pop() as string));

    for (let nrIndice = 1; nrIndice <= 2; nrIndice++)
      await this.criarUsuario(transacao, dsSenhaHash, Perfil.COZINHA, `cozinha${nrIndice}`, arrNomes.pop() as string);

    for (let nrIndice = 1; nrIndice <= NR_CLIENTES; nrIndice++)
    {
      const idUsuario = await this.criarUsuario(transacao, dsSenhaHash, Perfil.CLIENTE, `cliente${String(nrIndice).padStart(2, '0')}`, arrNomes.pop() as string);

      this.arrClientes.push({ idUsuario });
    }
  }

  private async criarMesas(transacao: Prisma.TransactionClient)
  {
    await transacao.mesa.createMany({
      data: ARR_LUGARES.map((qtLugares, nrIndice) => ({ nr_mesa: nrIndice + 1, qt_lugares: qtLugares })),
    });

    const arrMesas = await transacao.mesa.findMany({ orderBy: { nr_mesa: 'asc' } });

    this.arrMesas = arrMesas.map((mesa) => ({ idMesa: mesa.id_mesa, qtLugares: mesa.qt_lugares }));
  }

  private async criarCardapio(transacao: Prisma.TransactionClient)
  {
    const mapCategorias = new Map<string, number>();

    for (const nmCategoria of ARR_CATEGORIAS_PAI)
    {
      const categoria = await transacao.categoria.create({ data: { nm_categoria: nmCategoria } });

      mapCategorias.set(nmCategoria, categoria.id_categoria);
    }

    for (const nmCategoria of ARR_SUBCATEGORIAS)
    {
      const categoria = await transacao.categoria.create({
        data: { nm_categoria: nmCategoria, id_categoria_pai: mapCategorias.get('Bebidas') as number },
      });

      mapCategorias.set(nmCategoria, categoria.id_categoria);
    }

    for (const insumoBase of ARR_INSUMOS)
    {
      const insumo = await transacao.insumo.create({
        data: { nm_insumo: insumoBase.nm, unidade_medida: insumoBase.un, qt_estoque_minimo: insumoBase.min },
      });

      this.mapInsumos.set(insumoBase.nm, { idInsumo: insumo.id_insumo, nrMinimo: insumoBase.min });
    }

    for (const itemBase of ARR_ITENS)
    {
      const item = await transacao.itemCardapio.create({
        data: {
          id_categoria: mapCategorias.get(itemBase.categoria) as number,
          nm_item: itemBase.nm,
          ds_item: itemBase.ds,
          vl_unitario: itemBase.vl,
          tipo_item: itemBase.tipo,
          disponivel: itemBase.disponivel ?? true,
        },
      });
      const arrReceita = Object.entries(itemBase.receita).map(([nmInsumo, qtInsumo]) => ({
        idInsumo: (this.mapInsumos.get(nmInsumo) as { idInsumo: number }).idInsumo,
        nrMilesimos: Math.round(qtInsumo * 1000),
      }));

      await transacao.receita.createMany({
        data: arrReceita.map((receita) => ({
          id_item_cardapio: item.id_item_cardapio,
          id_insumo: receita.idInsumo,
          qt_insumo: receita.nrMilesimos / 1000,
        })),
      });

      this.arrItens.push({
        idItem: item.id_item_cardapio,
        nmItem: itemBase.nm,
        vlCentavos: Math.round(itemBase.vl * 100),
        idTipo: itemBase.tipo,
        peso: itemBase.peso,
        idBebida: ARR_SUBCATEGORIAS.includes(itemBase.categoria),
        idSobremesa: itemBase.categoria === 'Sobremesas',
        idDisponivel: itemBase.disponivel ?? true,
        arrReceita,
      });
    }
  }

  // ---------- simulação ----------

  private dataDoDia(nrDiasAtras: number, nrHora: number, nrMinuto: number): Date
  {
    const dtDia = new Date(this.dtAgora);

    dtDia.setDate(dtDia.getDate() - nrDiasAtras);
    dtDia.setHours(nrHora, nrMinuto, 0, 0);

    return dtDia;
  }

  private escolherItensDoPedido(flSoPreparados = false): { item: ItemSemeado; qtQuantidade: number }[]
  {
    const arrDisponiveis = this.arrItens.filter((item) => item.idDisponivel && (!flSoPreparados || item.idTipo === TipoItem.PREPARADO));
    const arrComidas     = arrDisponiveis.filter((item) => !item.idBebida && !item.idSobremesa);
    const arrBebidas     = arrDisponiveis.filter((item) => item.idBebida);
    const arrSobremesas  = arrDisponiveis.filter((item) => item.idSobremesa);
    const arrEscolhidos: ItemSemeado[] = [];

    for (let nrIndice = 0; nrIndice < this.aleatorio.inteiro(1, 3); nrIndice++)
      arrEscolhidos.push(this.aleatorio.escolherPonderado(arrComidas));

    if (!flSoPreparados && arrBebidas.length > 0 && this.aleatorio.chance(0.85))
    {
      for (let nrIndice = 0; nrIndice < this.aleatorio.inteiro(1, 2); nrIndice++)
        arrEscolhidos.push(this.aleatorio.escolherPonderado(arrBebidas));
    }

    if (!flSoPreparados && arrSobremesas.length > 0 && this.aleatorio.chance(0.2))
      arrEscolhidos.push(this.aleatorio.escolherPonderado(arrSobremesas));

    return arrEscolhidos.map((item) => ({ item, qtQuantidade: this.aleatorio.chance(0.75) ? 1 : this.aleatorio.inteiro(2, 3) }));
  }

  private consomeEstoque(item: ItemSemeado, idSituacao: SituacaoItemPedido): boolean
  {
    if (item.idTipo === TipoItem.REVENDA)
      return idSituacao !== SituacaoItemPedido.CANCELADO;

    return idSituacao === SituacaoItemPedido.EM_PREPARO
      || idSituacao === SituacaoItemPedido.PRONTO
      || idSituacao === SituacaoItemPedido.ENTREGUE;
  }

  // Situação que o item teria agora, de acordo com o tempo que passou desde o pedido.
  private situacaoPelaIdade(item: ItemSemeado, dtPedido: Date): SituacaoItemPedido
  {
    const nrMinutos = (this.dtAgora.getTime() - dtPedido.getTime()) / 60_000;

    if (item.idTipo === TipoItem.REVENDA)
      return nrMinutos > 8 ? SituacaoItemPedido.ENTREGUE : SituacaoItemPedido.PRONTO;

    if (nrMinutos < 6)
      return SituacaoItemPedido.AGUARDANDO;

    if (nrMinutos < 16)
      return SituacaoItemPedido.EM_PREPARO;

    return nrMinutos < 26 ? SituacaoItemPedido.PRONTO : SituacaoItemPedido.ENTREGUE;
  }

  private lancarItem(idComanda: number, item: ItemSemeado, qtQuantidade: number, dtPedido: Date, idSituacao: SituacaoItemPedido, idUsuario: number, idOrigem: OrigemPedido)
  {
    const nrIdItemPedido = ++this.nrIdItem;

    this.arrItensPedido.push({
      id_item_pedido: nrIdItemPedido,
      id_comanda: idComanda,
      id_item_cardapio: item.idItem,
      id_usuario: idUsuario,
      id_origem: idOrigem,
      qt_quantidade: qtQuantidade,
      vl_unitario: item.vlCentavos / 100,
      ds_observacao: this.aleatorio.chance(0.08) ? this.aleatorio.escolher(['Sem cebola', 'Bem passado', 'Sem gelo', 'Molho à parte']) : null,
      id_situacao: idSituacao,
      dt_pedido: dtPedido,
    });

    if (!this.consomeEstoque(item, idSituacao))
      return;

    const dtBaixa = item.idTipo === TipoItem.REVENDA
      ? dtPedido
      : new Date(Math.min(somarMinutos(dtPedido, this.aleatorio.inteiro(3, 8)).getTime(), this.dtAgora.getTime()));

    for (const receita of item.arrReceita)
    {
      const nrMilesimos = receita.nrMilesimos * qtQuantidade;

      this.mapConsumo.set(receita.idInsumo, (this.mapConsumo.get(receita.idInsumo) ?? 0) + nrMilesimos);
      this.arrMovimentos.push({
        id_insumo: receita.idInsumo,
        id_item_pedido: nrIdItemPedido,
        tipo_movimento: TipoMovimento.SAIDA,
        qt_movimento: nrMilesimos / 1000,
        ds_motivo: `Baixa do item de pedido #${nrIdItemPedido}`,
        dt_movimento: dtBaixa,
      });
    }
  }

  private criarComanda(parametros: ParametrosComanda): number
  {
    const nrIdComandaNova = ++this.nrIdComanda;

    this.arrComandas.push({
      id_comanda: nrIdComandaNova,
      id_usuario: parametros.idUsuario,
      id_cliente: parametros.idCliente,
      id_mesa: parametros.idMesa,
      id_reserva: parametros.idReserva ?? null,
      id_situacao: parametros.idSituacao,
      dt_abertura: parametros.dtAbertura,
      dt_fechamento: null,
    });

    return nrIdComandaNova;
  }

  private fecharComanda(idComanda: number, dtFechamento: Date, idSituacao: SituacaoComanda)
  {
    const comanda = this.arrComandas.find((registro) => registro.id_comanda === idComanda) as Prisma.ComandaCreateManyInput;

    comanda.id_situacao  = idSituacao;
    comanda.dt_fechamento = dtFechamento;
  }

  private sortearForma(): FormaPagamento
  {
    return this.aleatorio.escolherPonderado([
      { peso: 40, forma: FormaPagamento.PIX },
      { peso: 45, forma: FormaPagamento.CARTAO },
      { peso: 15, forma: FormaPagamento.DINHEIRO },
    ]).forma;
  }

  private registrarPagamento(idComanda: number, nrCentavos: number, forma: FormaPagamento, idSituacao: SituacaoPagamento, dtPagamento: Date)
  {
    this.arrPagamentos.push({
      id_pagamento: ++this.nrIdPagamento,
      id_comanda: idComanda,
      vl_pago: nrCentavos / 100,
      forma_pagamento: forma,
      id_situacao: idSituacao,
      dt_pagamento: idSituacao === SituacaoPagamento.PENDENTE ? null : dtPagamento,
    });
  }

  private pagarComanda(idComanda: number, nrCentavos: number, dtPagamento: Date, flRetirada: boolean)
  {
    if (this.aleatorio.chance(0.04))
      this.registrarPagamento(idComanda, nrCentavos, FormaPagamento.CARTAO, SituacaoPagamento.RECUSADO, somarMinutos(dtPagamento, -2));

    if (!flRetirada && nrCentavos > 4000 && this.aleatorio.chance(0.25))
    {
      const nrPrimeira = Math.round(nrCentavos / 2);

      this.registrarPagamento(idComanda, nrPrimeira, this.sortearForma(), SituacaoPagamento.CONFIRMADO, dtPagamento);
      this.registrarPagamento(idComanda, nrCentavos - nrPrimeira, this.sortearForma(), SituacaoPagamento.CONFIRMADO, dtPagamento);
      return;
    }

    this.registrarPagamento(idComanda, nrCentavos, flRetirada ? FormaPagamento.PIX : this.sortearForma(), SituacaoPagamento.CONFIRMADO, dtPagamento);
  }

  private quantidadeDeComandasDoDia(nrDiasAtras: number): number
  {
    const nrDiaSemana = this.dataDoDia(nrDiasAtras, 12, 0).getDay();

    // sexta, sábado e domingo são mais movimentados
    return nrDiaSemana === 0 || nrDiaSemana === 5 || nrDiaSemana === 6
      ? this.aleatorio.inteiro(26, 38)
      : this.aleatorio.inteiro(14, 20);
  }

  private simularHistorico()
  {
    for (let nrDiasAtras = NR_DIAS_HISTORICO; nrDiasAtras >= 1; nrDiasAtras--)
    {
      const nrComandas = this.quantidadeDeComandasDoDia(nrDiasAtras);

      for (let nrIndice = 0; nrIndice < nrComandas; nrIndice++)
        this.simularComandaHistorica(this.dataDoDia(nrDiasAtras, this.aleatorio.inteiro(11, 22), this.aleatorio.inteiro(0, 59)));
    }

    // algumas comandas já encerradas hoje, para o relatório do dia não começar zerado
    for (let nrIndice = 0; nrIndice < 6; nrIndice++)
      this.simularComandaHistorica(new Date(this.dtAgora.getTime() - this.aleatorio.inteiro(150, 480) * 60_000));
  }

  private simularComandaHistorica(dtAbertura: Date)
  {
    const flRetirada  = this.aleatorio.chance(0.22);
    const flCancelada = this.aleatorio.chance(0.06);
    const cliente     = this.aleatorio.escolher(this.arrClientes);
    const mesa        = this.aleatorio.escolher(this.arrMesas);
    const idGarcom    = this.aleatorio.escolher(this.arrGarcons);
    const flReserva   = !flRetirada && !flCancelada && this.aleatorio.chance(0.1);
    const idUsuario   = flRetirada ? cliente.idUsuario : idGarcom;
    const idOrigem    = flRetirada ? OrigemPedido.APP : OrigemPedido.SALAO;
    const idCliente   = flRetirada || flReserva || this.aleatorio.chance(0.4) ? cliente.idUsuario : null;
    const idReserva   = flReserva ? this.criarReservaDeCheckin(cliente.idUsuario, mesa, dtAbertura) : undefined;

    const idComanda = this.criarComanda({
      dtAbertura,
      idUsuario,
      idCliente,
      idMesa: flRetirada ? null : mesa.idMesa,
      idReserva,
      idSituacao: SituacaoComanda.ABERTA,
    });

    const arrPedido  = this.escolherItensDoPedido(flCancelada);
    let nrCentavos   = 0;
    let dtUltimoItem = dtAbertura;

    arrPedido.forEach(({ item, qtQuantidade }, nrPosicao) =>
    {
      const dtPedido    = item.idSobremesa
        ? somarMinutos(dtAbertura, this.aleatorio.inteiro(35, 55))
        : somarMinutos(dtAbertura, this.aleatorio.inteiro(1, 8));
      const flCancelado = flCancelada || (nrPosicao > 0 && item.idTipo === TipoItem.PREPARADO && this.aleatorio.chance(0.04));
      const idSituacao  = flCancelado ? SituacaoItemPedido.CANCELADO : SituacaoItemPedido.ENTREGUE;

      this.lancarItem(idComanda, item, qtQuantidade, dtPedido, idSituacao, idUsuario, idOrigem);

      if (!flCancelado)
        nrCentavos += item.vlCentavos * qtQuantidade;

      if (dtPedido > dtUltimoItem)
        dtUltimoItem = dtPedido;
    });

    const dtFechamento = somarMinutos(dtUltimoItem, this.aleatorio.inteiro(25, 60));

    if (flCancelada)
    {
      this.fecharComanda(idComanda, somarMinutos(dtAbertura, this.aleatorio.inteiro(5, 15)), SituacaoComanda.CANCELADA);
      return;
    }

    this.fecharComanda(idComanda, dtFechamento, SituacaoComanda.FECHADA);
    this.pagarComanda(idComanda, nrCentavos, somarMinutos(dtFechamento, -this.aleatorio.inteiro(0, 4)), flRetirada);
  }

  private criarReservaDeCheckin(idUsuario: number, mesa: MesaSemeada, dtAbertura: Date): number
  {
    const dtReserva = somarMinutos(dtAbertura, -this.aleatorio.inteiro(0, 10));
    const nrIdReserva = ++this.nrIdReserva;

    this.arrReservas.push({
      id_reserva: nrIdReserva,
      id_usuario: idUsuario,
      id_mesa: mesa.idMesa,
      qt_pessoas: this.aleatorio.inteiro(2, Math.min(mesa.qtLugares, 8)),
      dt_reserva: dtReserva,
      dt_limite_checkin: somarMinutos(dtReserva, NR_MINUTOS_TOLERANCIA_CHECKIN),
      dt_checkin: dtAbertura,
      id_situacao: SituacaoReserva.CHECKIN,
      dt_criacao: new Date(dtReserva.getTime() - this.aleatorio.inteiro(1, 72) * 3_600_000),
    });

    return nrIdReserva;
  }

  private simularSalaoAoVivo()
  {
    const arrMesasLivres = this.aleatorio.embaralhar(this.arrMesas);

    // 8 comandas abertas no salão, em momentos diferentes do atendimento
    for (let nrIndice = 0; nrIndice < 8; nrIndice++)
    {
      const mesa        = arrMesasLivres.pop() as MesaSemeada;
      const idGarcom    = this.aleatorio.escolher(this.arrGarcons);
      const dtAbertura  = new Date(this.dtAgora.getTime() - this.aleatorio.inteiro(8, 85) * 60_000);
      const idCliente   = this.aleatorio.chance(0.4) ? this.aleatorio.escolher(this.arrClientes).idUsuario : null;
      const idComanda   = this.criarComanda({ dtAbertura, idUsuario: idGarcom, idCliente, idMesa: mesa.idMesa, idSituacao: SituacaoComanda.ABERTA });
      let nrCentavos    = 0;

      for (const { item, qtQuantidade } of this.escolherItensDoPedido())
      {
        const dtPedido = item.idSobremesa
          ? somarMinutos(dtAbertura, this.aleatorio.inteiro(35, 55))
          : somarMinutos(dtAbertura, this.aleatorio.inteiro(1, 8));

        if (dtPedido > this.dtAgora)
          continue;

        this.lancarItem(idComanda, item, qtQuantidade, dtPedido, this.situacaoPelaIdade(item, dtPedido), idGarcom, OrigemPedido.SALAO);
        nrCentavos += item.vlCentavos * qtQuantidade;
      }

      // uma das comandas já tem um pagamento parcial
      if (nrIndice === 0 && nrCentavos > 3000)
        this.registrarPagamento(idComanda, Math.round(nrCentavos / 3), FormaPagamento.PIX, SituacaoPagamento.CONFIRMADO, this.dtAgora);
    }

    // 3 pedidos de retirada feitos pelo app, com pagamentos diferentes
    for (let nrIndice = 0; nrIndice < 3; nrIndice++)
    {
      const cliente    = this.aleatorio.escolher(this.arrClientes);
      const dtAbertura = new Date(this.dtAgora.getTime() - this.aleatorio.inteiro(2, 22) * 60_000);
      const idComanda  = this.criarComanda({ dtAbertura, idUsuario: cliente.idUsuario, idCliente: cliente.idUsuario, idMesa: null, idSituacao: SituacaoComanda.ABERTA });
      let nrCentavos   = 0;

      for (const { item, qtQuantidade } of this.escolherItensDoPedido())
      {
        this.lancarItem(idComanda, item, qtQuantidade, dtAbertura, this.situacaoPelaIdade(item, dtAbertura), cliente.idUsuario, OrigemPedido.APP);
        nrCentavos += item.vlCentavos * qtQuantidade;
      }

      if (nrIndice < 2)
        this.registrarPagamento(idComanda, nrCentavos, FormaPagamento.PIX, SituacaoPagamento.CONFIRMADO, dtAbertura);
      else
        this.registrarPagamento(idComanda, nrCentavos, FormaPagamento.CARTAO, SituacaoPagamento.PENDENTE, dtAbertura);
    }

    // duas reservas para daqui a pouco, em mesas que estão livres
    for (const nrMinutos of [40, 170])
    {
      const mesa = arrMesasLivres.pop() as MesaSemeada;

      this.criarReserva(this.aleatorio.escolher(this.arrClientes).idUsuario, mesa, new Date(this.dtAgora.getTime() + nrMinutos * 60_000), SituacaoReserva.CONFIRMADA);
    }
  }

  private criarReserva(idUsuario: number, mesa: MesaSemeada, dtReserva: Date, idSituacao: SituacaoReserva)
  {
    this.arrReservas.push({
      id_reserva: ++this.nrIdReserva,
      id_usuario: idUsuario,
      id_mesa: mesa.idMesa,
      qt_pessoas: this.aleatorio.inteiro(2, Math.min(mesa.qtLugares, 8)),
      dt_reserva: dtReserva,
      dt_limite_checkin: somarMinutos(dtReserva, NR_MINUTOS_TOLERANCIA_CHECKIN),
      dt_checkin: null,
      id_situacao: idSituacao,
      dt_criacao: new Date(Math.min(dtReserva.getTime(), this.dtAgora.getTime()) - this.aleatorio.inteiro(1, 96) * 3_600_000),
    });
  }

  private simularReservasAvulsas()
  {
    // passado: reservas canceladas e expiradas (cliente não apareceu)
    for (let nrIndice = 0; nrIndice < 45; nrIndice++)
    {
      const idSituacao = this.aleatorio.chance(0.55) ? SituacaoReserva.CANCELADA : SituacaoReserva.EXPIRADA;

      this.criarReserva(
        this.aleatorio.escolher(this.arrClientes).idUsuario,
        this.aleatorio.escolher(this.arrMesas),
        this.dataDoDia(this.aleatorio.inteiro(1, NR_DIAS_HISTORICO), this.aleatorio.escolher([12, 15, 19, 21]), 0),
        idSituacao
      );
    }

    // próximos 7 dias: uma reserva por mesa/dia/horário, sem conflito de horário
    const arrHorarios = [12, 15, 19, 21];
    const setOcupados = new Set<string>();

    for (let nrDia = 1; nrDia <= 7; nrDia++)
    {
      for (let nrIndice = 0; nrIndice < this.aleatorio.inteiro(3, 6); nrIndice++)
      {
        const mesa      = this.aleatorio.escolher(this.arrMesas);
        const nrHorario = this.aleatorio.escolher(arrHorarios);
        const dsChave   = `${mesa.idMesa}-${nrDia}-${nrHorario}`;

        if (setOcupados.has(dsChave))
          continue;

        setOcupados.add(dsChave);

        const idSituacao = this.aleatorio.chance(0.12) ? SituacaoReserva.CANCELADA : SituacaoReserva.CONFIRMADA;

        this.criarReserva(this.aleatorio.escolher(this.arrClientes).idUsuario, mesa, this.dataDoDia(-nrDia, nrHorario, 0), idSituacao);
      }
    }
  }

  // ---------- estoque ----------

  private gerarMovimentosDeEstoque()
  {
    // perdas (validade, quebra) espalhadas pelo período
    const arrIdsInsumos = [...this.mapInsumos.values()].map((insumo) => insumo.idInsumo);

    for (let nrIndice = 0; nrIndice < 12; nrIndice++)
    {
      const idInsumo    = this.aleatorio.escolher(arrIdsInsumos);
      const nrMilesimos = this.aleatorio.inteiro(1, 6) * 100;

      this.mapConsumo.set(idInsumo, (this.mapConsumo.get(idInsumo) ?? 0) + nrMilesimos);
      this.arrMovimentos.push({
        id_insumo: idInsumo,
        tipo_movimento: TipoMovimento.PERDA,
        qt_movimento: nrMilesimos / 1000,
        ds_motivo: this.aleatorio.escolher(['Validade vencida', 'Quebra ou desperdício']),
        dt_movimento: this.dataDoDia(this.aleatorio.inteiro(1, NR_DIAS_HISTORICO - 1), 16, 0),
      });
    }
  }

  private async gravarEstoque(transacao: Prisma.TransactionClient)
  {
    const arrInsumos       = [...this.mapInsumos.values()];
    const setEstoqueBaixo  = new Set(this.aleatorio.embaralhar(arrInsumos).slice(0, 4).map((insumo) => insumo.idInsumo));
    const arrEntregas      = [{ nrDias: NR_DIAS_HISTORICO + 1, nrParte: 0.55 }, { nrDias: 18, nrParte: 0.3 }, { nrDias: 7, nrParte: 0.15 }];

    for (const insumo of arrInsumos)
    {
      const nrConsumo = this.mapConsumo.get(insumo.idInsumo) ?? 0;
      const nrFator   = setEstoqueBaixo.has(insumo.idInsumo) ? 0.2 + this.aleatorio.proximo() * 0.6 : 1.6 + this.aleatorio.proximo() * 2.4;
      const nrFinal   = Math.round(insumo.nrMinimo * nrFator * 1000);
      const nrEntrada = nrConsumo + nrFinal;
      let nrLancado   = 0;

      arrEntregas.forEach((entrega, nrPosicao) =>
      {
        const nrMilesimos = nrPosicao === arrEntregas.length - 1 ? nrEntrada - nrLancado : Math.round(nrEntrada * entrega.nrParte);

        nrLancado += nrMilesimos;
        this.arrMovimentos.push({
          id_insumo: insumo.idInsumo,
          tipo_movimento: TipoMovimento.ENTRADA,
          qt_movimento: nrMilesimos / 1000,
          ds_motivo: 'Compra de reposição',
          dt_movimento: this.dataDoDia(entrega.nrDias, 8, 0),
        });
      });

      this.mapEstoqueFinal.set(insumo.idInsumo, nrFinal);
    }

    for (const [idInsumo, nrMilesimos] of this.mapEstoqueFinal)
      await transacao.insumo.update({ where: { id_insumo: idInsumo }, data: { qt_estoque: nrMilesimos / 1000 } });
  }

  // ---------- gravação ----------

  private async gravarEmLotes<T>(arrRegistros: T[], gravar: (arrLote: T[]) => Promise<unknown>)
  {
    for (let nrInicio = 0; nrInicio < arrRegistros.length; nrInicio += NR_TAMANHO_LOTE)
      await gravar(arrRegistros.slice(nrInicio, nrInicio + NR_TAMANHO_LOTE));
  }

  private async gravarSimulacao(transacao: Prisma.TransactionClient)
  {
    await this.gravarEmLotes(this.arrReservas, (arrLote) => transacao.reserva.createMany({ data: arrLote }));
    await this.gravarEmLotes(this.arrComandas, (arrLote) => transacao.comanda.createMany({ data: arrLote }));
    await this.gravarEmLotes(this.arrItensPedido, (arrLote) => transacao.itemPedido.createMany({ data: arrLote }));
    await this.gravarEmLotes(this.arrPagamentos, (arrLote) => transacao.pagamento.createMany({ data: arrLote }));
    await this.gravarEmLotes(this.arrMovimentos, (arrLote) => transacao.movimentoEstoque.createMany({ data: arrLote }));
  }

  // Os registros foram gravados com id definido, então as sequências precisam continuar depois do maior id.
  private async ajustarSequencias(transacao: Prisma.TransactionClient)
  {
    const arrTabelas = [
      { tabela: 'Reserva', coluna: 'id_reserva' },
      { tabela: 'Comanda', coluna: 'id_comanda' },
      { tabela: 'ItemPedido', coluna: 'id_item_pedido' },
      { tabela: 'Pagamento', coluna: 'id_pagamento' },
      { tabela: 'MovimentoEstoque', coluna: 'id_movimento_estoque' },
    ];

    for (const { tabela, coluna } of arrTabelas)
      await transacao.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${tabela}"', '${coluna}'), COALESCE((SELECT MAX("${coluna}") FROM "${tabela}"), 1))`);
  }

  private imprimirResumo()
  {
    const qtFechadas = this.arrComandas.filter((comanda) => comanda.id_situacao === SituacaoComanda.FECHADA).length;
    const qtAbertas  = this.arrComandas.filter((comanda) => comanda.id_situacao === SituacaoComanda.ABERTA).length;

    console.log('Banco populado com sucesso:');
    console.log(`  ${this.arrGarcons.length} garçons, 2 cozinheiros e ${this.arrClientes.length} clientes`);
    console.log(`  ${this.arrMesas.length} mesas, ${ARR_CATEGORIAS_PAI.length + ARR_SUBCATEGORIAS.length} categorias, ${this.arrItens.length} itens de cardápio e ${this.mapInsumos.size} insumos`);
    console.log(`  ${this.arrComandas.length} comandas (${qtFechadas} fechadas, ${qtAbertas} abertas agora) e ${this.arrItensPedido.length} itens de pedido`);
    console.log(`  ${this.arrPagamentos.length} pagamentos, ${this.arrReservas.length} reservas e ${this.arrMovimentos.length} movimentos de estoque`);
    console.log(`Logins de teste: garcom1..garcom4, cozinha1, cozinha2, cliente01..cliente${NR_CLIENTES}  |  senha: ${DS_SENHA_PADRAO}`);
  }
}

async function popularBanco()
{
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

  try
  {
    await new PovoadorBanco(app.get(PrismaService), app.get(CryptService)).popular();
  }
  finally
  {
    await app.close();
  }
}

popularBanco().catch((erro: Error) =>
{
  console.error(erro.message);
  process.exitCode = 1;
});
