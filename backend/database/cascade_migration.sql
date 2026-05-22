-- ============================================================
--  Migración: corregir FKs sin ON DELETE
--  Ejecutar UNA sola vez sobre la BD existente.
--
--  Problema raíz:
--    · fk_mov_prod    → bloquea DELETE en products si hay movimientos de stock
--    · fk_po_supplier → bloquea DELETE en suppliers si tiene órdenes de compra
--
--  Solución:
--    · Ambas FKs pasan a ON DELETE CASCADE.
--    · El backend también elimina los registros dependientes antes del padre
--      (doble seguridad: si la migración no se corre, el backend igual funciona).
-- ============================================================

-- ── 1. stock_movements → products ────────────────────────────
--    Antes: ON UPDATE CASCADE  (sin ON DELETE)
--    Ahora: ON DELETE CASCADE  ON UPDATE CASCADE
ALTER TABLE stock_movements
  DROP FOREIGN KEY fk_mov_prod;

ALTER TABLE stock_movements
  ADD CONSTRAINT fk_mov_prod
  FOREIGN KEY (producto_id)
  REFERENCES products(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- ── 2. purchase_orders → suppliers ───────────────────────────
--    Antes: ON UPDATE CASCADE  (sin ON DELETE)
--    Ahora: ON DELETE CASCADE  ON UPDATE CASCADE
--    Efecto: borrar un supplier elimina sus purchase_orders,
--            y fk_poi_order (ya CASCADE) elimina sus items también.
ALTER TABLE purchase_orders
  DROP FOREIGN KEY fk_po_supplier;

ALTER TABLE purchase_orders
  ADD CONSTRAINT fk_po_supplier
  FOREIGN KEY (proveedor_id)
  REFERENCES suppliers(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
