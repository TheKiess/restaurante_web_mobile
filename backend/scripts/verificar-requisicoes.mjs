// Quem fez esse arquivo de verificação de requisição foi o claude também.
// Roda todas as requisições de um arquivo .http e confere o status esperado de cada uma.
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

  const leitor = createInterface({ input: process.stdin, output: process.stdout });
  let qtRequisicoes = 0;
  let qtFalhas      = 0;

  for (const bloco of lerBlocos(dsConteudo))
  {
    const requisicao = montarRequisicao(bloco, dsHost);

    if (!requisicao)
    {
      if (/reinicie a api/i.test(bloco.dsTitulo))
      {
        await leitor.question('\nReinicie a API agora (Ctrl+C e npm run start:dev) e aperte Enter para continuar... ');
        console.log('');
        await aguardarApi(dsHost);
      }
      continue;
    }

    const nrEsperado = Number(bloco.dsTitulo.match(/espera (\d{3})/)?.[1]);
    const resposta   = await fetch(requisicao.dsUrl, {
      method: requisicao.dsMetodo,
      headers: requisicao.objCabecalhos,
      body: requisicao.dsCorpo || undefined,
    });
    const dsResposta = await resposta.text();
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
