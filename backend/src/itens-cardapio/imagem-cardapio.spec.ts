import { identificarTipoImagem } from './imagem-cardapio.js';

describe('identificarTipoImagem', () => {
  it('reconhece JPEG pela assinatura', () => {
    expect(identificarTipoImagem(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]))).toBe('jpg');
  });

  it('reconhece PNG pela assinatura', () => {
    expect(identificarTipoImagem(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]))).toBe('png');
  });

  it('reconhece WebP pela assinatura', () => {
    const bufWebp = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0x10, 0x00, 0x00, 0x00]), Buffer.from('WEBPVP8 ')]);

    expect(identificarTipoImagem(bufWebp)).toBe('webp');
  });

  it('não confunde outro tipo de RIFF com WebP', () => {
    const bufWav = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0x10, 0x00, 0x00, 0x00]), Buffer.from('WAVEfmt ')]);

    expect(identificarTipoImagem(bufWav)).toBeUndefined();
  });

  it('rejeita GIF', () => {
    expect(identificarTipoImagem(Buffer.from('GIF89a......'))).toBeUndefined();
  });

  it('rejeita texto com cara de imagem', () => {
    expect(identificarTipoImagem(Buffer.from('<?php echo 1; ?>'))).toBeUndefined();
  });

  it('rejeita arquivo vazio ou curto demais', () => {
    expect(identificarTipoImagem(Buffer.alloc(0))).toBeUndefined();
    expect(identificarTipoImagem(Buffer.from([0xff, 0xd8]))).toBeUndefined();
  });
});
