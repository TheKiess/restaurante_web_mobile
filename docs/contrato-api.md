# Contrato da API

> **Instruções:** Este documento especifica a interface REST que o backend expõe e que os dois clientes consomem. Deve ser entregue ao final da **Etapa 1** e mantido atualizado a cada mudança de endpoint. Remova os blocos `> instrução` após preenchê-los.

---

## Por que este documento existe

O grupo trabalha em paralelo em três componentes, com menos gente do que frentes. O que impede que um trave o outro é este arquivo: com o contrato fechado, o responsável pelo cliente web pode construir a tela de listagem antes de o endpoint existir, e o responsável pelo mobile pode modelar suas classes de dados sem esperar a primeira migration.

Duas regras práticas decorrem disso:

1. **O contrato muda antes do código, nunca depois.** Quem precisa alterar um endpoint atualiza este documento e avisa o grupo no mesmo dia. Descobrir a mudança quando a tela quebra custa o dobro.
2. **O contrato é a especificação, não a documentação.** Se ele descreve um comportamento e a API faz outro, o defeito está na API — a menos que o grupo decida conscientemente mudar o contrato.

A régua de qualidade é esta: na entrega final, o contrato precisa ser suficiente para que um quarto cliente seja escrito **sem nenhuma pergunta ao grupo**.

---

## Identificação

| Campo | Valor |
|---|---|
| **Projeto** | |
| **Versão do contrato** | 1.0 |
| **Última atualização** | |
| **URL base (desenvolvimento)** | `http://localhost:3000` |
| **Formato** | JSON (`Content-Type: application/json`) |

> **Nota para o app mobile:** `localhost` dentro do emulador Android aponta para o próprio emulador, não para a máquina do desenvolvedor. Use `http://10.0.2.2:3000` no emulador Android, ou o IP da máquina na rede local para dispositivo físico. Registre a URL usada por cada ambiente na configuração do app, nunca fixa no meio do código.

---

## 1. Convenções gerais

### 1.1 Nomenclatura

- Recursos no plural e em português, sem acento: `/chamados`, `/inspecoes`, `/fichas`
- Campos em `camelCase`, sem acento: `dataAbertura`, `situacao`, `indiceConformidade`
- Identificadores técnicos em inglês: `id`, `createdAt`, `updatedAt`, `page`, `limit`

### 1.2 Métodos e status esperados

| Operação | Método e caminho | Sucesso | Erros comuns |
|---|---|---|---|
| Listar | `GET /recursos` | `200` | `401` |
| Obter um | `GET /recursos/:id` | `200` | `401`, `404` |
| Criar | `POST /recursos` | `201` | `400`, `401`, `409` |
| Atualizar | `PATCH /recursos/:id` | `200` | `400`, `401`, `404` |
| Remover | `DELETE /recursos/:id` | `204` | `401`, `404`, `409` |

> Ajuste conforme o domínio. Operações de transição de estado costumam ficar melhor como sub-recurso (`POST /chamados/:id/resolucao`) do que como campo em um `PATCH` genérico — decida e registre a escolha.

### 1.3 Formato de erro

Toda resposta de erro segue o mesmo formato, em qualquer endpoint:

```json
{
  "statusCode": 400,
  "message": ["titulo nao pode ser vazio", "categoriaId deve ser um uuid"],
  "error": "Bad Request"
}
```

> Este é o formato padrão do NestJS. Se o grupo adotar um formato próprio, descreva-o aqui — e implemente-o com um filtro de exceção, não repetindo a estrutura em cada controller.

### 1.4 Paginação

> Descreva a estratégia adotada nas listagens. Exemplo:

`GET /recursos?page=1&limit=20`

```json
{
  "dados": [],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

### 1.5 Datas

Todas as datas trafegam em ISO 8601, em UTC: `2026-08-13T14:30:00.000Z`. A conversão para o fuso do usuário é responsabilidade de cada cliente.

---

## 2. Autenticação

### 2.1 Estratégia

> Descreva o fluxo: como o token é obtido, quanto tempo dura, se existe refresh, como é enviado.

Requisições autenticadas enviam o token no cabeçalho:

```
Authorization: Bearer <token>
```

### 2.2 Endpoints de autenticação

#### `POST /auth/login`

Autentica o usuário e devolve o token de acesso.

**Requisição**

```json
{
  "email": "usuario@exemplo.com",
  "senha": "..."
}
```

**Resposta `200`**

```json
{
  "accessToken": "eyJhbGciOi...",
  "usuario": {
    "id": "uuid",
    "nome": "Nome do Usuario",
    "perfil": "atendente"
  }
}
```

**Erros**

| Status | Quando |
|---|---|
| `400` | Corpo inválido |
| `401` | Credenciais incorretas |

#### `POST /auth/registro`

> Descreva, se houver auto-cadastro. Caso contrário, remova e explique como os usuários são criados.

### 2.3 Perfis e permissões

> Liste os perfis do sistema e o que cada um pode fazer. Esta tabela é o que o guard de autorização implementa.

| Perfil | Pode | Não pode |
|---|---|---|
| | | |
| | | |

### 2.4 Armazenamento do token em cada cliente

| Cliente | Onde o token fica | Nível de autenticação | Observação |
|---|---|---|---|
| Web (Next.js) | | completa | |
| Mobile (Flutter) | | _(completa / simplificada / simulada — conforme declarado no PRD)_ | |

> **Regra inegociável:** sessão simplificada ou simulada no app mobile nunca significa afrouxar a API. Os endpoints continuam protegidos pelo mesmo guard, e o app continua apresentando um token válido em toda requisição autenticada — o que muda é apenas **como** esse token é obtido, não se ele é exigido. Criar uma rota desprotegida só para o app funcionar sem login é falha de segurança, não simplificação aceitável.

---

## 3. Recursos

> Repita o bloco abaixo para cada recurso do domínio. Documente **todos** os endpoints do MVP; endpoints de prioridade Média ou Baixa podem ficar como esboço, desde que marcados como tal.
>
> **Antes de preencher, leia o [Anexo A](#anexo-a--exemplo-preenchido-domínio-de-biblioteca)**, no final deste documento: ele traz o mesmo bloco preenchido de ponta a ponta, com um recurso simples e um endpoint de regra de negócio.

---

### 3.1 `<Recurso>`

**Descrição:** _(o que este recurso representa no domínio)_

**Consumido por:** _(web / mobile / ambos)_

#### Representação

```json
{
  "id": "uuid",
  "campoDominio": "string",
  "situacao": "aberto",
  "createdAt": "2026-08-13T14:30:00.000Z",
  "updatedAt": "2026-08-13T14:30:00.000Z"
}
```

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `id` | uuid | — | Gerado pelo servidor |
| | | | |

#### `GET /<recursos>`

Lista os registros.

| Parâmetro de consulta | Tipo | Descrição |
|---|---|---|
| `page` | número | Página, padrão 1 |
| `limit` | número | Itens por página, padrão 20 |
| | | |

**Resposta `200`** — objeto paginado conforme a seção 1.4.

#### `GET /<recursos>/:id`

**Resposta `200`** — a representação acima.
**Resposta `404`** — registro inexistente.

#### `POST /<recursos>`

**Requisição**

```json
{
  "campoDominio": "string"
}
```

**Resposta `201`** — a representação criada.

**Regras de validação**

| Campo | Regra |
|---|---|
| | |

#### `PATCH /<recursos>/:id`

**Requisição** — campos parciais da representação.
**Resposta `200`** — a representação atualizada.

#### `DELETE /<recursos>/:id`

**Resposta `204`** — sem corpo.
**Resposta `409`** — quando existe dependência que impede a remoção. _(descreva a regra)_

---

## 4. Endpoints de regra de negócio

> Nem tudo é CRUD. Documente aqui os endpoints que executam a lógica própria do domínio — cálculo, transição de estado, geração. São eles que dão substância ao sistema.

### 4.1 `POST /<recurso>/:id/<acao>`

**O que faz:** _(descreva a regra executada)_

**Pré-condições:** _(estado necessário para a ação ser válida)_

**Requisição**

```json
{}
```

**Resposta `200`**

```json
{}
```

**Erros específicos**

| Status | Quando |
|---|---|
| `409` | _(ação incompatível com o estado atual do recurso)_ |

---

## 5. Diferenças de consumo entre os clientes

> Se algum endpoint aceita parâmetros pensados para um cliente específico — um formato reduzido para a lista do mobile, por exemplo — registre aqui. O objetivo é deixar explícito que a API é uma só, com variações declaradas.

| Endpoint | Diferença | Cliente | Motivo |
|---|---|---|---|
| | | | |

---

## 6. Como verificar o contrato

> Registre como o grupo confere que a API implementada corresponde a este documento.

- [ ] Coleção de requisições versionada no repositório _(arquivo `.http`, Insomnia, Postman)_
- [ ] Swagger habilitado no backend _(`@nestjs/swagger`)_ — URL: `http://localhost:3000/api`
- [ ] Tipos do cliente web derivados do contrato, em `web/src/types/`
- [ ] Modelos do mobile derivados do contrato, em `mobile/lib/models/`

> Se o grupo habilitar o Swagger, este documento continua sendo necessário: o Swagger descreve a API que **existe**, e o contrato descreve a que foi **acordada**. Os dois convergem na entrega final, mas cumprem papéis diferentes durante o projeto.

---

## 7. Histórico de revisões

> Toda mudança de endpoint entra aqui, com a data e quem foi avisado. É este histórico que explica, depois, por que um cliente parou de funcionar.

| Versão | Data | Alteração | Impacto nos clientes |
|---|---|---|---|
| 1.0 | | Versão inicial | — |
| | | | |


---

## Anexo A — exemplo preenchido (domínio de biblioteca)

> Este anexo existe para mostrar **a forma**, não o conteúdo. Ele usa o domínio de biblioteca justamente porque ele é o das aulas práticas e **não pode ser o tema do trabalho** — não há como copiar daqui para o seu projeto, só como se orientar pelo nível de detalhe.
>
> Repare no que faz este exemplo funcionar: todo campo tem tipo, toda operação tem os códigos de status que devolve, e as regras que impedem uma operação estão escritas como resposta de erro, não como texto solto. É esse nível que permite alguém implementar o cliente sem perguntar nada.
>
> Apague este anexo do seu contrato depois de preencher o documento.

### A.1 `Livro`

**Descrição:** obra disponível no acervo. Um livro pode ter vários exemplares emprestados ao longo do tempo, mas só um empréstimo ativo por vez.

**Consumido por:** web (cadastro e acervo completo) e mobile (busca e consulta)

#### Representação

```json
{
  "id": "9f1c2b6e-4a7d-4b28-9a4e-2d5f8c1e7b30",
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "isbn": "9788525406958",
  "anoPublicacao": 1899,
  "situacao": "disponivel",
  "createdAt": "2026-03-10T13:02:41.000Z",
  "updatedAt": "2026-03-10T13:02:41.000Z"
}
```

| Campo | Tipo | Obrigatório na criação | Observação |
|---|---|---|---|
| `id` | uuid | — | Gerado pelo servidor |
| `titulo` | string (1–200) | sim | |
| `autor` | string (1–120) | sim | |
| `isbn` | string (13) | sim | Único no acervo |
| `anoPublicacao` | número inteiro | não | Entre 1450 e o ano corrente |
| `situacao` | enum | — | `disponivel` \| `emprestado`; calculada pelo servidor, nunca enviada pelo cliente |
| `createdAt`, `updatedAt` | ISO 8601 | — | Gerados pelo servidor |

#### `GET /livros`

Lista o acervo. Rota autenticada — qualquer perfil.

| Parâmetro de consulta | Tipo | Descrição |
|---|---|---|
| `page` | número | Página, padrão 1 |
| `limit` | número | Itens por página, padrão 20, máximo 100 |
| `busca` | string | Filtra por título ou autor, sem diferenciar maiúsculas |
| `situacao` | enum | `disponivel` ou `emprestado` |

**Resposta `200`**

```json
{
  "dados": [ { "id": "...", "titulo": "Dom Casmurro", "autor": "Machado de Assis", "isbn": "9788525406958", "anoPublicacao": 1899, "situacao": "disponivel", "createdAt": "...", "updatedAt": "..." } ],
  "total": 143,
  "page": 1,
  "limit": 20
}
```

| Status | Quando |
|---|---|
| `200` | Sucesso, mesmo que a lista venha vazia |
| `401` | Token ausente ou inválido |

#### `GET /livros/:id`

**Resposta `200`** — a representação acima.

| Status | Quando |
|---|---|
| `404` | Não existe livro com esse `id` |

#### `POST /livros`

Cadastra um livro. Rota autenticada — **somente perfil `bibliotecario`**.

**Requisição**

```json
{
  "titulo": "Memórias Póstumas de Brás Cubas",
  "autor": "Machado de Assis",
  "isbn": "9788535911503",
  "anoPublicacao": 1881
}
```

**Resposta `201`** — a representação criada, com `situacao` em `disponivel`.

| Status | Quando |
|---|---|
| `400` | Campo obrigatório ausente, ISBN fora do formato, ano fora da faixa |
| `403` | Perfil `leitor` tentando cadastrar |
| `409` | Já existe livro com esse ISBN |

#### `DELETE /livros/:id`

**Resposta `204`** — sem corpo.

| Status | Quando |
|---|---|
| `403` | Perfil `leitor` |
| `404` | Livro inexistente |
| `409` | Livro com empréstimo ativo — devolva antes de remover |

---

### A.2 Endpoint de regra de negócio — devolução

> Este é o tipo de endpoint que sustenta o "lógica além do CRUD". Repare que ele **não** é um `PATCH` genérico: a devolução é uma operação do domínio, com pré-condições próprias, e por isso vira um sub-recurso.

#### `POST /emprestimos/:id/devolucao`

**O que faz:** encerra um empréstimo ativo, devolve o livro ao acervo e calcula a multa por atraso.

**Pré-condições:** o empréstimo existe e está com `situacao` em `ativo`.

**Requisição:** sem corpo.

**Resposta `200`**

```json
{
  "id": "3c8a1f04-77b2-4c19-8e55-a1d9b6f2c084",
  "livroId": "9f1c2b6e-4a7d-4b28-9a4e-2d5f8c1e7b30",
  "dataEmprestimo": "2026-03-01T14:00:00.000Z",
  "dataPrevistaDevolucao": "2026-03-15T14:00:00.000Z",
  "dataDevolucao": "2026-03-18T09:12:00.000Z",
  "diasAtraso": 3,
  "multa": 4.5,
  "situacao": "devolvido"
}
```

| Status | Quando |
|---|---|
| `401` | Token ausente ou inválido |
| `404` | Não existe empréstimo com esse `id` |
| `409` | O empréstimo já foi devolvido |

**Regra do cálculo:** `multa = diasAtraso × 1,50`, com `diasAtraso` contado em dias corridos a partir de `dataPrevistaDevolucao`. Sem atraso, `diasAtraso` é `0` e `multa` é `0`. **O cálculo é feito no servidor** — o cliente exibe o valor que recebe, nunca o recalcula.

---

### A.3 Perfis e permissões do exemplo

| Perfil | Pode | Não pode |
|---|---|---|
| `bibliotecario` | Cadastrar, editar e remover livros; registrar empréstimos e devoluções de qualquer leitor | — |
| `leitor` | Consultar o acervo; ver e devolver os próprios empréstimos | Cadastrar livros; ver empréstimos de outros leitores |

> A coluna "Não pode" não é decorativa: cada linha dela vira um teste de `403` e um caso no guard de autorização.
