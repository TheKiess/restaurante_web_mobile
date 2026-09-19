-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('GERENCIA', 'GARCOM', 'COZINHA');

-- CreateEnum
CREATE TYPE "SituacaoComanda" AS ENUM ('ABERTA', 'FECHADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "SituacaoItemPedido" AS ENUM ('AGUARDANDO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('DINHEIRO', 'CARTAO', 'PIX');

-- CreateTable
CREATE TABLE "Cliente" (
    "id_cliente" SERIAL NOT NULL,
    "nome_cliente" TEXT NOT NULL,
    "cpf_cliente" TEXT,
    "email_cliente" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "telefone" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "Funcionario" (
    "id_funcionario" SERIAL NOT NULL,
    "nome_funcionario" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "email_func" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL,

    CONSTRAINT "Funcionario_pkey" PRIMARY KEY ("id_funcionario")
);

-- CreateTable
CREATE TABLE "Mesa" (
    "id_mesa" SERIAL NOT NULL,
    "nr_mesa" INTEGER NOT NULL,
    "qt_lugares" INTEGER NOT NULL,

    CONSTRAINT "Mesa_pkey" PRIMARY KEY ("id_mesa")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nome_categoria" TEXT NOT NULL,
    "categoria_pai_id" INTEGER,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "ItemCardapio" (
    "id_item_cardapio" SERIAL NOT NULL,
    "nome_item" TEXT NOT NULL,
    "descricao_item" TEXT,
    "valorunitario" DECIMAL(10,2) NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "id_categoria" INTEGER NOT NULL,

    CONSTRAINT "ItemCardapio_pkey" PRIMARY KEY ("id_item_cardapio")
);

-- CreateTable
CREATE TABLE "Comanda" (
    "id_comanda" SERIAL NOT NULL,
    "id_mesa" INTEGER,
    "id_funcionario" INTEGER,
    "id_cliente" INTEGER,
    "situacao" "SituacaoComanda" NOT NULL DEFAULT 'ABERTA',
    "data_abertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_fechamento" TIMESTAMP(3),

    CONSTRAINT "Comanda_pkey" PRIMARY KEY ("id_comanda")
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "id_item_pedido" SERIAL NOT NULL,
    "id_comanda" INTEGER NOT NULL,
    "id_item_cardapio" INTEGER NOT NULL,
    "qt_quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "ds_observacao" TEXT,
    "situacao" "SituacaoItemPedido" NOT NULL DEFAULT 'AGUARDANDO',

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("id_item_pedido")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id_pagamento" SERIAL NOT NULL,
    "id_comanda" INTEGER NOT NULL,
    "valor_pago" DECIMAL(10,2) NOT NULL,
    "forma_pagamento" "FormaPagamento" NOT NULL,
    "data_pagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id_pagamento")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cpf_cliente_key" ON "Cliente"("cpf_cliente");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_cliente_key" ON "Cliente"("email_cliente");

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_login_key" ON "Funcionario"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_email_func_key" ON "Funcionario"("email_func");

-- CreateIndex
CREATE UNIQUE INDEX "Mesa_nr_mesa_key" ON "Mesa"("nr_mesa");

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_categoria_pai_id_fkey" FOREIGN KEY ("categoria_pai_id") REFERENCES "Categoria"("id_categoria") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCardapio" ADD CONSTRAINT "ItemCardapio_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "Categoria"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_id_mesa_fkey" FOREIGN KEY ("id_mesa") REFERENCES "Mesa"("id_mesa") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_id_funcionario_fkey" FOREIGN KEY ("id_funcionario") REFERENCES "Funcionario"("id_funcionario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id_cliente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_id_comanda_fkey" FOREIGN KEY ("id_comanda") REFERENCES "Comanda"("id_comanda") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_id_item_cardapio_fkey" FOREIGN KEY ("id_item_cardapio") REFERENCES "ItemCardapio"("id_item_cardapio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_id_comanda_fkey" FOREIGN KEY ("id_comanda") REFERENCES "Comanda"("id_comanda") ON DELETE RESTRICT ON UPDATE CASCADE;
