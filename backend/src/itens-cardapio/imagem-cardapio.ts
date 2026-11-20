import { randomUUID }                        from 'node:crypto';
import { mkdir, unlink, writeFile }          from 'node:fs/promises';
import { basename, join }                    from 'node:path';

export type ArquivoEnviado = {
  buffer: Buffer;
  size: number;
};

export const NR_TAMANHO_MAXIMO_IMAGEM = 2 * 1024 * 1024;
export const DS_DIRETORIO_UPLOADS     = join(process.cwd(), 'uploads');

const DS_PASTA_CARDAPIO  = 'cardapio';
const DS_PREFIXO_PUBLICO = `/uploads/${DS_PASTA_CARDAPIO}`;
const BUF_ASSINATURA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * Olha os primeiros bytes do arquivo, porque a extensão e o mimetype
 * enviados pelo cliente podem ser falsos.
 */
export function identificarTipoImagem(bufArquivo: Buffer): 'jpg' | 'png' | 'webp' | undefined
{
  if (bufArquivo.length >= 3 && bufArquivo[0] === 0xff && bufArquivo[1] === 0xd8 && bufArquivo[2] === 0xff)
    return 'jpg';
  if (bufArquivo.length >= 8 && bufArquivo.subarray(0, 8).equals(BUF_ASSINATURA_PNG))
    return 'png';
  if (bufArquivo.length >= 12 && bufArquivo.toString('ascii', 0, 4) === 'RIFF' && bufArquivo.toString('ascii', 8, 12) === 'WEBP')
    return 'webp';

  return undefined;
}

// Devolve o caminho público que vai para o banco, ex.: /uploads/cardapio/<uuid>.jpg
export async function gravarImagemCardapio(bufArquivo: Buffer, dsExtensao: string)
{
  const dsNomeArquivo = `${randomUUID()}.${dsExtensao}`;

  await mkdir(join(DS_DIRETORIO_UPLOADS, DS_PASTA_CARDAPIO), { recursive: true });
  await writeFile(join(DS_DIRETORIO_UPLOADS, DS_PASTA_CARDAPIO, dsNomeArquivo), bufArquivo);

  return `${DS_PREFIXO_PUBLICO}/${dsNomeArquivo}`;
}

// Só apaga arquivo que está dentro da pasta de uploads do cardápio, e ignora se ele já não existir.
export async function apagarImagemCardapio(dsCaminho: string | null | undefined)
{
  if (!dsCaminho?.startsWith(`${DS_PREFIXO_PUBLICO}/`))
    return;

  try
  {
    await unlink(join(DS_DIRETORIO_UPLOADS, DS_PASTA_CARDAPIO, basename(dsCaminho)));
  }
  catch (erro)
  {
    if ((erro as NodeJS.ErrnoException).code !== 'ENOENT')
      throw erro;
  }
}
