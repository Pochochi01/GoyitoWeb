-- ============================================================
--  Migration: extender tabla `categories`
--  Agrega slug, descripción, imagen, orden, activo y created_at.
--
--  NOTA: MySQL NO soporta `IF NOT EXISTS` para `ADD COLUMN`.
--  Esta migration está pensada para ejecutarse UNA SOLA VEZ.
--  Si necesitás reaplicarla, primero quitá manualmente las
--  columnas con `ALTER TABLE categories DROP COLUMN ...`.
-- ============================================================

USE goyitoweb;

ALTER TABLE categories
  ADD COLUMN slug        VARCHAR(120) NULL                                            AFTER nombre,
  ADD COLUMN descripcion VARCHAR(255) NULL                                            AFTER slug,
  ADD COLUMN imagen      VARCHAR(500) NULL COMMENT 'Ruta relativa en /uploads'        AFTER descripcion,
  ADD COLUMN orden       INT          NOT NULL DEFAULT 0                              AFTER imagen,
  ADD COLUMN activo      BOOLEAN      NOT NULL DEFAULT TRUE                           AFTER orden,
  ADD COLUMN created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP;

-- Índices
ALTER TABLE categories ADD UNIQUE INDEX uq_categories_slug  (slug);
ALTER TABLE categories ADD        INDEX idx_categories_orden (orden);

-- Backfill: generar slug a partir del nombre para registros existentes
UPDATE categories SET slug = LOWER(
  REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    nombre,
    'á','a'),'é','e'),'í','i'),'ó','o'),'ú','u'),
    'Á','a'),'É','e'),'Í','i'),'Ó','o'),'Ú','u')
) WHERE slug IS NULL;

UPDATE categories SET slug = REPLACE(slug, ' ', '-') WHERE slug LIKE '% %';
