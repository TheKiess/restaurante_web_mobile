# Relatório Técnico de Desenvolvimento

> **Instruções:** Este documento é um diário técnico, escrito **ao longo** do projeto. Registre decisões, dificuldades e uso de IA à medida que acontecem — o que é reconstruído de memória na última semana fica genérico e se nota.
>
> O documento é organizado por **etapa**. Se o grupo trabalha em sprints mais curtas dentro de uma etapa, agrupe o relato na etapa correspondente.

---

## Identificação

| Campo | Valor |
|---|---|
| **Nome do projeto** | |
| **Grupo** | |
| **Integrantes** | |
| **Repositório** | `https://github.com/...` |
| **Vídeo de apresentação** | _(link após a entrega)_ |

---

## 1. Ambiente de desenvolvimento

> O passo a passo de instalação está no `README.md` da raiz. Esta seção registra apenas o que é **específico do grupo**: o que variou entre as máquinas e o que precisou ser resolvido fora do que o README previa.

### 1.1 Ferramentas e versões

> Só as que variam entre máquinas e costumam causar problema. Se todos usam a mesma, uma linha basta.

| Ferramenta | Versão | Quem |
|---|---|---|
| Node.js | | |
| Flutter SDK | | |
| PostgreSQL | | |
| Docker _(se o grupo usou)_ | | |
| Emulador ou dispositivo usado no mobile | | |
| Sistema operacional | | |

**Como o banco foi provisionado:** _( ) Docker Compose · ( ) PostgreSQL instalado na máquina · ( ) serviço hospedado_

> Se não foi pelo `docker-compose.yml` do repositório, descreva em uma linha o que foi feito, para que outra pessoa reproduza.

### 1.2 Divergências em relação ao README

> O que precisou ser feito além do que está no README para o ambiente funcionar? Erro de instalação, ajuste de porta, permissão, versão incompatível. Se nada divergiu, escreva "nenhuma" — isso também é informação.

| Componente | O que divergiu | Como foi resolvido |
|---|---|---|
| | | |

### 1.3 Endereços de rede entre os componentes

| Origem | URL da API usada | Observação |
|---|---|---|
| Web (navegador) | | |
| Mobile (emulador) | | `localhost` do emulador não é o da máquina |
| Mobile (dispositivo físico) | | |

---

## 2. Uso de Inteligência Artificial

> Esta seção é **obrigatória**. Seja honesto — o uso de IA é encorajado, desde que consciente e documentado. O registro só cumpre seu papel se trouxer prompt, análise crítica e correções; sem esses três, não há evidência de que o código foi compreendido.

### 2.1 Ferramentas utilizadas

| Ferramenta | Versão / Plano | Quem usou | Em que componente |
|---|---|---|---|
| | | | |
| | | | |

### 2.2 Atenção específica desta stack

> Modelos de linguagem foram treinados com muito código das versões **anteriores** às adotadas na disciplina. Registre aqui os casos em que isso apareceu.

| Situação | Ocorreu? | Onde e como foi corrigido |
|---|---|---|
| Código gerado com Next.js Pages Router (`getServerSideProps`, `pages/api/`) | | |
| Prisma sem o adaptador `@prisma/adapter-pg`, ou importando de `@prisma/client` em vez do caminho gerado | | |
| Decorators ou módulos de versão antiga do NestJS | | |
| Pacotes Flutter descontinuados ou incompatíveis com Flutter 3 | | |
| Outro | | |

### 2.3 Evidências de uso

> Preencha um bloco para cada uso relevante de IA. Há três blocos prontos, um por etapa de implementação — acrescente outros se precisar, ou escreva "não utilizado nesta etapa".

---

#### Etapa 2 — Backend

- **Quem conduziu:**
- **Ferramenta e data:**
- **Objetivo da tarefa:**
- **Prompt utilizado:**
  ```
  (cole aqui o prompt principal)
  ```
- **Trecho aproveitado:**
  ```
  (cole o trecho de codigo gerado que foi usado)
  ```
- **Análise crítica:** o que estava correto, o que estava errado, riscos identificados (arquitetura, segurança, manutenção, desempenho):
- **A resposta usava versão desatualizada da stack?** Qual:
- **Correções feitas manualmente e por quê:**
- **Evidência no repositório** (commit ou PR):
- **Como validou:**

---

#### Etapa 3 — Cliente web

- **Quem conduziu:**
- **Ferramenta e data:**
- **Objetivo da tarefa:**
- **Prompt utilizado:**
  ```
  (cole aqui o prompt principal)
  ```
- **Trecho aproveitado:**
  ```
  (cole o trecho de codigo gerado que foi usado)
  ```
- **Análise crítica:**
- **A resposta usava versão desatualizada da stack?** Qual:
- **Correções feitas manualmente e por quê:**
- **Evidência no repositório** (commit ou PR):
- **Como validou:**

---

#### Etapa 4 — App mobile

- **Quem conduziu:**
- **Ferramenta e data:**
- **Objetivo da tarefa:**
- **Prompt utilizado:**
  ```
  (cole aqui o prompt principal)
  ```
- **Trecho aproveitado:**
  ```
  (cole o trecho de codigo gerado que foi usado)
  ```
- **Análise crítica:**
- **A resposta usava versão desatualizada da stack?** Qual:
- **Correções feitas manualmente e por quê:**
- **Evidência no repositório** (commit ou PR):
- **Como validou:**

---

### 2.4 Reflexão sobre o uso de IA

> Em um parágrafo: a IA acelerou o desenvolvimento? Em quais componentes foi mais útil e em quais atrapalhou? O grupo notou diferença entre gerar código de NestJS, de Next.js e de Flutter? O que aprenderam sobre usar IA de forma eficiente e responsável?

---

## 3. Diário por etapa

> Preencha ao final de cada etapa, enquanto os detalhes ainda estão frescos.

---

### Etapa 0 — Concepção

**Período:** de ___ a ___ · **Redigido por:**

**O que foi feito:**

**Como o tema foi escolhido, e o que foi descartado no caminho:**

**Dificuldades:**

---

### Etapa 1 — Contrato e fundação

**Período:** de ___ a ___ · **Redigido por:**

**O que foi feito:**

| Frente | O que foi feito | Por quem |
|---|---|---|
| Modelo de dados | | |
| Contrato da API | | |
| Projeto do backend | | |

**Decisões técnicas:**

| Decisão | Alternativas consideradas | Justificativa | Risco ou consequência |
|---|---|---|---|
| | | | |

**Dificuldades:**

**O que ficou para a próxima etapa:**

---

### Etapa 2 — Backend · Checkpoint 1

**Período:** de ___ a ___ · **Redigido por:**

**O que foi implementado:**

**Decisões técnicas:**

| Decisão | Alternativas consideradas | Justificativa | Risco ou consequência |
|---|---|---|---|
| | | | |

**Mudanças no contrato da API:**

| Endpoint | O que mudou | Quem foi avisado | Contrato atualizado? |
|---|---|---|---|
| | | | |

**Dificuldades:**

**O que ficou para a próxima etapa:**

---

### Etapa 3 — Cliente web · Checkpoint 2

**Período:** de ___ a ___ · **Redigido por:**

**O que foi implementado:**

**Decisões técnicas:**

| Decisão | Alternativas consideradas | Justificativa | Risco ou consequência |
|---|---|---|---|
| | | | |

**Mudanças no contrato da API:**

| Endpoint | O que mudou | Quem foi avisado | Contrato atualizado? |
|---|---|---|---|
| | | | |

**Dificuldades:**

**O que ficou para a próxima etapa:**

---

### Etapa 4 — App mobile · Checkpoint 3

**Período:** de ___ a ___ · **Redigido por:**

**O que foi implementado:**

**Decisões técnicas:**

| Decisão | Alternativas consideradas | Justificativa | Risco ou consequência |
|---|---|---|---|
| | | | |

**Mudanças no contrato da API:**

| Endpoint | O que mudou | Quem foi avisado | Contrato atualizado? |
|---|---|---|---|
| | | | |

**Dificuldades:**

**O que ficou para a próxima etapa:**

---

### Etapa 5 — Integração e fechamento

**Período:** de ___ a ___ · **Redigido por:**

**O que foi ajustado para os três componentes conversarem:**

**Inconsistências encontradas entre os clientes, e como foram resolvidas:**

**Dificuldades:**

---

## 4. Arquitetura — decisões e evolução

### 4.1 Estrutura final

> A estrutura das três pastas segue o `README.md` da raiz. Registre aqui apenas os **desvios** e o motivo de cada um.

| Componente | Desvio em relação ao README | Motivo |
|---|---|---|
| | | |

### 4.2 Fronteira entre backend e clientes

> Como o grupo garantiu que a regra de negócio não vazasse para os clientes? Houve algum caso em que a tentação de resolver no cliente apareceu? O que foi feito?

### 4.3 Nível de autenticação adotado no app mobile

> Registre qual dos três níveis o grupo adotou — completa, simplificada ou simulada — e por quê. A simplificação vale para o app, nunca para a API.

| Aspecto | Registro |
|---|---|
| Nível adotado | |
| Como o app obtém o token | |
| O que deixou de ser tratado (expiração, refresh, logout) | |
| Rotas da API afetadas pela escolha | _(o esperado é "nenhuma")_ |

### 4.4 O que os dois clientes compartilham e o que não

> Tipos, modelos de dados, tratamento de erro, formato de sessão: o que ficou consistente entre web e mobile, o que divergiu e por quê.

---

## 5. Resposta ao RFC _(seção condicional)_

> **A publicação de um RFC é opcional.** Se o professor publicar o arquivo `docs/rfc-001.md` e comunicar o grupo, preencha esta seção — registrando a análise **antes** de commitar qualquer código novo. Se nenhum RFC for publicado até a entrega final, marque o campo abaixo e siga para a seção 6.

**Houve RFC neste projeto?** _( ) Sim — preencher abaixo · ( ) Não — seção não aplicável_

### 5.1 Análise de impacto (antes do código)

| Aspecto | Descrição |
|---|---|
| **O que o RFC pede** | |
| **Componente de origem do pedido** | _(backend / web / mobile)_ |
| **Impacto no backend** | _(ou "não afetado", com a razão)_ |
| **Impacto no contrato da API** | |
| **Impacto no cliente web** | |
| **Impacto no app mobile** | |
| **Esforço estimado** | |
| **Decisão** | _(aceitar integralmente / aceitar com adaptação / propor alternativa — com justificativa)_ |

> Vale registrar a diferença entre onde a mudança foi pedida e onde ela acabou chegando. Essa distância é o dado mais interessante que o RFC produz.

### 5.2 Estratégia de implementação

> Em que ordem os componentes foram alterados e por quê? Como o grupo evitou quebrar o que já funcionava?

### 5.3 Reflexão após a implementação

> O que no contrato ou na arquitetura original facilitou ou dificultou a absorção da mudança? Se o contrato estivesse desatualizado quando o RFC chegou, quanto isso custou?

---

## 6. Reflexão final

### 6.1 O que funcionou bem

> O que o grupo faria da mesma forma se recomeçasse?

### 6.2 O que faria diferente

> Quais decisões técnicas ou de processo mudaria? Inclua a divisão de trabalho entre as três frentes.

### 6.3 Principais aprendizados

| Componente | Aprendizado |
|---|---|
| Backend | |
| Web | |
| Mobile | |
| Integração e processo | |

### 6.4 Autoavaliação

> De 1 a 10, como o grupo avalia o resultado final? Justifique.

**Nota:** ___/10

**Justificativa:**

---

## 7. Vídeo de apresentação

| Campo | Valor |
|---|---|
| **Link** | |
| **Duração** | |
| **Quem fala em cada parte** | |

---

## 8. Histórico de revisões

| Versão | Data | Descrição | Quem atualizou |
|---|---|---|---|
| 0.1 | | Criação do documento | |
| | | | |
| 1.0 | | Versão final | |
