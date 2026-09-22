-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('GERENCIA', 'GARCOM', 'COZINHA', 'CLIENTE');

-- CreateEnum
CREATE TYPE "SituacaoReserva" AS ENUM ('CONFIRMADA', 'CHECKIN', 'CANCELADA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "TipoItem" AS ENUM ('PREPARADO', 'REVENDA');

-- CreateEnum
CREATE TYPE "UnidadeMedida" AS ENUM ('UN', 'KG', 'G', 'L', 'ML');

-- CreateEnum
CREATE TYPE "TipoMovimento" AS ENUM ('ENTRADA', 'SAIDA', 'PERDA');

-- CreateEnum
CREATE TYPE "SituacaoComanda" AS ENUM ('ABERTA', 'FECHADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "SituacaoItemPedido" AS ENUM ('AGUARDANDO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "SituacaoPagamento" AS ENUM ('PENDENTE', 'CONFIRMADO', 'RECUSADO');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('DINHEIRO', 'CARTAO', 'PIX');

-- CreateTable
CREATE TABLE "Pessoa" (
    "id_pessoa" SERIAL NOT NULL,
    "nm_pessoa" TEXT NOT NULL,
    "ds_cnpj_cpf" TEXT,
    "ds_email" TEXT,
    "ds_telefone" TEXT,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id_pessoa")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "id_pessoa" INTEGER NOT NULL,
    "ds_apelido" TEXT NOT NULL,
    "ds_senha" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL DEFAULT 'CLIENTE',
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Mesa" (
    "id_mesa" SERIAL NOT NULL,
    "nr_mesa" INTEGER NOT NULL,
    "qt_lugares" INTEGER NOT NULL,

    CONSTRAINT "Mesa_pkey" PRIMARY KEY ("id_mesa")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id_reserva" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_mesa" INTEGER NOT NULL,
    "qt_pessoas" INTEGER NOT NULL,
    "dt_reserva" TIMESTAMP(3) NOT NULL,
    "dt_limite_checkin" TIMESTAMP(3) NOT NULL,
    "dt_checkin" TIMESTAMP(3),
    "id_situacao" "SituacaoReserva" NOT NULL DEFAULT 'CONFIRMADA',
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id_reserva")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nm_categoria" TEXT NOT NULL,
    "id_categoria_pai" INTEGER,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "ItemCardapio" (
    "id_item_cardapio" SERIAL NOT NULL,
    "id_categoria" INTEGER NOT NULL,
    "nm_item" TEXT NOT NULL,
    "ds_item" TEXT,
    "vl_unitario" DECIMAL(10,2) NOT NULL,
    "tipo_item" "TipoItem" NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ItemCardapio_pkey" PRIMARY KEY ("id_item_cardapio")
);

-- CreateTable
CREATE TABLE "Insumo" (
    "id_insumo" SERIAL NOT NULL,
    "nm_insumo" TEXT NOT NULL,
    "unidade_medida" "UnidadeMedida" NOT NULL,
    "qt_estoque" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "qt_estoque_minimo" DECIMAL(10,3) NOT NULL DEFAULT 0,

    CONSTRAINT "Insumo_pkey" PRIMARY KEY ("id_insumo")
);

-- CreateTable
CREATE TABLE "Receita" (
    "id_item_cardapio" INTEGER NOT NULL,
    "id_insumo" INTEGER NOT NULL,
    "qt_insumo" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "Receita_pkey" PRIMARY KEY ("id_item_cardapio","id_insumo")
);

-- CreateTable
CREATE TABLE "MovimentoEstoque" (
    "id_movimento_estoque" SERIAL NOT NULL,
    "id_insumo" INTEGER NOT NULL,
    "id_item_pedido" INTEGER,
    "tipo_movimento" "TipoMovimento" NOT NULL,
    "qt_movimento" DECIMAL(10,3) NOT NULL,
    "ds_motivo" TEXT,
    "dt_movimento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimentoEstoque_pkey" PRIMARY KEY ("id_movimento_estoque")
);

-- CreateTable
CREATE TABLE "Comanda" (
    "id_comanda" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_mesa" INTEGER,
    "id_reserva" INTEGER,
    "id_situacao" "SituacaoComanda" NOT NULL DEFAULT 'ABERTA',
    "dt_abertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dt_fechamento" TIMESTAMP(3),

    CONSTRAINT "Comanda_pkey" PRIMARY KEY ("id_comanda")
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "id_item_pedido" SERIAL NOT NULL,
    "id_comanda" INTEGER NOT NULL,
    "id_item_cardapio" INTEGER NOT NULL,
    "qt_quantidade" INTEGER NOT NULL,
    "vl_unitario" DECIMAL(10,2) NOT NULL,
    "ds_observacao" TEXT,
    "id_situacao" "SituacaoItemPedido" NOT NULL DEFAULT 'AGUARDANDO',
    "dt_pedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("id_item_pedido")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id_pagamento" SERIAL NOT NULL,
    "id_comanda" INTEGER NOT NULL,
    "vl_pago" DECIMAL(10,2) NOT NULL,
    "forma_pagamento" "FormaPagamento" NOT NULL,
    "id_situacao" "SituacaoPagamento" NOT NULL DEFAULT 'PENDENTE',
    "ds_id_externo" TEXT,
    "dt_pagamento" TIMESTAMP(3),

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id_pagamento")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_ds_cnpj_cpf_key" ON "Pessoa"("ds_cnpj_cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_ds_email_key" ON "Pessoa"("ds_email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_id_pessoa_key" ON "Usuario"("id_pessoa");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_ds_apelido_key" ON "Usuario"("ds_apelido");

-- CreateIndex
CREATE UNIQUE INDEX "Mesa_nr_mesa_key" ON "Mesa"("nr_mesa");

-- CreateIndex
CREATE INDEX "Reserva_dt_reserva_id_mesa_idx" ON "Reserva"("dt_reserva", "id_mesa");

-- CreateIndex
CREATE UNIQUE INDEX "Insumo_nm_insumo_key" ON "Insumo"("nm_insumo");

-- CreateIndex
CREATE UNIQUE INDEX "Comanda_id_reserva_key" ON "Comanda"("id_reserva");

-- CreateIndex
CREATE INDEX "Comanda_id_usuario_idx" ON "Comanda"("id_usuario");

-- CreateIndex
CREATE INDEX "Comanda_dt_abertura_idx" ON "Comanda"("dt_abertura");

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_ds_id_externo_key" ON "Pagamento"("ds_id_externo");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_id_pessoa_fkey" FOREIGN KEY ("id_pessoa") REFERENCES "Pessoa"("id_pessoa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_id_mesa_fkey" FOREIGN KEY ("id_mesa") REFERENCES "Mesa"("id_mesa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_id_categoria_pai_fkey" FOREIGN KEY ("id_categoria_pai") REFERENCES "Categoria"("id_categoria") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCardapio" ADD CONSTRAINT "ItemCardapio_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "Categoria"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receita" ADD CONSTRAINT "Receita_id_item_cardapio_fkey" FOREIGN KEY ("id_item_cardapio") REFERENCES "ItemCardapio"("id_item_cardapio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receita" ADD CONSTRAINT "Receita_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "Insumo"("id_insumo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoEstoque" ADD CONSTRAINT "MovimentoEstoque_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "Insumo"("id_insumo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoEstoque" ADD CONSTRAINT "MovimentoEstoque_id_item_pedido_fkey" FOREIGN KEY ("id_item_pedido") REFERENCES "ItemPedido"("id_item_pedido") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_id_mesa_fkey" FOREIGN KEY ("id_mesa") REFERENCES "Mesa"("id_mesa") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "Reserva"("id_reserva") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_id_comanda_fkey" FOREIGN KEY ("id_comanda") REFERENCES "Comanda"("id_comanda") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_id_item_cardapio_fkey" FOREIGN KEY ("id_item_cardapio") REFERENCES "ItemCardapio"("id_item_cardapio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_id_comanda_fkey" FOREIGN KEY ("id_comanda") REFERENCES "Comanda"("id_comanda") ON DELETE RESTRICT ON UPDATE CASCADE;
