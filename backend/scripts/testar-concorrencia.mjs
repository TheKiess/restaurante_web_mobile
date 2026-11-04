/**
 * Testa o que acontece quando várias pessoas fazem a mesma coisa ao mesmo tempo.
 * Uso (com a API rodando): node scripts/testar-concorrencia.mjs
 * Cria dados de teste próprios (mesas, usuário e itens com sufixo único), pode rodar várias vezes.
 * 
 * SCRIPT GERADO PELO CLAUDE!
 */

const DS_URL    = process.env.API_URL;
const DS_LOGIN  = process.env.ADMIN_APELIDO;
const DS_SENHA  = process.env.ADMIN_SENHA;
const DS_SUFIXO = String(Date.now()).slice(-7);

let nrFalhas = 0;

async function requisitar(dsMetodo, dsCaminho, objCorpo, dsToken)
{
  const resposta = await fetch(`${DS_URL}${dsCaminho}`, {
    method: dsMetodo,
    headers: { 'Content-Type': 'application/json', ...(dsToken ? { Authorization: `Bearer ${dsToken}` } : {}) },
    body: objCorpo === undefined ? undefined : JSON.stringify(objCorpo),
  });
  const dsTexto = await resposta.text();

  return { nrStatus: resposta.status, objDados: dsTexto ? JSON.parse(dsTexto) : null };
}

async function criar(dsCaminho, objCorpo, dsToken)
{
  const { nrStatus, objDados } = await requisitar('POST', dsCaminho, objCorpo, dsToken);

  if (nrStatus !== 201 && nrStatus !== 200)
    throw new Error(`Falha preparando o teste (${dsCaminho}): ${nrStatus} ${JSON.stringify(objDados)}`);

  return objDados;
}

function conferir(dsTitulo, flOk, dsDetalhe)
{
  if (!flOk)
    nrFalhas++;

  console.log(`${flOk ? 'OK    ' : 'FALHOU'} ${dsTitulo} (${dsDetalhe})`);
}

async function main()
{
  const { ds_token: dsTokenGerente } = await criar('/auth/login', { ds_login: DS_LOGIN, ds_senha: DS_SENHA });
  const { id_categoria }             = await criar('/categorias', { nm_categoria: `Teste ${DS_SUFIXO}` }, dsTokenGerente);
  const itemRevenda                  = await criar('/itens-cardapio', { id_categoria, nm_item: `Refri ${DS_SUFIXO}`, vl_unitario: 10, tipo_item: 'REVENDA' }, dsTokenGerente);
  const { id_usuario }               = await criar('/usuarios', { nm_pessoa: 'Garcom Teste', ds_apelido: `garcom${DS_SUFIXO}`, ds_senha: 'senha123', perfil: 'GARCOM' }, dsTokenGerente);
  const { ds_token: dsToken }        = await criar('/auth/login', { ds_login: `garcom${DS_SUFIXO}`, ds_senha: 'senha123' });

  const entregarItem = async (nrIdComanda, nrQuantidade) =>
  {
    const item = await criar('/itens-pedido', { id_comanda: nrIdComanda, id_item_cardapio: itemRevenda.id_item_cardapio, qt_quantidade: nrQuantidade }, dsToken);
    await requisitar('PATCH', `/itens-pedido/${item.id_item_pedido}/situacao`, { id_situacao: 'ENTREGUE' }, dsToken);
  };

  console.log('1) 12 garçons abrindo comanda na mesma mesa ao mesmo tempo');

  for (let nrRodada = 1; nrRodada <= 5; nrRodada++)
  {
    const { id_mesa } = await criar('/mesas', { nr_mesa: Number(DS_SUFIXO) * 10 + nrRodada, qt_lugares: 4 }, dsTokenGerente);
    const arrRespostas = await Promise.all(Array.from({ length: 12 }, () => requisitar('POST', '/comandas', { id_usuario, id_mesa }, dsToken)));
    const nrAbertas    = arrRespostas.filter((resposta) => resposta.nrStatus === 201).length;

    conferir(`rodada ${nrRodada}: só uma comanda aberta na mesa`, nrAbertas === 1, `${nrAbertas} aberta(s)`);
  }

  console.log('\n2) 10 pagamentos de R$ 50 ao mesmo tempo numa comanda de R$ 50');

  for (let nrRodada = 1; nrRodada <= 5; nrRodada++)
  {
    const { id_comanda } = await criar('/comandas', { id_usuario }, dsToken);
    await entregarItem(id_comanda, 5);

    await Promise.all(Array.from({ length: 10 }, () => requisitar('POST', '/pagamentos', { id_comanda, vl_pago: 50, forma_pagamento: 'DINHEIRO' }, dsToken)));
    const { objDados } = await requisitar('GET', `/comandas/${id_comanda}`, undefined, dsToken);

    conferir(`rodada ${nrRodada}: pago não passa do total`, Number(objDados.vl_pago) === Number(objDados.vl_total), `pago ${objDados.vl_pago} de ${objDados.vl_total}`);
  }

  console.log('\n3) fechar a comanda e lançar item ao mesmo tempo');

  let nrComandasErradas = 0;

  for (let nrRodada = 1; nrRodada <= 20; nrRodada++)
  {
    const { id_comanda } = await criar('/comandas', { id_usuario }, dsToken);
    await entregarItem(id_comanda, 1);
    await requisitar('POST', '/pagamentos', { id_comanda, vl_pago: 10, forma_pagamento: 'DINHEIRO' }, dsToken);

    await Promise.all([
      requisitar('PATCH', `/comandas/${id_comanda}/fechar`, undefined, dsToken),
      requisitar('POST', '/itens-pedido', { id_comanda, id_item_cardapio: itemRevenda.id_item_cardapio, qt_quantidade: 1 }, dsToken),
    ]);

    const { objDados } = await requisitar('GET', `/comandas/${id_comanda}`, undefined, dsToken);

    if (objDados.id_situacao === 'FECHADA' && Number(objDados.vl_restante) > 0)
      nrComandasErradas++;
  }

  conferir('nenhuma comanda fechada com item sem pagar', nrComandasErradas === 0, `${nrComandasErradas} de 20 rodadas erradas`);

  console.log(nrFalhas === 0 ? '\nTudo certo.' : `\n${nrFalhas} verificação(ões) falharam.`);
  process.exit(nrFalhas === 0 ? 0 : 1);
}

main().catch((erro) =>
{
  console.error(erro.message);
  process.exit(1);
});
