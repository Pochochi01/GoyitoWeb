-- ============================================================
--  GoyitoWeb · Migración v3
--  - Campo barcode en products (único, nullable)
--  - Rol admin_complejo en users
-- ============================================================

USE goyitoweb;

-- 1. barcode en products
SET @hasBarcode = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'goyitoweb' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'barcode'
);
SET @sql = IF(@hasBarcode = 0,
  'ALTER TABLE products ADD COLUMN barcode VARCHAR(100) DEFAULT NULL UNIQUE AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Ampliar ENUM users.rol para incluir admin_complejo
ALTER TABLE users
  MODIFY COLUMN rol ENUM('admin','pos','comprador','admin_complejo') NOT NULL DEFAULT 'comprador';
