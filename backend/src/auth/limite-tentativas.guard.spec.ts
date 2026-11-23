import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { INestApplication }             from '@nestjs/common';
import { Test }                              from '@nestjs/testing';
import { Throttle, ThrottlerModule }         from '@nestjs/throttler';
import { LimiteTentativasGuard }             from './limite-tentativas.guard.js';

@Controller('teste')
class ControllerDeTeste
{
  @Post('login')
  @UseGuards(LimiteTentativasGuard)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  entrar(@Body() objCorpo: { ds_login: string })
  {
    return { ds_login: objCorpo.ds_login };
  }
}

describe('LimiteTentativasGuard', () => {
  let app: INestApplication;
  let dsUrl: string;

  const entrar = (dsLogin: string) => fetch(`${dsUrl}/teste/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ds_login: dsLogin })
  });

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 99 }], errorMessage: 'Muitas tentativas.' })],
      controllers: [ControllerDeTeste]
    }).compile();

    app = await modulo.createNestApplication().init();
    await app.listen(0);
    dsUrl = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  it('bloqueia a partir da quarta tentativa do mesmo login', async () => {
    const arrStatus = [];

    for (let nrTentativa = 0; nrTentativa < 4; nrTentativa++)
      arrStatus.push((await entrar('maria')).status);

    expect(arrStatus).toEqual([201, 201, 201, 429]);
  });

  it('responde com a mensagem configurada', async () => {
    const resposta = await entrar('maria');

    expect(resposta.status).toBe(429);
    expect((await resposta.json()).message).toBe('Muitas tentativas.');
  });

  it('não bloqueia outro login', async () => {
    expect((await entrar('joao')).status).toBe(201);
  });

  it('não diferencia maiúsculas de minúsculas no login', async () => {
    expect((await entrar('MARIA')).status).toBe(429);
  });
});
