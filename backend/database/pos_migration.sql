-- ============================================================
--  GoyitoWeb · POS Migration  (compatible MySQL 5.7 / 8.x)
-- ============================================================

USE goyitoweb;

-- 1. Sucursales
CREATE TABLE IF NOT EXISTS pos_branches (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  direccion  VARCHAR(200) DEFAULT NULL,
  telefono   VARCHAR(50)  DEFAULT NULL,
  activa     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO pos_branches (id, nombre, direccion) VALUES
  (1, 'Sucursal Central', 'Av. Principal 123'),
  (2, 'Sucursal Norte',   'Calle Norte 456');

-- 2. sucursal_id en sales_orders (solo si no existe)
SET @col = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'goyitoweb'
    AND TABLE_NAME   = 'sales_orders'
    AND COLUMN_NAME  = 'sucursal_id'
);
SET @sql = IF(@col = 0,
  'ALTER TABLE sales_orders ADD COLUMN sucursal_id INT DEFAULT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. FK sales_orders → pos_branches (solo si no existe)
SET @fk1 = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA   = 'goyitoweb'
    AND TABLE_NAME     = 'sales_orders'
    AND CONSTRAINT_NAME= 'fk_so_branch'
);
SET @sql = IF(@fk1 = 0,
  'ALTER TABLE sales_orders ADD CONSTRAINT fk_so_branch FOREIGN KEY (sucursal_id) REFERENCES pos_branches(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. sucursal_id en users
SET @col2 = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'goyitoweb'
    AND TABLE_NAME   = 'users'
    AND COLUMN_NAME  = 'sucursal_id'
);
SET @sql = IF(@col2 = 0,
  'ALTER TABLE users ADD COLUMN sucursal_id INT DEFAULT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. FK users → pos_branches
SET @fk2 = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA   = 'goyitoweb'
    AND TABLE_NAME     = 'users'
    AND CONSTRAINT_NAME= 'fk_user_branch'
);
SET @sql = IF(@fk2 = 0,
  'ALTER TABLE users ADD CONSTRAINT fk_user_branch FOREIGN KEY (sucursal_id) REFERENCES pos_branches(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
