# Relatório Técnico de Desenvolvimento

## Identificação

| Campo | Valor |
|---|---|
| **Nome do projeto** | Restaurante Web Mobile |
| **Grupo** | Évelyn Marques Soletti e Frank Joanes Kiess Junior |
| **Integrantes** | Évelyn Marques Soletti; Frank Joanes Kiess Junior |
| **Repositório** | `https://github.com/TheKiess/restaurante_web_mobile.git` |
| **Vídeo de apresentação** | `https://drive.google.com/drive/folders/1UhPZOrO33YWHsWMjXBC7XZlpxhb0_PVA?usp=sharing` |

---

## 1. Ambiente de desenvolvimento

### 1.1 Ferramentas e versões

| Ferramenta | Versão | Quem |
|---|---|---|
| Node.js | 24.19 | Backend e Web |
| Flutter SDK | 3.44.1 | Desenvolvimento Mobile |
| PostgreSQL | 18 (executado em contêiner Docker) | Grupo |
| Docker | 29.7.2 | Backend |
| Emulador ou dispositivo usado no mobile | Windows Desktop (execução desktop pelo Flutter) | Desenvolvimento Mobile |
| Sistema operacional | Windows | Ambiente de desenvolvimento |

**Como o banco foi provisionado:** PostgreSQL executado em contêiner Docker. O contêiner utilizado foi `projeto-db`, com o banco `appdb` e o volume `dados-postgres` para armazenamento dos dados. Não foi confirmado se a execução foi feita por Docker Compose ou por comando direto do Docker.

### 1.2 Divergências em relação ao README

| Componente | O que divergiu | Como foi resolvido |
|---|---|---|
| Backend/Web | Durante a configuração do ambiente, foram encontrados problemas de compatibilidade entre algumas dependências e componentes utilizados no projeto. | Foram ajustadas as dependências e a configuração do projeto até que a aplicação pudesse ser executada. Não foi registrado neste documento um caso específico de versão incompatível. |
| Mobile | O aplicativo foi executado em Windows Desktop, selecionando a opção `Windows` após executar `flutter run`, em vez de utilizar um emulador Android ou dispositivo físico. | O Flutter foi configurado e executado como aplicação desktop durante o desenvolvimento. |

### 1.3 Endereços de rede entre os componentes

| Origem | URL da API usada | Observação |
|---|---|---|
| Web (navegador) | `http://localhost:3001` | Endereço utilizado pela aplicação Web conforme configuração informada. |
| Mobile (emulador) | Não utilizado | O desenvolvimento Mobile foi executado em Windows Desktop, não em emulador Android. |
| Mobile (dispositivo físico) | Não utilizado | Não foi informado teste em dispositivo físico. |
| Mobile (Windows Desktop) | `http://localhost:3000` | Endereço configurado nos serviços Mobile para comunicação com o backend. |

---

## 2. Uso de Inteligência Artificial

### 2.1 Ferramentas utilizadas

| Ferramenta | Versão / Plano | Quem usou | Em que componente |
|---|---|---|---|
| ChatGPT (OpenAI) | Versão/modelo não registrado no diário | Évelyn Marques Soletti | Web e Mobile |

### 2.2 Atenção específica desta stack

| Situação | Ocorreu? | Onde e como foi corrigido |
|---|---|---|
| Código gerado com Next.js Pages Router (`getServerSideProps`, `pages/api/`) | Não foi identificado caso específico | A aplicação Web foi desenvolvida utilizando a estrutura de rotas do App Router. Não há registro de correção de código Pages Router. |
| Prisma sem o adaptador `@prisma/adapter-pg`, ou importando de `@prisma/client` em vez do caminho gerado | Não foi identificado caso específico | A configuração do Prisma foi ajustada de acordo com a estrutura utilizada no backend. Não há registro de uma ocorrência específica gerada pela IA. |
| Decorators ou módulos de versão antiga do NestJS | Não foi identificado caso específico | Não há registro de ocorrência específica. |
| Pacotes Flutter descontinuados ou incompatíveis com Flutter 3 | Não foi identificado caso específico | As orientações foram avaliadas considerando a estrutura do projeto Flutter e Dart. |
| Outro | Houve sugestões que precisaram de adaptação à estrutura existente | Os códigos e orientações foram revisados antes de serem incorporados, respeitando as dependências, os componentes e os padrões já adotados no projeto. |

### 2.3 Evidências de uso

#### Etapa 2 — Backend

**Não utilizado nessa etapa.**

#### Etapa 3 — Cliente web

- **Quem conduziu:** Évelyn Marques Soletti.
- **Ferramenta e data:** ChatGPT (OpenAI), utilizado durante o desenvolvimento das telas da aplicação Web, no período do Checkpoint 2 (25/09 a 22/10).
- **Objetivo da tarefa:** O objetivo foi garantir consistência na organização dos componentes, navegação, apresentação de informações, mensagens de retorno, estados de carregamento e tratamento de erros, respeitando as funcionalidades e os padrões já definidos no projeto.
- **Prompt utilizado:**

  ```text
  Analise a estrutura desta tela e utilize como referência o padrão das telas anteriores do projeto. Mantenha a mesma organização visual, os componentes, os estilos, a navegação e os padrões de carregamento, mensagens de sucesso e erro. Faça as adaptações necessárias para a funcionalidade desta página, respeitando as regras de negócio e a estrutura da API já implementadas. Não altere funcionalidades que não foram solicitadas.
  ```

- **Trecho aproveitado:** Foram utilizadas sugestões de organização e adaptação de páginas e componentes. Não foi separado um trecho isolado de código gerado para registro neste diário; as implementações podem ser verificadas nos arquivos da aplicação Web.
- **Análise crítica:** A utilização da IA facilitou a manutenção de um padrão entre as telas e ajudou a identificar diferenças de estrutura e apresentação durante o desenvolvimento. Um dos principais benefícios foi conseguir utilizar páginas já desenvolvidas como referência para as próximas, evitando que cada interface tivesse uma organização visual diferente. Entretanto, as sugestões da IA precisavam ser analisadas antes de serem aplicadas, pois nem sempre correspondiam exatamente à estrutura existente no projeto ou às regras específicas de cada funcionalidade. Também foi necessário ter cuidado para não substituir comportamentos já implementados ou modificar a comunicação com a API sem necessidade.
- **A resposta usava versão desatualizada da stack? Qual:** As sugestões foram analisadas considerando a estrutura e as tecnologias utilizadas no projeto, principalmente Next.js, React e TypeScript. Quando alguma orientação não correspondia à organização ou às dependências existentes, foi necessário adaptá-la antes de utilizar. Não foi identificada, nos registros considerados para esta descrição, uma ocorrência específica de código desatualizado que possa ser apontada com segurança.
- **Correções feitas manualmente e por quê:** Foram realizadas adaptações manuais para adequar as sugestões à estrutura real do projeto, aos componentes já existentes, aos serviços responsáveis pela comunicação com a API e às regras de cada perfil. Também foram ajustados elementos visuais e comportamentos para manter o mesmo padrão entre as páginas, sem comprometer funcionalidades específicas, como permissões, validações e operações de cada tela.
- **Evidência no repositório (commit ou PR):** As implementações e adaptações podem ser verificadas nos arquivos das páginas e componentes da aplicação Web, além do histórico de commits do repositório Git. Também há comentários nas páginas em que foi utilizado auxílio de IA.
- **Como validou:** A validação foi realizada executando a aplicação Web e verificando as telas no navegador. Foram conferidos a organização visual, a navegação entre páginas, o funcionamento dos formulários, filtros e botões, a apresentação dos dados recebidos da API e os estados de carregamento, sucesso e erro. Também foram verificadas as permissões e as operações correspondentes aos diferentes perfis, garantindo que as sugestões aplicadas mantivessem o comportamento esperado do sistema.

#### Etapa 4 — App mobile

- **Quem conduziu:** Évelyn Marques Soletti.
- **Ferramenta e data:** ChatGPT (OpenAI), utilizado durante o desenvolvimento do aplicativo Mobile, no período do Checkpoint 3 (23/10 a 19/11).
- **Objetivo da tarefa:** O objetivo foi manter um padrão visual e estrutural entre as diferentes interfaces, facilitando a navegação e garantindo consistência na apresentação das informações. A IA também foi utilizada para auxiliar na organização dos componentes, integração das telas com os services, apresentação dos pedidos e comandas e tratamento dos estados de carregamento e mensagens de retorno.
- **Prompt utilizado:**

  ```text
  Analise esta tela do aplicativo e me ajude a desenvolver ou ajustar sua interface, mantendo o mesmo padrão visual e estrutural das outras telas do projeto. Respeite os componentes, models e services já existentes. Explique as alterações e mantenha a integração com a API, sem modificar funcionalidades que já estão funcionando.
  ```

- **Trecho aproveitado:** Foram aproveitadas sugestões de organização e adaptação das telas, principalmente no diretório `screens` da pasta Mobile. Não foi separado um trecho isolado de código gerado para registro neste diário; as implementações podem ser verificadas nos arquivos do aplicativo.
- **Análise crítica:** A utilização da IA contribuiu principalmente para agilizar o desenvolvimento das interfaces e manter um padrão entre as telas do aplicativo. A possibilidade de apresentar códigos já existentes e solicitar adaptações específicas facilitou a continuidade do desenvolvimento sem precisar reconstruir toda a estrutura de cada página. Entretanto, as sugestões precisaram ser analisadas e testadas, pois poderiam não considerar completamente os models, services, parâmetros e comportamentos já implementados.
- **A resposta usava versão desatualizada da stack? Qual:** As orientações foram consideradas de acordo com a estrutura do projeto Flutter e Dart. Não foi identificada uma ocorrência específica de pacote descontinuado ou incompatível que possa ser apontada com segurança.
- **Correções feitas manualmente e por quê:** Foram realizados ajustes manuais para adaptar os códigos sugeridos à estrutura existente do aplicativo, respeitando os models, services, widgets e demais componentes já desenvolvidos. Também foram ajustados elementos visuais e a organização das telas. Parte da estrutura e dos conhecimentos utilizados foi reaproveitada de um trabalho realizado no semestre anterior, na disciplina de Programação Orientada a Objetos, no qual também foram utilizados Dart e Flutter.
- **Evidência no repositório (commit ou PR):** Principalmente no diretório `screens` da pasta Mobile, onde houve maior utilização de IA para manter os padrões visuais.
- **Como validou:** A validação foi realizada executando o aplicativo e verificando as telas desenvolvidas. Foram conferidos o padrão visual, a navegação entre as páginas, a apresentação dos dados, o funcionamento dos botões e formulários e a comunicação com a API por meio dos services. Também foram realizados testes das funcionalidades de pedidos e comandas, verificando se as informações eram carregadas e se as operações realizadas apresentavam os resultados esperados.

### 2.4 Reflexão sobre o uso de IA

A IA foi utilizada durante o desenvolvimento do projeto como ferramenta de apoio na organização do código e na implementação e revisão do mesmo. No Cliente Web e no Mobile, ajudou principalmente no desenvolvimento das telas, na organização dos componentes e na manutenção de um padrão visual e estrutural entre as telas e funcionalidades. Um dos principais benefícios foi o desenvolvimento gradual, utilizando códigos já existentes como referência para melhorar e adaptar. Porém, nem todas as sugestões fornecidas pela IA eram aplicáveis, pois algumas precisavam ser ajustadas à arquitetura, às bibliotecas e aos padrões já adotados. Por isso, o código gerado pela IA foi analisado, testado e modificado conforme as necessidades do projeto.

---

## 3. Diário por etapa

### Etapa 0 — Concepção

**Período:** até 03/09 · **Redigido por:** Grupo

**O que foi feito:**

O grupo escolheu desenvolver um sistema de gerenciamento de restaurante com o objetivo de centralizar e facilitar as atividades operacionais do estabelecimento, organizar processos como consulta ao cardápio, realização de pedidos, acompanhamento da preparação, atendimento aos clientes e gerenciamento das vendas. Foi proposta uma arquitetura com backend centralizado, uma aplicação Web para os funcionários e um aplicativo Mobile voltado aos clientes. Foram definidos quatro perfis principais de acesso: cliente, gerente, garçom e cozinha, cada um com funcionalidades específicas de acordo com suas responsabilidades.

**Como o tema foi escolhido, e o que foi descartado no caminho:**

Foram priorizadas as funcionalidades essenciais para o funcionamento do sistema, organizando as responsabilidades de cada perfil e evitando ampliar excessivamente a proposta inicial. Assim, o foco permaneceu na gestão do cardápio, pedidos, comandas, pagamentos e acompanhamento das atividades do restaurante.

**Dificuldades:**

Uma das dificuldades iniciais foi definir o escopo do sistema e organizar as funcionalidades necessárias para atender aos diferentes perfis de usuários. Também foi necessário planejar a divisão do desenvolvimento entre backend, Web e Mobile, considerando que as três partes precisariam funcionar de forma integrada e compartilhar as mesmas informações.

### Etapa 1 — Contrato e fundação

**Período:** até 24/09 · **Redigido por:** Grupo

**O que foi feito:**

Foi estruturada a base do sistema, incluindo a definição do modelo de dados, a configuração do banco de dados PostgreSQL e a criação da estrutura inicial do backend utilizando NestJS e Prisma. O banco de dados foi configurado em um contêiner Docker, permitindo padronizar o ambiente de desenvolvimento entre os integrantes. Também foram organizados os módulos responsáveis pelas principais funcionalidades do sistema, como usuários, categorias, itens do cardápio, mesas, comandas, itens de pedido e pagamentos.

| Frente | O que foi feito | Por quem |
|---|---|---|
| Modelo de dados | Definição das entidades e relacionamentos necessários para representar usuários, cardápio, comandas, pedidos, pagamentos e demais informações do restaurante, utilizando Prisma e PostgreSQL. | Évelyn e Frank |
| Contrato da API | Definição dos endpoints, métodos HTTP, parâmetros, formatos JSON e estruturas de requisição e resposta para comunicação entre os clientes e o backend. | Frank |
| Projeto do backend | Configuração do ambiente com NestJS, Docker e PostgreSQL, integração com Prisma e criação da estrutura modular da API. | Frank |

**Decisões técnicas:**

| Decisão | Alternativas consideradas | Justificativa | Risco ou consequência |
|---|---|---|---|
| Utilização de PostgreSQL com Docker | Banco instalado diretamente nas máquinas ou serviço hospedado | Padronizar o banco de dados e o ambiente de desenvolvimento entre os integrantes. | A execução do backend depende de o contêiner e a configuração do banco estarem disponíveis. |
| Utilização de NestJS e Prisma | Outras tecnologias de backend e acesso a dados | Organizar a API em módulos e centralizar o acesso ao banco por meio do ORM. | Exige manter os modelos Prisma e os contratos utilizados pelos clientes consistentes. |

**Dificuldades:**

Uma das dificuldades foi definir um modelo de dados que atendesse às necessidades dos diferentes perfis e funcionalidades do sistema. Também foi necessário organizar os relacionamentos entre as entidades e estabelecer um contrato de API que pudesse ser utilizado tanto pela aplicação Web quanto pelo aplicativo Mobile.

**O que ficou para a próxima etapa:**

Ficou para a próxima etapa a continuidade da implementação dos módulos e das regras de negócio do backend, o desenvolvimento das funcionalidades das aplicações clientes e a realização dos primeiros testes de integração entre os componentes.

### Etapa 2 — Backend · Checkpoint 1

**Período:** até 24/09 · **Redigido por:** Grupo

**O que foi implementado:**

Foi configurado o ambiente de desenvolvimento utilizando Docker para executar o PostgreSQL, buscando padronizar o banco de dados entre os membros da equipe. O backend foi desenvolvido com NestJS, organizado em módulos que separam os domínios e as funcionalidades do restaurante. A modelagem foi definida com Prisma ORM, incluindo entidades, relacionamentos, enums, índices e restrições.

O banco contempla cadastros de pessoas e usuários, perfis de acesso, mesas, reservas, categorias, itens do cardápio, itens do pedido, insumos, receitas, movimentações de estoque, comandas e pagamentos. Os relacionamentos permitem atender aos fluxos de atendimento presencial, pedidos para retirada, consumo no salão, controle de estoque e gerenciamento financeiro.

Foram definidos tipos específicos para perfis de usuário, situações de reservas, comandas e pedidos, formas de pagamento e movimentações de estoque. Para valores monetários e quantidades fracionadas foram utilizados campos Decimal, buscando maior precisão nos cálculos.

A conexão com o PostgreSQL foi centralizada no PrismaService, utilizando o adaptador PrismaPg e a variável de ambiente DATABASE_URL. O PrismaModule disponibiliza esse serviço aos demais módulos. Também foi implementado um filtro global de exceções para tratar erros conhecidos do Prisma, como duplicidade, violação de relacionamentos e registros inexistentes, convertendo-os em respostas HTTP padronizadas.

Para operações concorrentes, foram criadas funções de bloqueio de registros com SELECT FOR UPDATE. Esses bloqueios são utilizados em operações envolvendo comandas, mesas, insumos, gerentes ativos e reservas. Também foi estabelecida uma ordem de aquisição dos bloqueios para reduzir a possibilidade de deadlocks.

**Módulos desenvolvidos:**

**Módulo Categorias**

Organiza os produtos do cardápio em categorias principais e subcategorias. O controller recebe operações HTTP de criação, listagem, atualização e remoção; o service aplica as regras de negócio e acessa o banco por meio do PrismaService. As operações de alteração são restritas à Gerência. Foram definidos CreateCategoriaDto e UpdateCategoriaDto, sendo este último derivado do DTO de criação com campos opcionais.

**Módulo Comandas**

Controla abertura, acompanhamento, atualização, fechamento e cancelamento de comandas, tanto para atendimento presencial (com mesa e cliente opcional) quanto para retirada (sem mesa, criada pelo cliente autenticado no aplicativo). Verifica disponibilidade de mesas, uso simultâneo e reservas. Calcula valores de itens, pagamentos confirmados, pendentes e saldo restante com Decimal. O fechamento exige itens entregues e pagamentos regularizados; o cancelamento verifica itens entregues e pagamentos confirmados, devolve produtos de revenda ao estoque, cancela itens e recusa pagamentos pendentes. Operações críticas utilizam transações e bloqueios.

**Módulo Insumos**

Gerencia cadastro, consulta, atualização e remoção de insumos, além da listagem de itens com estoque baixo. Quando um insumo é cadastrado com quantidade inicial positiva, o sistema registra uma movimentação de entrada. A Gerência pode cadastrar, atualizar e remover; Gerência e Cozinha podem consultar os insumos e acompanhar a necessidade de reposição.

**Módulo Itens do Cardápio**

Gerencia os produtos vinculados às categorias. A listagem é pública, enquanto cadastro, atualização e remoção são restritos à Gerência. Permite adicionar, substituir e remover imagens JPG, PNG e WebP de até 2 MB, validando a assinatura real do arquivo e armazenando-o em diretório próprio com nome único. Também permite configurar receitas, relacionando produtos aos insumos e suas quantidades, validando a existência do produto e dos ingredientes e evitando a repetição de um mesmo insumo.

**Módulo Itens do Pedido**

Registra produtos em comandas, acompanha as situações dos pedidos e disponibiliza a fila da cozinha. Atende lançamentos feitos por Garçom e Gerência e pedidos de retirada criados por clientes autenticados. Para retirada, cria uma comanda sem mesa e registra os produtos após verificar disponibilidade de itens e insumos. Disponibiliza consulta dos pedidos do cliente, listagem por situação ou comanda e fila de preparação. Controla transições de situação e restringe o cancelamento pelo cliente aos itens ainda aguardando. Quando todos os itens são cancelados, a comanda também pode ser atualizada para cancelada. Integra-se ao estoque para registrar baixas e devoluções conforme o tipo de produto e a operação.

**Módulo Mesas**

Gerencia cadastro, consulta, atualização e remoção de mesas e disponibiliza um painel operacional do salão para Gerência e Garçom. O painel reúne mesas, comandas abertas e reservas confirmadas, apresentando estados livre, ocupada ou reservada. Para mesas ocupadas, exibe dados da comanda e dos itens; para reservas, apresenta horário, prazo de check-in, quantidade de pessoas e cliente. Considera a janela de check-in antecipado e a expiração de reservas vencidas. Cadastro, atualização e remoção são restritos à Gerência.

**Módulo Movimentos de Estoque**

Registra e consulta alterações nas quantidades dos insumos, incluindo entradas e saídas manuais, histórico filtrável e limite de 200 registros por consulta. O consumo de ingredientes é calculado a partir das receitas. Antes da preparação, verifica a disponibilidade; ao iniciar o preparo, desconta os ingredientes e registra as saídas. Produtos de revenda têm baixa no registro do pedido. Também realiza estornos quando itens ou comandas são cancelados e impede que a mesma devolução seja registrada mais de uma vez.

**Módulo Pagamentos**

Registra, consulta e atualiza pagamentos associados às comandas. Cliente, Gerência e Garçom podem registrar pagamentos, mas a consulta é restrita à Gerência e ao Garçom. Clientes só podem pagar suas próprias comandas de retirada, com prevenção de registros duplicados. A situação inicial varia conforme o perfil e a forma: no aplicativo, PIX é registrado como confirmado e cartão/dinheiro como pendentes; no atendimento presencial, cartão/dinheiro são confirmados e PIX permanece pendente. Somente a Gerência pode aceitar ou recusar pagamentos pendentes.

**Módulo Reservas**

Gerencia cadastro, consulta, atualização, cancelamento e check-in. Clientes reservam em nome próprio; Gerência e Garçom também podem agendar para clientes. O sistema valida usuário, data, capacidade e disponibilidade, podendo selecionar automaticamente a menor mesa suficiente. Para evitar conflitos, considera reservas em uma janela de 120 minutos antes e depois do horário solicitado. O check-in pode ocorrer a partir de 15 minutos antes e tem tolerância de 15 minutos após o horário. Reservas confirmadas sem check-in após o prazo expiram. No check-in, Gerência ou Garçom valida a reserva e cria uma comanda associada ao cliente, mesa, funcionário e reserva.

**Módulo Usuários**

Gerencia contas dos perfis Gerência, Garçom, Cozinha e Cliente. O cadastro público permite contas de clientes; os demais perfis dependem de autorização da Gerência. Disponibiliza listagem e pesquisa de clientes para apoiar o atendimento. As senhas são armazenadas como hash; apelidos, e-mails e documentos não podem ser duplicados; consultas não retornam senhas. Permite consultar e atualizar o próprio perfil com base no identificador do token JWT. Impede inativar ou alterar o perfil do último gerente ativo.

**Módulo Crypt**

Protege credenciais com bcrypt por meio de um serviço próprio. Disponibiliza geração de hash, com dez salt rounds, e comparação entre senha informada e hash armazenado. O módulo exporta CryptService para uso pelos módulos de Usuários e Autenticação.

**Módulo Autenticação e Controle de Acesso**

Valida login por apelido ou e-mail e senha, verifica se a conta está ativa e gera token JWT com identificador, apelido e perfil. Guards globais centralizam autenticação e autorização: JwtAuthGuard valida o token e a situação atual da conta; RolesGuard controla o acesso conforme o perfil. Os decorators @Public() e @Roles() permitem configurar rotas públicas e perfis autorizados. Também há uma rota para consultar os dados do usuário autenticado. Assim, a autenticação e a autorização ficam centralizadas no backend.

**Decisões técnicas:**

| Decisão | Alternativas consideradas | Justificativa | Risco ou consequência |
|---|---|---|---|
| Organização do backend em módulos NestJS | Implementação concentrada em poucos módulos ou arquivos | Separar responsabilidades por domínio e facilitar manutenção. | Exige organizar dependências e comunicação entre módulos. |
| Utilização de Prisma ORM com PostgreSQL | Acesso direto ao banco ou outro ORM | Centralizar modelos e operações de persistência. | Alterações no modelo exigem sincronização das migrações e dos clientes. |
| Autenticação com JWT e guards | Controle de acesso somente no frontend | Centralizar autenticação e autorização na API. | Os clientes precisam enviar o token nas rotas protegidas. |

**Mudanças no contrato da API:**

Não foram registradas mudanças específicas de endpoints nesta etapa. O contrato foi utilizado como referência para o desenvolvimento dos clientes e evoluiu junto à implementação dos módulos.

| Endpoint | O que mudou | Quem foi avisado | Contrato atualizado? |
|---|---|---|---|
| Não registrado | Não há alteração específica documentada nesta etapa. | Grupo | Não se aplica / não registrado. |

**Dificuldades:**

A implementação exigiu atenção à modelagem dos relacionamentos, às regras de negócio e às operações concorrentes envolvendo comandas, mesas, reservas e estoque. Também foi necessário organizar a autenticação e a autorização de modo centralizado, considerando os diferentes perfis do sistema.

**O que ficou para a próxima etapa:**

A implementação das interfaces Web e Mobile para consumir os serviços da API, respeitando os perfis de acesso e os fluxos de negócio definidos no backend.

### Etapa 3 — Cliente web · Checkpoint 2

**Período:** 25/09 a 22/10 · **Redigido por:** Grupo

**O que foi implementado:**

Foi configurado o ambiente Web com Next.js, React e TypeScript, organizando diretórios, páginas e componentes reutilizáveis. As interfaces foram padronizadas com recursos de estilização e componentes compartilhados. Foram desenvolvidas páginas para Gerência, Garçom e Cozinha, além da página pública de apresentação e da área de login exclusiva dos funcionários.

A autenticação Web foi integrada à API. As credenciais são encaminhadas ao endpoint `/auth/login` do NestJS. Após a resposta, a aplicação verifica se o perfil pertence à equipe — Gerência, Garçom ou Cozinha — e não cria sessão Web para clientes, que utilizam o aplicativo mobile. Para funcionários autorizados, o token JWT é armazenado em cookie de sessão com HttpOnly, SameSite=Lax, Secure em produção e duração baseada na expiração do token, adotando oito horas como padrão quando a expiração não está disponível. A rota de logout encerra a sessão removendo o cookie.

**Página inicial, apresentação e sessão**

A página inicial apresenta o restaurante por meio do nome do estabelecimento, uma mensagem institucional e atalhos para as seções de cardápio e contato/reservas. A página de login é destinada exclusivamente aos funcionários e utiliza um componente reutilizável de formulário. O componente de ações da sessão apresenta o acesso ao login quando não há usuário autenticado; quando há sessão, apresenta o acesso ao painel correspondente ao perfil e a opção de sair.

O direcionamento aos painéis utiliza uma estrutura que relaciona os perfis às respectivas rotas. A navegação no frontend complementa o controle de acesso, cuja validação efetiva permanece no backend.

**Painel da Gerência**

Foi desenvolvido um painel inicial para centralizar o acesso às funcionalidades administrativas e apresentar indicadores de faturamento, quantidade de pedidos e ticket médio. A página consulta itens de pedidos e calcula os indicadores no frontend, desconsiderando itens cancelados. A quantidade de pedidos considera comandas distintas com itens válidos, e o ticket médio é calculado pela divisão do valor apurado pelo número de comandas consideradas.

O painel também disponibiliza atalhos para pedidos, mesas, cardápio, relatórios, reservas, estoque, receitas, salão e funcionários. Foram incluídos estados de carregamento e mensagens de erro para informar o resultado das consultas.

**Gerenciamento do cardápio**

A interface permite cadastrar, consultar, editar e excluir itens do cardápio. O formulário contempla nome, categoria, descrição, preço, tipo do item e disponibilidade. As validações verificam campos obrigatórios, categoria válida e preço numérico maior que zero. O envio de imagens aceita JPG, PNG e WebP até 2 MB, permite visualizar e remover imagens e apresenta separadamente falhas no envio.

A página oferece pesquisa por nome ou descrição e filtros por categoria e disponibilidade, além de indicadores de itens totais, disponíveis e indisponíveis. A comunicação com a API permite consultar categorias e produtos, cadastrar e atualizar informações, enviar imagens e excluir registros.

**Gerenciamento de categorias**

A página permite cadastrar, consultar, editar e excluir categorias, incluindo a criação de subcategorias. O formulário valida o nome e impede selecionar a própria categoria como categoria pai. Durante a edição, também verifica se uma categoria descendente foi escolhida como pai. A interface apresenta contagens de categorias totais, principais e subcategorias, além de pesquisa pelo nome da categoria ou da categoria pai. Antes da exclusão, verifica a existência de subcategorias e alerta o usuário; as validações definitivas permanecem na API.

**Gerenciamento de funcionários**

A funcionalidade permite cadastrar, consultar, editar, inativar e reativar funcionários. O formulário contempla nome, login, senha, perfil, e-mail, telefone e CPF/CNPJ. São validados campos obrigatórios, tamanho mínimo do login e da senha e quantidade de dígitos do documento. Na edição, a senha só é alterada quando uma nova senha é informada.

Os perfis disponíveis são Gerência, Garçom e Cozinha. A interface permite inativar e reativar contas sem excluir o cadastro, preservando o histórico. Também apresenta indicadores de funcionários ativos e distribuição por perfil, além de pesquisa e filtros. A página utiliza a sessão para identificar o usuário atual e não oferece a ele a opção de inativar a própria conta; as regras definitivas também são aplicadas no backend.

**Gerenciamento de estoque**

A interface permite cadastrar, editar e excluir insumos, acompanhar quantidades e configurar estoque mínimo. No cadastro são informados nome, unidade, quantidade inicial e mínimo; na edição, nome e mínimo podem ser alterados, enquanto unidade e estoque atual ficam protegidos contra edição direta. Também são registradas entradas manuais e perdas, com validação de quantidade e justificativa obrigatória para perdas.

A página apresenta indicadores de insumos cadastrados e itens com estoque baixo, alertas quando a quantidade alcança ou fica abaixo do mínimo, pesquisa por nome e histórico dos 200 movimentos mais recentes, com data, insumo, tipo, quantidade e motivo. A funcionalidade integra os módulos de Insumos e Movimentos de Estoque. O consumo decorrente das receitas é realizado automaticamente pelo backend.

**Gerenciamento de mesas**

A interface permite cadastrar, consultar, editar e excluir mesas, informando número e capacidade. Os campos são validados para aceitar inteiros positivos. A exclusão exige confirmação. A página apresenta o total de mesas e a capacidade total do salão, calculada pela soma dos lugares, e organiza a listagem em ordem crescente. Também apresenta estados de carregamento, erro e sucesso.

**Gerenciamento de pedidos**

A interface permite acompanhar pedidos agrupados por comanda, visualizar mesa, cliente, origem, itens, quantidades, valores, horários e observações. Diferencia pedidos originados no aplicativo daqueles registrados presencialmente e apresenta indicadores por situação: aguardando, em preparo, pronto, entregue e cancelado. Há filtros por situação e controles para disponibilizar somente transições compatíveis com o estado atual.

Foram integrados componentes reutilizáveis para edição de itens ainda aguardando preparação e troca de mesa de comandas abertas. As atualizações são encaminhadas ao backend, que valida as regras, e os dados são recarregados após as operações.

**Gerenciamento de receitas**

A interface permite definir os insumos e as quantidades consumidas por unidade de cada produto. Carrega itens do cardápio e insumos, permite selecionar um produto e consultar sua composição. É possível adicionar, alterar e remover ingredientes, evitando duplicidade do mesmo insumo. As quantidades devem ser positivas e ter até três casas decimais. Uma confirmação evita descartar alterações não salvas ao trocar de produto.

A gravação atualiza a composição completa da receita no backend. Essas informações são utilizadas pelo controle de estoque: produtos de revenda têm baixa no registro do pedido, enquanto produtos preparados têm baixa quando a cozinha inicia o preparo.

**Gerenciamento de reservas**

A página consulta reservas, mesas e usuários pela API. No formulário, os clientes são filtrados por perfil e situação ativa; as mesas são ordenadas por número. O cadastro contempla cliente, mesa opcional, quantidade de pessoas e data/horário. A quantidade é validada como inteiro entre 1 e 50. Se nenhuma mesa for escolhida, o backend seleciona automaticamente a menor mesa livre que comporte o grupo; se houver escolha, o servidor valida capacidade e disponibilidade.

É possível editar reservas confirmadas, alterar mesa, quantidade e horário, cancelar a edição sem salvar, realizar check-in e cancelar reservas. No check-in, o backend valida a operação e abre uma comanda vinculada à mesa reservada. A interface apresenta indicadores de reservas confirmadas, mesas reservadas e próxima reserva, além de filtros por situação e dia.

**Relatórios e indicadores de vendas**

Foi desenvolvida uma página de relatórios para a Gerência. A partir dos itens de pedidos consultados na API, calcula o valor dos itens não cancelados, a quantidade de comandas com pedidos válidos, o total de itens vendidos e a quantidade de itens cancelados. Os filtros contemplam dia atual, últimos sete dias, últimos trinta dias, mês específico e intervalo personalizado.

A página apresenta a distribuição dos pedidos por situação, produtos mais vendidos com quantidades e valores, e gráfico de barras de vendas por dia utilizando Recharts. Também reúne um resumo dos resultados e identifica informações que ainda não estão disponíveis na API, como tempo médio de preparo. Foram implementadas exportações CSV e PDF: o CSV reúne dados de produtos e indicadores; o PDF captura visualmente a área do relatório em formato A4.

**Painel do Garçom**

A página inicial do Garçom funciona como ponto central de navegação e apresenta cartões para Pedidos, Entregas, Pagamentos, Comandas e Salão. Os atalhos são armazenados em uma estrutura de dados e renderizados com `map()`, utilizando Link do Next.js, ícones Lucide React e CSS Modules.

**Registro de pedidos e abertura de comandas**

A interface permite abrir comandas para atendimento em mesa ou retirada, sem mesa, e localizar um cliente para vinculá-lo à comanda. Consulta comandas abertas, mesas e produtos disponíveis, organizando mesas por número e produtos alfabeticamente. Após selecionar a comanda, o Garçom consulta os itens já lançados e adiciona produtos com quantidade entre 1 e 99 e observação opcional de até 200 caracteres.

Os itens são apresentados com quantidade, preço unitário, situação e subtotal. A página diferencia produtos preparados na cozinha daqueles destinados à revenda e integra os endpoints de comandas, mesas, cardápio e itens de pedido.

**Gerenciamento de comandas**

A página lista comandas e oferece filtros para abertas, fechadas, canceladas ou todas, com contagem por situação. A visualização detalhada consulta o backend e apresenta funcionário responsável, cliente, itens, observações, situações, pagamentos, total, valor pago e saldo restante. Permite vincular ou remover cliente, editar itens ainda aguardando, trocar mesa, fechar ou cancelar comandas abertas, sempre com confirmação e validação no servidor. Inclui retorno à página inicial do Garçom.

**Gerenciamento de entregas**

A página consulta itens com situação PRONTO e apresenta identificação, produto, mesa, comanda, quantidade e observações. A lista é atualizada automaticamente a cada cinco segundos por um hook personalizado, além de permitir atualização manual e exibir o horário da última atualização bem-sucedida. O uso de useRef permite descartar respostas antigas quando uma requisição mais recente já foi iniciada. Ao marcar como entregue, envia atualização ao backend e remove o item da lista após a confirmação. Inclui estados de carregamento, erro, sucesso e lista vazia.

**Gerenciamento de pagamentos**

A interface lista comandas abertas e permite selecionar uma para visualizar itens, quantidades, valores e histórico de pagamentos. O Garçom pode registrar pagamentos parciais ou integrais em dinheiro ou cartão. A página valida valor positivo, até duas casas decimais e não superior ao saldo disponível. O cálculo considera total da comanda, valores pagos, pagamentos pendentes e saldo disponível.

O fechamento só é habilitado quando o total é positivo, não existem pagamentos pendentes, não há saldo restante e todos os itens foram entregues. O backend também valida o fechamento. Após pagamentos ou encerramento, a página consulta novamente os dados e apresenta mensagens de sucesso/erro e estados de carregamento.

**Painel operacional da Cozinha**

A interface da Cozinha apresenta duas colunas: Aguardando preparo e Em preparo. Cada pedido exibe comanda, produto, quantidade, horário de recebimento, mesa ou cliente de retirada e observações. A fila é atualizada automaticamente a cada cinco segundos e também pode ser atualizada manualmente.

A Cozinha pode iniciar o preparo de itens aguardando e marcar como pronto os itens em preparo. As alterações são enviadas à API, que valida as transições e executa as regras de negócio. Para produtos preparados, iniciar o preparo aciona no backend a movimentação dos insumos definidos na receita. O controle de requisições evita que respostas antigas substituam dados mais recentes, e foram incluídos tratamentos de erros e atualização silenciosa.

O desenvolvimento visual utilizou como referência o template Next Shadcn Admin (reoring/next-shadcn-admin), adaptado às necessidades do projeto e à identidade visual definida. Componentes e estilos foram reutilizados para manter consistência entre as páginas.

**Decisões técnicas:**

| Decisão | Alternativas consideradas | Justificativa | Risco ou consequência |
|---|---|---|---|
| Utilização de Next.js com React e TypeScript | Outras bibliotecas e frameworks para frontend | Desenvolver a aplicação Web com componentes, páginas e tipagem. | Exige compatibilidade entre versões e dependências do ecossistema. |
| Componentes e estilos reutilizáveis | Repetir a implementação visual em cada página | Manter consistência e facilitar ajustes entre as interfaces. | Alterações em componentes compartilhados podem afetar várias páginas. |
| Consumo da API centralizada | Manter dados independentes no frontend | Utilizar as mesmas informações e regras do backend. | A aplicação depende da disponibilidade e do contrato da API. |

**Mudanças no contrato da API:**

Não foram registradas alterações específicas do contrato nesta etapa. As páginas Web consumiram os endpoints do backend e os serviços foram ajustados para corresponder às estruturas disponibilizadas pela API.

| Endpoint | O que mudou | Quem foi avisado | Contrato atualizado? |
|---|---|---|---|
| Não registrado | Não há alteração específica documentada nesta etapa. | Grupo | Não se aplica / não registrado. |

**Dificuldades:**

Foram encontradas dificuldades na configuração do ambiente e na compatibilidade entre algumas dependências e componentes utilizados no projeto. Outro desafio foi integrar as funcionalidades desenvolvidas com o backend, garantindo que as informações fossem apresentadas corretamente e respeitassem as regras de cada perfil de usuário.

**O que ficou para a próxima etapa:**

Desenvolvimento e integração do aplicativo Mobile do Cliente, além dos ajustes finais de consistência entre os componentes Web, Mobile e Backend.

### Etapa 4 — App mobile · Checkpoint 3

**Período:** 23/10 a 19/11 · **Redigido por:** Grupo

**O que foi implementado:**

**Modelo de Dados**

Foram desenvolvidos modelos para representar as principais entidades utilizadas pelo aplicativo.

- **Usuario e ResultadoLogin:** representam os dados do usuário e o resultado da autenticação, incluindo o token recebido pela API.
- **ItemCardapio:** representa os produtos disponíveis no cardápio, contendo informações como nome, descrição, preço, categoria e disponibilidade.
- **ItemCarrinho:** representa os produtos selecionados pelo cliente e suas respectivas quantidades, permitindo calcular o subtotal.
- **ItemPedido:** representa os itens registrados em uma comanda, incluindo quantidade, valor, situação, observações e data do pedido.
- **Comanda:** agrupa os itens pertencentes a uma mesma comanda, permitindo calcular o valor total e determinar sua situação geral a partir do estado dos itens.

Também foram implementados métodos fromJson para converter os dados recebidos da API em objetos utilizados pelo aplicativo.

**Serviços e Comunicação com a API**

Foram criadas classes de serviços para centralizar a comunicação entre o aplicativo mobile e o backend NestJS.

O AuthService realiza a autenticação do cliente, enviando as credenciais para a API e interpretando a resposta com token de acesso.

O CardapioService consulta os itens cadastrados no banco de dados e disponibiliza os produtos para apresentação no aplicativo.

O CarrinhoService gerencia os produtos selecionados pelo cliente, permitindo adicionar, incrementar, decrementar, remover e limpar itens. Para atualizar a interface conforme as alterações, foi utilizado o mecanismo ChangeNotifier.

O PedidoService concentra as operações relacionadas aos pedidos, incluindo a criação de pedidos para retirada, o registro de pagamentos, a consulta das comandas do cliente e o cancelamento de itens.

O UsuarioService disponibiliza operações para cadastro de novos clientes, consulta dos dados do próprio perfil e atualização das informações pessoais.

Por fim, o SessaoService controla os dados da sessão do cliente, mantendo o token de autenticação e as informações do usuário em memória. Foi utilizado ValueNotifier para notificar as telas quando ocorrem alterações na sessão.

Nas requisições que exigem autenticação, o token é enviado no cabeçalho HTTP utilizando o padrão Bearer. Também foram implementadas verificações dos códigos de resposta e tratamento de erros para informar quando uma operação não é concluída.

**Telas e Funcionalidades Desenvolvidas**

Foram implementadas as principais telas necessárias para o fluxo de utilização do aplicativo pelo cliente:

- **Cadastro de usuário:** permite cadastrar novos clientes informando nome, CPF, e-mail, telefone, apelido e senha. Foram adicionadas validações para verificar o preenchimento e o formato dos dados.
- **Login:** permite que o cliente acesse sua conta utilizando e-mail ou apelido e senha. Após a autenticação, os dados da sessão são atualizados com o token e as informações do usuário.
- **Cardápio:** apresenta os produtos cadastrados no sistema, exibindo nome, descrição, categoria e preço. Também foi implementada uma funcionalidade de pesquisa por nome ou descrição, além da exibição apenas dos produtos disponíveis.
- **Detalhes do produto:** apresenta informações individuais do produto selecionado e permite adicioná-lo ao carrinho quando estiver disponível.
- **Carrinho:** permite visualizar os produtos selecionados, alterar quantidades, remover itens e consultar os subtotais e o valor total da compra.
- **Finalização do pedido:** permite confirmar os produtos selecionados e registrar o pedido para retirada. Foram disponibilizadas opções de pagamento por PIX, cartão e dinheiro. O pagamento por PIX é simulado no aplicativo, enquanto cartão e dinheiro são indicados para pagamento na retirada. Na opção em dinheiro, também é possível informar o valor recebido e calcular o troco. Nessa funcionalidade, foi implementado um controle para evitar a criação de uma nova comanda quando o registro do pagamento apresenta falha após a criação do pedido. O carrinho somente é limpo depois que o registro do pagamento é concluído com sucesso.
- **Meus pedidos:** apresenta as comandas do cliente, incluindo quantidade de itens, valor total e situação geral. Também permite expandir os detalhes dos pedidos e cancelar itens que ainda estejam aguardando.
- **Perfil:** permite consultar os dados pessoais do cliente, atualizar as informações cadastrais e encerrar a sessão. Para clientes que ainda não estão autenticados, são disponibilizadas opções para entrar ou criar uma conta.
- **Tela principal:** centraliza a navegação do aplicativo por meio de uma barra inferior com quatro seções: Cardápio, Pedidos, Carrinho e Perfil. Foi utilizado IndexedStack para preservar o estado das telas durante a navegação e ValueListenableBuilder para acompanhar as alterações da sessão.

**Componentes Reutilizáveis e Identidade Visual**

Para manter a padronização da interface, foram desenvolvidos componentes reutilizáveis:

- **BarraSuperior:** define o padrão visual das barras superiores, permitindo configurar títulos, ações e botão de retorno.
- **ProdutoCard:** apresenta os produtos do cardápio em cartões com informações e acesso aos detalhes.
- **PedidoCard:** apresenta os dados dos itens dos pedidos, identifica visualmente suas situações e disponibiliza a opção de cancelamento quando permitido.

A identidade visual foi baseada principalmente em tons de vinho e bege, com componentes, cartões, indicadores e mensagens padronizados. Os produtos são representados por ícones ilustrativos, não tendo sido implementado o carregamento de fotografias reais.

**Decisões técnicas:**

| Decisão | Alternativas consideradas | Justificativa | Risco ou consequência |
|---|---|---|---|
| Desenvolvimento com Flutter e Dart | Desenvolvimento de uma aplicação nativa separada para cada plataforma | Permitir desenvolver a interface Mobile com uma única base de código. | A interface e a comunicação precisam ser verificadas nos ambientes de execução pretendidos. |
| Utilização de services e models próprios | Realizar requisições e conversões diretamente nas telas | Separar comunicação HTTP, representação dos dados e interface. | É necessário manter os models compatíveis com as respostas da API. |
| Gerenciamento de estado com ChangeNotifier e ValueNotifier | Atualizações manuais e estado local em cada tela | Notificar as interfaces quando carrinho ou sessão são alterados. | O estado da sessão permanece em memória e não é persistido após encerrar o aplicativo. |

**Mudanças no contrato da API:**

Não foram registradas mudanças específicas de contrato nesta etapa. O aplicativo utilizou os endpoints existentes para autenticação, cardápio, pedidos, pagamentos e usuários.

| Endpoint | O que mudou | Quem foi avisado | Contrato atualizado? |
|---|---|---|---|
| Não registrado | Não há alteração específica documentada nesta etapa. | Grupo | Não se aplica / não registrado. |

**Dificuldades:**

Durante o desenvolvimento do aplicativo mobile, uma das principais dificuldades foi realizar a integração entre as telas do Flutter e a API desenvolvida em NestJS, garantindo que os dados enviados e recebidos estivessem de acordo com a estrutura esperada pelo backend. Também foi necessário implementar o gerenciamento da sessão do usuário, controlar o token de autenticação nas requisições e manter as informações atualizadas durante a navegação entre as telas.

Outra dificuldade foi organizar o fluxo de pedidos, desde a seleção dos produtos no cardápio até a criação da comanda e o registro do pagamento, tratando possíveis erros para evitar duplicidade de pedidos. Além disso, foram necessários ajustes nas validações dos formulários e na atualização dos estados da interface durante as operações.

**O que ficou para a próxima etapa:**

Para a próxima etapa, ficaram previstas melhorias na interface do aplicativo, incluindo a possibilidade de apresentar imagens reais dos produtos no cardápio. Também poderá ser implementada a integração com um serviço real de pagamento eletrônico, substituindo a simulação utilizada atualmente para o PIX.

### Etapa 5 — Integração e fechamento

**Período:** 20/11 a 26/11 · **Redigido por:** Grupo

**O que foi ajustado para os três componentes conversarem:**

Foram revisados os mecanismos de autenticação, garantindo que os clientes utilizassem o token JWT nas operações protegidas. Foram realizados ajustes nos serviços responsáveis pela comunicação com a API, permitindo integrar funcionalidades como cadastro, login, consulta do cardápio, gerenciamento de pedidos, comandas e pagamentos.

**Inconsistências encontradas entre os clientes, e como foram resolvidas:**

Foi necessário observar as diferenças entre as estruturas utilizadas no Web e no Mobile, principalmente na representação dos dados e na forma de realizar as requisições. Como cada aplicação utiliza uma tecnologia diferente, foram implementados modelos e serviços próprios para interpretar os dados recebidos da API.

Também foram considerados os diferentes mecanismos de gerenciamento de sessão utilizados por cada cliente. Os ajustes buscaram manter o mesmo padrão de comunicação com o backend, respeitando os contratos e as regras.

**Dificuldades:**

Uma das principais dificuldades foi garantir que as funcionalidades desenvolvidas separadamente funcionassem corretamente quando integradas. Foi necessário revisar requisições, estruturas JSON, autenticação e respostas da API, além de corrigir problemas identificados durante a comunicação entre os componentes.

---

## 4. Arquitetura — decisões e evolução

### 4.1 Estrutura final

A arquitetura do projeto é composta por uma API central em NestJS, com persistência em PostgreSQL por meio do Prisma ORM, uma aplicação Web em Next.js/React/TypeScript e um aplicativo Mobile em Flutter/Dart. A API centraliza os dados, a autenticação e as regras de negócio utilizadas pelos clientes.

Não foram registrados desvios estruturais em relação à organização prevista no README.

| Componente | Desvio em relação ao README | Motivo |
|---|---|---|
| Backend | Não identificado. | A estrutura utiliza NestJS, Prisma e PostgreSQL. |
| Web | Não identificado. | A aplicação utiliza Next.js, React e TypeScript. |
| Mobile | A execução durante o desenvolvimento foi realizada em Windows Desktop. | Foi selecionada a opção Windows ao executar `flutter run`; não foi utilizado emulador Android durante esse desenvolvimento. |

### 4.2 Fronteira entre backend e clientes

As regras de negócio e as validações definitivas permanecem no backend. As interfaces Web e Mobile realizam validações de entrada e cálculos voltados à apresentação, mas encaminham as operações à API, que verifica permissões, disponibilidade, transições de situação, pagamentos e efeitos sobre o estoque. A autenticação e a autorização também são centralizadas na API por meio de JWT e guards.

### 4.3 Nível de autenticação adotado no app mobile

| Aspecto | Registro |
|---|---|
| Nível adotado | Simplificada, com autenticação real por credenciais e utilização de token JWT. |
| Como o app obtém o token | O aplicativo envia o login (e-mail ou apelido) e a senha para o endpoint `POST /auth/login`. Após a autenticação bem-sucedida, a API retorna um token e os dados do usuário. O AuthService interpreta a resposta, e o SessaoService mantém o token e os dados do usuário em memória. Nas requisições protegidas, o token é enviado no cabeçalho Authorization, utilizando o padrão Bearer. |
| O que deixou de ser tratado (expiração, refresh, logout) | Não foi implementado um mecanismo de renovação automática do token (refresh token) nem um tratamento específico para sua expiração no aplicativo. O encerramento da sessão limpa os dados mantidos em memória. |
| Rotas da API afetadas pela escolha | Nenhuma rota precisou ser modificada em razão da implementação mobile. O aplicativo utiliza os endpoints existentes e envia o token nas operações protegidas. |

### 4.4 O que os dois clientes compartilham e o que não

Compartilham o mesmo backend e trabalham com as mesmas entidades principais do sistema. Apesar de utilizarem a mesma API, cada aplicação possui implementação própria para organizar os dados. Portanto, as aplicações compartilham a estrutura de dados e a lógica centralizada no backend, mas possuem diferenças na implementação dos serviços, na representação dos modelos, no tratamento de erros e no gerenciamento da sessão, respeitando as características de cada tecnologia.

---

## 5. Resposta ao RFC

**Houve RFC neste projeto?** Não — seção não aplicável.

Não foi registrado RFC formal publicado para o projeto. As alterações realizadas durante o desenvolvimento foram ajustes de implementação e integração, não uma resposta a uma solicitação formal de RFC.

---

## 6. Reflexão final

### 6.1 O que funcionou bem

A divisão do sistema em componentes, separando as responsabilidades entre backend, aplicação Web e aplicativo Mobile, funcionou bem. Essa organização permitiu que cada parte fosse desenvolvida de maneira mais específica, mantendo a comunicação entre os clientes por meio de uma API centralizada. A utilização do Git e do GitHub contribuiu para o compartilhamento das alterações e para o acompanhamento da evolução do projeto.

### 6.2 O que faria diferente

Definir com mais antecedência os prazos e as entregas esperadas para cada componente. Também seria importante realizar reuniões de acompanhamento com maior frequência, formalizar os contratos da API e reservar mais tempo para testes integrados entre backend, Web e Mobile.

### 6.3 Principais aprendizados

| Componente | Aprendizado |
|---|---|
| Backend | Construção de uma API centralizada, organização dos módulos, implementação das regras de negócio, comunicação com o banco de dados e controle de autenticação e autorização. |
| Web | Aprendizado sobre o desenvolvimento de interfaces com Next.js e React, organização de páginas e componentes, consumo de serviços da API e gerenciamento de sessão conforme os diferentes perfis de acesso. |
| Mobile | Aprendizado sobre o desenvolvimento de aplicações com Flutter e Dart, criação de telas e componentes reutilizáveis, utilização de serviços HTTP, conversão de dados JSON e gerenciamento de estado e sessão. |
| Integração e processo | Compreensão da importância de estabelecer contratos entre os componentes, utilizar controle de versão, organizar a divisão de tarefas e realizar testes de integração para garantir que diferentes aplicações funcionem corretamente utilizando o mesmo backend. |

### 6.4 Autoavaliação

**Nota:** 9/10

**Justificativa:**

Atribuímos a nota 9/10 porque conseguimos desenvolver as principais funcionalidades propostas e avançar na integração do sistema. Entretanto, tivemos dificuldades com o prazo do Mobile, cuja entrega estava prevista para 19/11, mas foi concluída apenas na semana anterior à apresentação, pouco antes da entrega. Além disso, embora o relatório tenha sido atualizado constantemente, não foi compartilhado no GitHub, na pasta `docs`. Apesar desses pontos, consideramos que alcançamos os principais objetivos e adquirimos aprendizados importantes durante o projeto.

---

## 7. Vídeo de apresentação

| Campo | Valor |
|---|---|
| `https://drive.google.com/drive/folders/1UhPZOrO33YWHsWMjXBC7XZlpxhb0_PVA?usp=sharing` |
| **Duração** | 14:28min |
| **Quem fala em cada parte** |1ª parte Frank, 2ª parte Evelyn|

---

## 8. Histórico de revisões

| Versão | Data | Descrição | Quem atualizou |
|---|---|---|---|
| 0.1 | 17/10/2026 | Criação do documento. | Grupo |
| 0.2 | 23/11/2026 | Organização dos registros dos Checkpoints 1, 2 e 3 e adequação ao modelo do relatório técnico. | Grupo |
| 1.0 | 23/11/2026 | Versão final do relatório. | Grupo |
