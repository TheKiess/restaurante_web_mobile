-- Corrige a relação entre Comanda e Usuario
ALTER TABLE "Comanda"
DROP CONSTRAINT "Comanda_id_cliente_fkey";

ALTER TABLE "Comanda"
ADD CONSTRAINT "Comanda_id_cliente_fkey"
FOREIGN KEY ("id_cliente")
REFERENCES "Usuario"("id_usuario")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Corrige a relação entre ItemPedido e Usuario
ALTER TABLE "ItemPedido"
DROP CONSTRAINT "ItemPedido_id_usuario_fkey";

ALTER TABLE "ItemPedido"
ADD CONSTRAINT "ItemPedido_id_usuario_fkey"
FOREIGN KEY ("id_usuario")
REFERENCES "Usuario"("id_usuario")
ON DELETE SET NULL
ON UPDATE CASCADE;