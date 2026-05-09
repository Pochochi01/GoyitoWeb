-- ============================================================
--  GoyitoWeb · Product Extras Migration
--  Agrega: descripcion en products + tabla product_images
-- ============================================================

USE goyitoweb;

-- 1. Columna descripcion en products
SET @hasDesc = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'goyitoweb' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'descripcion'
);
SET @sql = IF(@hasDesc = 0,
  'ALTER TABLE products ADD COLUMN descripcion TEXT DEFAULT NULL AFTER imagen',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Tabla de imágenes adicionales (hasta 4 por producto)
CREATE TABLE IF NOT EXISTS product_images (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  producto_id INT          NOT NULL,
  ruta        VARCHAR(500) NOT NULL COMMENT 'Ruta relativa en /uploads',
  orden       TINYINT      NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pi_product FOREIGN KEY (producto_id)
    REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índice (la tabla es nueva, el índice siempre se crea aquí)
CREATE INDEX idx_pi_producto ON product_images(producto_id);
