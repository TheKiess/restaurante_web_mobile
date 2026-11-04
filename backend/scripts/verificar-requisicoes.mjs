// Quem fez esse arquivo de verificação de requisição foi o claude também.
// Roda todas as requisições de um arquivo .http e confere o status esperado de cada uma.
// Entende as variáveis do arquivo (@nome = valor) e as respostas guardadas com "# @name",
// como {{loginGerencia.response.body.ds_token}}.
// Uso (com a API rodando): node scripts/verificar-requisicoes.mjs [requisicoes.http]

import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';

const DS_CAMINHO       = process.argv[2] ?? 'requisicoes.http';
const REGEX_REQUISICAO = /^(GET|POST|PUT|PATCH|DELETE)\s+(\S+)/;

function lerBlocos(dsConteudo)
{
  const arrBlocos = [];

  for (const dsLinha of dsConteudo.split('\n'))
  {
    if (dsLinha.startsWith('###'))
      arrBlocos.push({ dsTitulo: dsLinha.slice(3).trim(), arrLinhas: [] });
    else if (arrBlocos.length > 0)
      arrBlocos[arrBlocos.length - 1].arrLinhas.push(dsLinha);
  }

  return arrBlocos;
}

function montarRequisicao(bloco, dsHost)
{
  const nrLinhaRequisicao = bloco.arrLinhas.findIndex((dsLinha) => REGEX_REQUISICAO.test(dsLinha));
  if (nrLinhaRequisicao === -1)
    return null;

  const [, dsMetodo, dsDestino] = bloco.arrLinhas[nrLinhaRequisicao].match(REGEX_REQUISICAO);
  const objCabecalhos = {};
  let nrLinha = nrLinhaRequisicao + 1;

  while (nrLinha < bloco.arrLinhas.length && bloco.arrLinhas[nrLinha].trim() !== '')
  {
    const arrCabecalho = bloco.arrLinhas[nrLinha].match(/^([A-Za-z-]+):\s*(.*)$/);
    if (arrCabecalho)
      objCabecalhos[arrCabecalho[1]] = arrCabecalho[2];
    nrLinha++;
  }

  const dsCorpo = bloco.arrLinhas.slice(nrLinha + 1).join('\n').trim();
  return { dsMetodo, dsUrl: dsDestino.replace('{{host}}', dsHost), objCabecalhos, dsCorpo };
}

function lerVariaveis(dsConteudo)
{
  const objVariaveis = {};

  for (const [, dsNome, dsValor] of dsConteudo.matchAll(/^@(\w+)\s*=\s*(.+)$/gm))
    objVariaveis[dsNome] = dsValor.trim();

  return objVariaveis;
}

function lerNomeDaRequisicao(bloco)
{
  for (const dsLinha of bloco.arrLinhas)
  {
    const arrNome = dsLinha.match(/^#\s*@name\s+(\w+)/);

    if (arrNome)
      return arrNome[1];
  }

  return null;
}

function buscarNoCaminho(objOrigem, dsCaminho)
{
  return dsCaminho.split('.').reduce((objAtual, dsParte) => objAtual?.[dsParte], objOrigem);
}

const OBJ_MILISSEGUNDOS_POR_UNIDADE = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000, w: 604_800_000 };

// Entende {{$datetime iso8601 3 d}}, como o REST Client do VS Code (unidades: s, m, h, d, w).
function gerarDataRelativa(dsExpressao)
{
  const arrPartes     = dsExpressao.split(/\s+/);
  const nrDeslocamento = Number(arrPartes[2] ?? 0);
  const nrUnidade      = OBJ_MILISSEGUNDOS_POR_UNIDADE[arrPartes[3] ?? 's'];

  return new Date(Date.now() + nrDeslocamento * nrUnidade).toISOString();
}

function resolver(dsTexto, objVariaveis, objRespostas)
{
  return dsTexto.replace(/\{\{([^}]+)\}\}/g, (dsOriginal, dsExpressao) =>
  {
    const dsChave = dsExpressao.trim();

    if (dsChave.startsWith('$datetime'))
      return gerarDataRelativa(dsChave);

    if (dsChave in objVariaveis)
      return resolver(objVariaveis[dsChave], objVariaveis, objRespostas);

    const arrResposta  = dsChave.match(/^(\w+)\.response\.body\.(.+)$/);
    const vlEncontrado = arrResposta ? buscarNoCaminho(objRespostas[arrResposta[1]]?.body, arrResposta[2]) : undefined;

    return vlEncontrado === undefined ? dsOriginal : String(vlEncontrado);
  });
}

async function perguntar(leitor, dsPergunta)
{
  try
  {
    await leitor.question(dsPergunta);
  }
  catch
  {
    // sem teclado (entrada fechada): segue sem esperar
  }
}

async function aguardarApi(dsHost)
{
  for (let nrTentativa = 0; nrTentativa < 30; nrTentativa++)
  {
    try
    {
      await fetch(dsHost);
      return true;
    }
    catch
    {
      await new Promise((resolver) => setTimeout(resolver, 500));
    }
  }

  return false;
}

async function verificar()
{
  const dsConteudo = readFileSync(DS_CAMINHO, 'utf8');
  const dsHost = dsConteudo.match(/^@host\s*=\s*(\S+)/m)?.[1] ?? 'http://localhost:3000';

  if (!(await aguardarApi(dsHost)))
  {
    console.log(`Não consegui falar com ${dsHost}. A API está rodando (npm run start:dev)?`);
    process.exit(1);
  }

  const objVariaveis = lerVariaveis(dsConteudo);
  const objRespostas = {};
  const leitor       = createInterface({ input: process.stdin, output: process.stdout });
  let qtRequisicoes = 0;
  let qtFalhas      = 0;

  for (const bloco of lerBlocos(dsConteudo))
  {
    const requisicao = montarRequisicao(bloco, dsHost);

    if (!requisicao)
    {
      if (/reinicie a api/i.test(bloco.dsTitulo))
      {
        await perguntar(leitor, '\nReinicie a API agora (Ctrl+C e npm run start:dev) e aperte Enter para continuar... ');
        console.log('');
        await aguardarApi(dsHost);
      }
      continue;
    }

    const nrEsperado   = Number(bloco.dsTitulo.match(/espera (\d{3})/)?.[1]);
    const objCabecalho = Object.fromEntries(Object.entries(requisicao.objCabecalhos).map(([dsNome, dsValor]) => [dsNome, resolver(dsValor, objVariaveis, objRespostas)]));
    const dsCorpo      = resolver(requisicao.dsCorpo, objVariaveis, objRespostas);
    const resposta     = await fetch(resolver(requisicao.dsUrl, objVariaveis, objRespostas), {
      method: requisicao.dsMetodo,
      headers: objCabecalho,
      body: dsCorpo || undefined,
    });
    const dsResposta     = await resposta.text();
    const dsNomeGuardado = lerNomeDaRequisicao(bloco);

    if (dsNomeGuardado)
      objRespostas[dsNomeGuardado] = { status: resposta.status, body: dsResposta ? JSON.parse(dsResposta) : null };

    const flOk = resposta.status === nrEsperado;
    qtRequisicoes++;

    if (!flOk)
      qtFalhas++;

    console.log(`${flOk ? 'OK    ' : 'FALHOU'} ${bloco.dsTitulo}${flOk ? '' : `  -> obtido ${resposta.status}: ${dsResposta.slice(0, 200)}`}`);
  }

  leitor.close();
  console.log(`\n${qtRequisicoes} requisições, ${qtFalhas} com status diferente do esperado`);
  process.exit(qtFalhas === 0 ? 0 : 1);
}

await verificar();
