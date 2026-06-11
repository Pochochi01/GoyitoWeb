-- ============================================================
--  Migration: agregar mp_payment_id a sales_orders
--
--  Permite vincular una orden con su pago de MercadoPago de
--  forma única (idempotencia para el sync).
--
--  Se ejecuta UNA SOLA VEZ.
-- ============================================================

USE goyitoweb;

ALTER TABLE sales_orders
  ADD COLUMN mp_payment_id VARCHAR(50) NULL COMMENT 'ID del pago en MercadoPago (para idempotencia del sync)' AFTER metodo_pago;

ALTER TABLE sales_orders
  ADD UNIQUE INDEX uq_sales_orders_mp_payment (mp_payment_id);
