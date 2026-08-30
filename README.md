# Projeto integrador — Programação Web e Mobile

Repositório-modelo do trabalho final: **um serviço e dois clientes**. Uma API REST concentra as regras de negócio e os dados; um cliente web e um aplicativo mobile a consomem.

Este repositório traz a **estrutura**: as pastas, os templates de documentação e o passo a passo para inicializar os três projetos.

> **O enunciado completo do trabalho — temas disponíveis, escopo, etapas, prazos e critérios de avaliação — está na página da disciplina.** Este README não repete essas informações; ele cuida do repositório.

---

## Estrutura

```
/
├── README.md                 ← este arquivo
├── docker-compose.yml        ← PostgreSQL 18 local (opcional — veja as opções de banco)
├── .gitignore
├── docs/
│   ├── visao.md              ← Documento de Visão        (Etapa 0)
│   ├── prd.md                ← PRD                       (Etapa 1)
│   ├── contrato-api.md       ← Contrato REST da API      (Etapa 1, sempre atualizado)
│   ├── equipe.md             ← Composição e contribuições (Etapa 0, toda etapa)
│   ├── relatorio.md          ← Diário técnico            (toda etapa)
│   └── rfc-001.md            ← Mudança de requisito      (só se o professor publicar)
├── backend/                  ← API NestJS      (criada na Etapa 1)
├── web/                      ← Cliente Next.js (criado na Etapa 3)
└── mobile/                   ← App Flutter     (criado na Etapa 4)
```

As três pastas de código não existem ainda: cada uma nasce na etapa correspondente, seguindo o passo a passo abaixo. **Um único repositório para os três componentes** — não criem repositórios separados.

---

## Criando o repositório do grupo

Este repositório é um *template* do GitHub. No repositório do professor, use o botão **"Use this template" → "Create a new repository"**. Não use *fork*.

O template dá ao grupo um histórico limpo, começando no primeiro commit de vocês, e permite repositório privado. Depois de criar, deem acesso ao professor.

```bash
git clone https://github.com/<seu-usuario>/<seu-repo>.git
cd <seu-repo>
```

---

## Passo a passo — banco de dados

O que o projeto exige é **um PostgreSQL 18 acessível**, com um banco e um usuário. Como ele chega até aí é escolha do grupo — **o Docker é opcional**.

Qualquer uma das opções abaixo serve. O que importa é que, ao final, esta URL funcione:

```
postgresql://app:app@localhost:5432/appdb?schema=public
```

Se o grupo usar outro usuário, senha, porta ou nome de banco, tudo bem: basta ajustar o `DATABASE_URL` do backend de acordo. Registre a escolha em `docs/relatorio.md`, para que outra pessoa consiga reproduzir o ambiente.

### Opção A — Docker Compose (mais rápido)

O `docker-compose.yml` na raiz já vem configurado com banco `appdb`, usuário `app` e senha `app`.

```bash
docker compose up -d          # sobe o banco na porta 5432
docker compose ps             # confere que está de pé
docker compose logs -f db     # acompanha os logs, se precisar
docker compose down           # derruba (os dados ficam no volume)
```

Vantagem: ninguém instala nada além do Docker, e todos no grupo têm exatamente a mesma versão do banco.

### Opção B — PostgreSQL instalado na máquina

Quem já tem PostgreSQL instalado, ou prefere não usar Docker, pode ir por aqui. **Apague o `docker-compose.yml`** do repositório nesse caso, para não deixar no projeto um arquivo que ninguém usa.

**1. Instalar o PostgreSQL 18**, se ainda não tiver:

| Sistema | Caminho usual |
|---|---|
| Windows | Instalador oficial em [postgresql.org/download](https://www.postgresql.org/download/) |
| macOS | `brew install postgresql@18` e depois `brew services start postgresql@18` |
| Ubuntu / Debian | Repositório PGDG, conforme as instruções em [postgresql.org/download](https://www.postgresql.org/download/) |

**2. Criar o usuário e o banco.** Abra o `psql` com um usuário administrador e rode:

```sql
CREATE USER app WITH PASSWORD 'app';
CREATE DATABASE appdb OWNER app;
```

No Linux, o caminho costuma ser `sudo -u postgres psql`. No macOS com Homebrew, `psql postgres`. No Windows, use o pgAdmin ou o SQL Shell que vem com o instalador.

**3. Conferir a conexão:**

```bash
psql "postgresql://app:app@localhost:5432/appdb" -c "SELECT version();"
```

Se a versão aparecer, o backend vai conectar.

> **Se a porta 5432 já estiver ocupada** por outra instalação de PostgreSQL, use outra porta (5433, por exemplo) e reflita isso no `DATABASE_URL`. É o problema mais comum de quem já tinha o banco instalado antes.

### Opção C — serviço gerenciado na nuvem

Também é aceito usar um PostgreSQL hospedado, desde que seja **versão 18** e que a URL de conexão fique no `.env` de cada integrante, nunca no Git. Nesse caso não há nada para subir localmente: o `DATABASE_URL` aponta direto para o serviço.

---

## Passo a passo — backend (NestJS + Prisma) · Etapa 1

### 1. Criar o projeto

```bash
npm i -g @nestjs/cli
nest new backend --package-manager npm --skip-git
cd backend
```

### 2. Instalar as dependências

```bash
# validação de entrada e configuração
npm i @nestjs/config class-validator class-transformer

# autenticação (usada a partir da aula de JWT)
npm i @nestjs/jwt @nestjs/passport passport passport-jwt
npm i -D @types/passport-jwt

# Prisma 7 — o adaptador de driver é obrigatório na versão 7
npm i @prisma/client @prisma/adapter-pg pg dotenv
npm i -D prisma @types/pg
```

### 3. Inicializar o Prisma

```bash
npx prisma init --datasource-provider postgresql
```

Crie o arquivo `backend/.env` (ele **não** vai para o Git):

```env
DATABASE_URL="postgresql://app:app@localhost:5432/appdb?schema=public"
JWT_SECRET="troque-este-valor"
```

E versione um `backend/.env.example` com as mesmas chaves e valores fictícios.

### 4. Ajustar o `schema.prisma`

Na versão 7 o gerador mudou de nome e passou a exigir um caminho de saída:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

### 5. Criar o `prisma.config.ts` na raiz do backend

```ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
})
```

### 6. Primeira migration

Com o banco no ar, por qualquer uma das opções acima:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 7. O `PrismaService`

Crie `backend/src/prisma/prisma.service.ts`. Repare em dois detalhes da versão 7: o `PrismaClient` vem do **caminho gerado**, não de `@prisma/client`, e o adaptador é passado ao `super()`.

```ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
```

### 8. Subir e conferir

```bash
npm run start:dev             # http://localhost:3000
```

### Comandos do dia a dia

| Comando | Para quê |
|---|---|
| `npm run start:dev` | Sobe a API com recarga automática |
| `npx prisma migrate dev --name <nome>` | Cria e aplica uma migration |
| `npx prisma studio` | Abre o navegador de dados do Prisma |
| `npx prisma generate` | Regenera o client depois de mudar o schema |
| `nest g resource <recurso>` | Gera módulo, controller, service e DTOs de um recurso |

---

## Passo a passo — cliente web (Next.js) · Etapa 3

### 1. Criar o projeto

Rode na **raiz do repositório**, não dentro de `backend/`:

```bash
npx create-next-app@latest web --typescript --eslint --app --src-dir --use-npm
cd web
```

Responda **sim** ao App Router quando perguntado. O trabalho não usa Pages Router.

### 2. Apontar para a API

Crie `web/.env.local` (fora do Git) e o `web/.env.example` correspondente:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 3. Subir

```bash
npm run dev                   # http://localhost:3001, se a API já ocupa a 3000
```

Se a porta 3000 estiver ocupada pelo backend, use `npm run dev -- -p 3001`.

### Estrutura sugerida

```
web/src/
├── app/                      # rotas (App Router)
│   ├── layout.tsx
│   └── <recurso>/
│       ├── page.tsx          # listagem
│       └── [id]/page.tsx     # detalhe
├── components/               # componentes reutilizáveis
├── lib/
│   ├── api.ts                # cliente HTTP único
│   └── auth.ts               # sessão e token
└── types/                    # tipos derivados do contrato da API
```

---

## Passo a passo — app mobile (Flutter) · Etapa 4

### 1. Conferir o ambiente

```bash
flutter doctor                # resolva o que aparecer em vermelho antes de seguir
```

### 2. Criar o projeto

Na raiz do repositório:

```bash
flutter create mobile --org br.edu.<projeto> --platforms android,ios
cd mobile
```

### 3. Dependências mínimas

```bash
flutter pub add http
flutter pub add flutter_dotenv        # opcional, para a URL da API
```

### 4. Endereço da API

`localhost` dentro do emulador Android aponta para o próprio emulador, não para a sua máquina. Guarde a URL em um único lugar do código:

| Onde o app roda | URL da API |
|---|---|
| Emulador Android | `http://10.0.2.2:3000` |
| Simulador iOS | `http://localhost:3000` |
| Dispositivo físico | `http://<ip-da-sua-maquina>:3000` |

No Android, requisições HTTP em texto puro são bloqueadas por padrão: para desenvolvimento, habilite `android:usesCleartextTraffic="true"` no `AndroidManifest.xml` de *debug*.

### 5. Rodar

```bash
flutter devices               # lista emuladores e aparelhos conectados
flutter run
```

### Estrutura sugerida

```
mobile/lib/
├── main.dart
├── models/                   # modelos derivados do contrato da API
├── services/                 # cliente HTTP e autenticação
├── screens/                  # uma pasta por tela
└── widgets/                  # widgets reutilizáveis
```

---

## Rodando os três ao mesmo tempo

Precisa de três terminais, com o banco já no ar:

```bash
docker compose up -d                       # banco, se o grupo usa Docker
cd backend && npm run start:dev            # terminal 1 — API em :3000
cd web     && npm run dev -- -p 3001       # terminal 2 — web em :3001
cd mobile  && flutter run                  # terminal 3 — app no emulador
```

Se o banco estiver instalado na máquina ou hospedado, pule a primeira linha — basta que ele esteja no ar antes de subir a API.

Ao final do projeto, o `docs/relatorio.md` precisa descrever exatamente esses passos, de forma que outra pessoa suba o sistema do zero.

---

## Convenções de código

**O substantivo do domínio é português; o nome do padrão, do papel ou do recurso do framework é inglês.**

| Em português (domínio) | Em inglês (técnico) |
|---|---|
| `Chamado`, `Atendente`, `Ficha` | `Controller`, `Service`, `Module`, `Repository` |
| campos: `titulo`, `dataAbertura`, `situacao` | `Dto`, `Guard`, `Pipe`, `Filter`, `Interceptor` |
| rotas: `/chamados`, `/fichas` | `Page`, `Layout`, `Widget`, `Screen`, `Provider` |
| `CriarChamadoDto`, `AtualizarChamadoDto` | `findAll`, `findOne`, `create`, `update`, `remove` |
| arquivos: `chamados.controller.ts` | `id`, `createdAt`, `page`, `limit` |

**Identificadores nunca levam acento ou cedilha:** `Emprestimo`, não `Empréstimo`; `situacao`, não `situação`. Vale para nome de arquivo, de pasta, de campo e de rota. O texto da documentação escreve a palavra acentuada normalmente — só o identificador perde o acento.

Comentários, mensagens de commit, textos de interface e mensagens de erro voltadas ao usuário final: **português do Brasil**, com acentuação normal.

---

## Documentação do grupo

Os arquivos em `docs/` são templates para preencher. Cada um traz suas próprias instruções no topo.

| Arquivo | Quando | Para quê |
|---|---|---|
| `docs/visao.md` | Etapa 0 | Problema, usuários e escopo de alto nível |
| `docs/equipe.md` | Etapa 0, atualizado a cada etapa | Composição, papéis e registro de contribuições |
| `docs/prd.md` | Etapa 1, revisado depois | Requisitos, modelo de dados, arquitetura e recorte web/mobile |
| `docs/contrato-api.md` | Etapa 1, sempre atualizado | Endpoints: entrada, saída, status, erros, autenticação |
| `docs/relatorio.md` | A cada etapa | Diário técnico: decisões, dificuldades e uso de IA |
| `docs/rfc-001.md` | Só se publicado | Análise e implementação de uma mudança de requisito |

> **O contrato da API é o documento que destrava o paralelismo.** Com ele fechado, quem cuida do web constrói telas antes de o endpoint existir, e quem cuida do mobile modela suas classes sem esperar a primeira migration. Regra prática: **o contrato muda antes do código, nunca depois.**

---

## Regras do repositório

### Obrigatório

- Um repositório único do grupo, criado a partir do template e acessível ao professor.
- Cada commit feito **pelo autor real do código**. Em programação em par, use `Co-authored-by:` na mensagem.
- Nenhuma credencial versionada.

### Recomendado

Nada abaixo é obrigatório, mas tudo reduz retrabalho:

- Manter a `main` sempre em estado funcional.
- Commits frequentes ao longo da sprint, em vez de um pacote no último dia.
- Mensagens no padrão `tipo(componente): descricao`:

```
feat(backend): adiciona endpoint POST /chamados com validacao de DTO
feat(web): implementa listagem de chamados com paginacao
feat(mobile): adiciona tela de detalhe do chamado
fix(backend): corrige calculo de SLA para chamados reabertos
docs: atualiza diario com decisoes da sprint 3
refactor(web): extrai cliente HTTP para modulo compartilhado
```

- Branches por funcionalidade, integradas por Pull Request.
- Revisão do PR por outro integrante antes do merge.

### O que não versionar

O `.gitignore` da raiz já cobre os três componentes:

```
node_modules/      .next/          build/
dist/              generated/      .dart_tool/
.env, .env.local   coverage/       android/key.properties
```

Cada componente versiona um `.env.example` com as chaves esperadas e valores fictícios — nunca o `.env` real.

---

## Onde está o resto

9. Comanda e pedidos em restaurante [Avançado]
Negócios · Avançado
O garçom lança pedidos pelo celular; a cozinha acompanha a fila de preparo em tela fixa. É o único tema em que dois clientes agem sobre o mesmo dado ao mesmo tempo.

- Web — cozinha e gerência Fila de preparo, cardápio e preços, painel do salão, fechamento e relatórios.
- Mobile — garçom Abrir comanda, lançar itens, ver o que já está pronto, pedir fechamento.
