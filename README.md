//readme atualizado inteiramente com a ajuda de IA
# Sistema de Gerenciamento de Restaurante — Web e Mobile

## 1. Sobre o projeto

O projeto consiste no desenvolvimento de um sistema de gerenciamento de restaurante, composto por uma aplicação Web, um aplicativo Mobile e uma API REST responsável pela comunicação entre as aplicações e o banco de dados.

A arquitetura utiliza um backend compartilhado pelas aplicações Web e Mobile, permitindo que ambas acessem as mesmas informações e regras de negócio.

### Aplicações desenvolvidas

- **Backend:** API REST responsável pelas regras de negócio, autenticação, autorização e comunicação com o banco de dados.
- **Frontend Web:** aplicação desenvolvida para disponibilizar as funcionalidades de gerenciamento e operação do restaurante.
- **Aplicativo Mobile:** aplicação desenvolvida para oferecer ao cliente uma interface para consultar o cardápio, realizar pedidos e acompanhar suas comandas.

## 2. Tecnologias utilizadas

| Componente | Tecnologias |
|---|---|
| Backend | NestJS e TypeScript |
| Frontend Web | Next.js, React, TypeScript e Tailwind CSS |
| Aplicativo Mobile | Flutter e Dart |
| Banco de dados | PostgreSQL 18 |
| ORM | Prisma |
| Ambiente do banco | Docker |
| Autenticação | JWT |
| Criptografia de senhas | bcrypt |
| Comunicação | API REST e HTTP |

### 2.1 Versões utilizadas

| Ferramenta | Versão |
|---|---|
| Node.js | 24.19 |
| Next.js | 16.3.8 |
| React | 19.2.8 |
| TypeScript | 5 |
| Flutter | 3.44.1 |
| Dart | 3.12.1 |
| PostgreSQL | 18 |
| Prisma | 8.0.0-rc.15 |

As versões das dependências podem ser consultadas nos arquivos `package.json`, `package-lock.json` e `pubspec.lock` de cada aplicação.

## 3. Estrutura do repositório

O projeto está organizado em três componentes principais:

```text
restaurante_web_mobile/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── package.json
│
├── mobile/
│   ├── lib/
│   ├── pubspec.yaml
│   └── ...
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

### Descrição das pastas

- `backend/`: contém a API desenvolvida com NestJS, incluindo módulos, controllers, services, DTOs, configurações do Prisma e integração com o PostgreSQL.
- `frontend/`: contém a aplicação Web desenvolvida com Next.js, incluindo páginas, componentes, estilos e serviços de comunicação com a API.
- `mobile/`: contém o aplicativo desenvolvido com Flutter, incluindo telas, modelos e serviços responsáveis pela comunicação com o backend.
- `docker-compose.yml`: configura o ambiente de desenvolvimento do banco de dados PostgreSQL.
- `README.md`: documentação principal do projeto, com informações sobre tecnologias, configuração e execução.

## 4. Funcionalidades do sistema

O sistema possui diferentes perfis de acesso, com funcionalidades específicas para cada tipo de usuário.

### 4.1 Cliente

O cliente pode:

- Criar uma conta e realizar login.
- Consultar o cardápio.
- Pesquisar produtos.
- Visualizar detalhes dos produtos.
- Adicionar produtos ao carrinho.
- Alterar a quantidade dos itens.
- Remover produtos do carrinho.
- Conferir o resumo e o valor total do pedido.
- Selecionar a forma de pagamento.
- Finalizar pedidos.
- Consultar pedidos e comandas.
- Acompanhar a situação dos pedidos.
- Consultar e atualizar informações do perfil.

### 4.2 Gerente

O gerente possui funcionalidades administrativas para acompanhar e gerenciar as operações do restaurante, incluindo:

- Gerenciamento de usuários e funcionários.
- Administração do cardápio.
- Gerenciamento de categorias e itens.
- Gerenciamento de mesas.
- Gerenciamento de comandas e pedidos.
- Acompanhamento de pagamentos.
- Consulta de relatórios e indicadores de vendas.

### 4.3 Cozinha

O perfil da cozinha é destinado ao acompanhamento e à atualização dos pedidos encaminhados para preparo.

Entre suas funcionalidades estão:

- Visualizar os pedidos recebidos.
- Acompanhar os itens que aguardam preparo.
- Atualizar a situação dos itens para em produção.
- Marcar os itens como prontos.
- Cancelar itens quando permitido pelas regras do sistema.

### 4.4 Garçom

O garçom possui funcionalidades relacionadas ao atendimento e ao gerenciamento dos pedidos dos clientes.

Entre suas funcionalidades estão:

- Registrar pedidos.
- Consultar mesas e comandas.
- Encaminhar pedidos para a cozinha.
- Acompanhar a situação dos pedidos.
- Consultar itens em produção e prontos.
- Realizar operações relacionadas ao atendimento das comandas, conforme suas permissões.

## 5. Backend — API REST

O backend foi desenvolvido utilizando NestJS e TypeScript, com Prisma para realizar a comunicação com o banco de dados PostgreSQL.

A API centraliza as informações e as regras de negócio utilizadas pelas aplicações Web e Mobile, evitando que cada aplicação implemente suas próprias regras de processamento.

Entre os módulos desenvolvidos estão:

- Prisma;
- Mesas;
- Categorias;
- Itens do cardápio;
- Usuários;
- Comandas;
- Itens dos pedidos;
- Pagamentos;
- Autenticação.

### 5.1 Autenticação e controle de acesso

O sistema utiliza autenticação baseada em token JWT (*JSON Web Token*) e controle de acesso baseado em perfis, conhecido como RBAC (*Role-Based Access Control*).

O controle de permissões é realizado no backend, considerando o perfil do usuário autenticado.

Os perfis contemplados são:

- `CLIENTE`
- `GERENCIA`
- `COZINHA`
- `GARCOM`

Dessa forma, cada usuário pode acessar somente as funcionalidades permitidas para seu perfil.

### 5.2 Endereço da API

Por padrão, o backend é executado na seguinte URL:

```text
http://localhost:3000
```

Exemplo de endpoint para consultar os itens do cardápio:

```http
GET http://localhost:3000/itens-cardapio
```

## 6. Banco de dados

O sistema utiliza PostgreSQL 18 como banco de dados relacional.

Para facilitar a configuração do ambiente de desenvolvimento, o projeto disponibiliza um arquivo `docker-compose.yml`, que permite iniciar o banco de dados por meio de um contêiner Docker.

### 6.1 Configuração do PostgreSQL

O ambiente utiliza as seguintes configurações:

| Configuração | Valor |
|---|---|
| SGBD | PostgreSQL 18 |
| Imagem Docker | `postgres:18` |
| Contêiner | `projeto-db` |
| Host | `localhost` |
| Usuário | `app` |
| Senha | `app` |
| Banco de dados | `appdb` |
| Porta do computador | `5433` |
| Porta interna do contêiner | `5432` |
| Volume | `dados-postgres` |

### 6.2 Credenciais de acesso

As credenciais abaixo são destinadas exclusivamente ao ambiente de desenvolvimento local.

```text
Host: localhost
Porta: 5433
Banco de dados: appdb
Usuário: app
Senha: app
```

### 6.3 String de conexão

No arquivo `backend/.env`, configure a variável `DATABASE_URL`:

```env
DATABASE_URL="postgresql://app:app@localhost:5433/appdb?schema=public"
```

Essa configuração considera que o backend está sendo executado diretamente na máquina do desenvolvedor e que o PostgreSQL está disponível pelo Docker na porta `5433`.

### 6.4 Configuração no Docker

O arquivo `docker-compose.yml` contém a seguinte configuração:

```yaml
services:
  db:
    image: postgres:18
    container_name: projeto-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: appdb
    ports:
      - "5433:5432"
    volumes:
      - dados-postgres:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  dados-postgres:
```

### 6.5 Inicialização do banco

Na raiz do repositório, execute:

```bash
docker compose up -d
```

Para verificar se o contêiner está em execução:

```bash
docker compose ps
```

Para acompanhar os logs do banco:

```bash
docker compose logs -f db
```

Para interromper o contêiner:

```bash
docker compose down
```

Os dados são persistidos no volume Docker `dados-postgres`, permitindo manter as informações do banco após a interrupção do contêiner.

O arquivo `docker-compose.yml` é opcional. Também é possível utilizar uma instalação local do PostgreSQL ou um serviço hospedado, desde que exista um banco acessível pela variável `DATABASE_URL`.

**Observação:** não utilize essas credenciais em produção. Em ambientes reais, utilize uma senha forte e mantenha as credenciais protegidas em variáveis de ambiente que não sejam enviadas ao Git.

## 7. Instalação e execução

Para executar o projeto, é necessário ter instalado:

- Node.js e npm.
- Docker Desktop.
- Flutter SDK e Dart.
- Visual Studio com as ferramentas de desenvolvimento para Desktop em C++, para execução do Flutter no Windows.
- Google Chrome, caso queira executar o aplicativo Flutter Web.

### 7.1 Inicialização do banco de dados

Na raiz do projeto, execute:

```bash
docker compose up -d
```

Verifique se o banco está em execução:

```bash
docker compose ps
```

### 7.2 Backend

Abra um terminal na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Inicie a API em modo de desenvolvimento:

```bash
npm run start:dev
```

O backend ficará disponível em:

```text
http://localhost:3000
```

### 7.3 Frontend Web

Abra outro terminal:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Configure o arquivo `frontend/.env.local` com a URL da API:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

Inicie a aplicação:

```bash
npm run dev -- -p 3001
```

O frontend ficará disponível em:

```text
http://localhost:3001
```

### 7.4 Aplicativo Mobile

Abra outro terminal:

```bash
cd mobile
```

Instale as dependências:

```bash
flutter
```