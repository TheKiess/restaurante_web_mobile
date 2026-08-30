# Documento de Visão

> **Instruções:** Preencha todas as seções abaixo. Remova os blocos `> instrução` após preenchê-los. Este documento deve ser entregue ao final da **Etapa 0** e pode ser revisado até a Etapa 1.

---

## Identificação

| Campo | Valor |
|---|---|
| **Nome do projeto** | _(ex: Central de Suporte Interno)_ |
| **Grupo** | _(nome ou número do grupo)_ |
| **Integrantes** | _(nomes — detalhamento em `docs/equipe.md`)_ |
| **Disciplina** | Programação Web e Mobile |
| **Data de criação** | |
| **Última atualização** | |
| **Versão** | 1.0 |

---

## 1. Introdução

### 1.1 Propósito do documento

> Descreva em 2–3 frases o que este documento cobre e para quem ele é destinado.

_(Exemplo: Este documento descreve a visão do produto X, seu contexto de negócio, os principais usuários e o escopo de alto nível. Destina-se ao professor orientador e serve como base para o PRD.)_

### 1.2 Escopo do produto

> Defina o que o sistema faz e o que ele **não** faz. Seja objetivo.

**O sistema irá:**
- 
- 
- 

**O sistema não irá (fora do escopo):**
- 
- 

### 1.3 Definições e siglas

> Liste termos do domínio que precisam de definição para quem lê o documento.

| Termo | Definição |
|---|---|
| | |
| | |

---

## 2. Posicionamento

### 2.1 Declaração do problema

> Preencha o quadro abaixo descrevendo o problema que motiva o sistema.

| Campo | Descrição |
|---|---|
| **O problema de** | _(qual problema existe)_ |
| **Afeta** | _(quem sofre com esse problema)_ |
| **Cujo impacto é** | _(quais consequências esse problema gera)_ |
| **Uma solução adequada seria** | _(como o sistema proposto resolve isso)_ |

### 2.2 Declaração de posição do produto

> Complete as lacunas abaixo.

- **Para** _(público-alvo)_
- **Que** _(necessidade ou oportunidade)_
- **O** _(nome do produto)_
- **É** _(categoria do produto)_
- **Que** _(benefício principal)_
- **Diferente de** _(alternativa existente ou processo manual atual)_
- **Nosso produto** _(principal diferencial)_

---

## 3. Partes interessadas

> Liste todos os envolvidos — usuários diretos, gestores, sistemas externos. Pelo menos 2.

| Parte interessada | Papel | Interesse no sistema |
|---|---|---|
| | | |
| | | |
| | | |

---

## 4. Descrição dos usuários

> Para cada perfil de usuário, preencha uma subseção. Mínimo de 2 perfis.
>
> A coluna **Contexto de uso** é decisiva neste projeto: é dela que sai a justificativa para existirem dois clientes. Descreva onde a pessoa está e o que tem em mãos quando usa o sistema.

### 4.1 Perfil: _(nome do perfil, ex: Atendente)_

| Campo | Descrição |
|---|---|
| **Descrição** | |
| **Responsabilidades** | |
| **Contexto de uso** | _(sentado à mesa? em movimento? em campo, com as mãos ocupadas?)_ |
| **Nível técnico** | _(básico / intermediário / avançado)_ |
| **Frequência de uso** | _(diário / semanal / eventual)_ |
| **Principal necessidade** | |

### 4.2 Perfil: _(nome do perfil)_

| Campo | Descrição |
|---|---|
| **Descrição** | |
| **Responsabilidades** | |
| **Contexto de uso** | |
| **Nível técnico** | |
| **Frequência de uso** | |
| **Principal necessidade** | |

---

## 5. Visão geral do produto

### 5.1 Perspectiva do produto

> Descreva como o sistema se encaixa no contexto mais amplo. É um sistema independente? Substitui algum processo manual? Integra com algum outro sistema?

### 5.2 Por que dois clientes

> **Esta seção é obrigatória.** Argumente por que o domínio escolhido justifica um cliente web **e** um aplicativo mobile. Um projeto em que os dois clientes fariam exatamente a mesma coisa não atende ao objetivo do trabalho.

**O que acontece na tela grande, e por quê:**

**O que acontece no celular, e por quê:**

**O que faz sentido existir nos dois:**

> Este raciocínio será detalhado no PRD como o "recorte web/mobile". Aqui basta o argumento de produto — o detalhamento funcional vem depois.

### 5.3 Capacidades principais

> Liste as grandes funcionalidades do sistema em alto nível, sem detalhar requisitos. Cada item aqui vira um épico no PRD. Indique em qual cliente a capacidade se manifesta principalmente.

| # | Capacidade | Descrição resumida | Cliente principal |
|---|---|---|---|
| C01 | | | _(web / mobile / ambos)_ |
| C02 | | | |
| C03 | | | |
| C04 | | | |

### 5.4 Suposições e dependências

> O que precisa ser verdade para o sistema funcionar? O que está fora do controle do projeto?

**Suposições:**
- 
- 

**Dependências:**
- 
- 

---

## 6. Restrições

> Liste restrições técnicas, de prazo e de escopo que limitam as escolhas do projeto. As linhas de tecnologia já estão preenchidas — complete as demais e acrescente as que forem próprias do seu domínio.

| Tipo | Restrição |
|---|---|
| Backend | NestJS 11 (Node 22 LTS) + Prisma 7 + PostgreSQL 18 |
| Cliente web | React 19 + Next.js 15 com App Router |
| Cliente mobile | Flutter 3 / Dart |
| Autenticação | JWT com guards no backend; sessão completa no cliente web; no app mobile pode ser simplificada ou simulada |
| Arquitetura | Regra de negócio no backend; clientes não acessam o banco |
| Controle de versão | Repositório único do grupo no GitHub, criado a partir do repositório-modelo da disciplina |
| Prazo | Etapas 0 a 5 conforme o calendário da turma, mais apresentação |
| Documentação | Markdown, versionada no mesmo repositório |
| _(adicione outras)_ | |

---

## 7. Qualidade

> Cite pelo menos 3 atributos de qualidade relevantes para o seu sistema e justifique a escolha. Ao menos um deles deve tratar de algo específico do contexto móvel (conectividade instável, tempo de resposta percebido, consumo de dados, uso com uma mão só).

| Atributo | Relevância para este sistema |
|---|---|
| _(ex: Usabilidade)_ | |
| | |
| | |

---

## 8. Histórico de revisões

| Versão | Data | Autor | Descrição da alteração |
|---|---|---|---|
| 1.0 | | | Versão inicial |
| | | | |
