-- ============================================================
--  GoyitoWeb · MySQL Database Schema
--  Normalización: Tercera Forma Normal (3NF)
--  Versión: 1.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS goyitoweb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE goyitoweb;

-- ─────────────────────────────────────────────────────────────
-- 1. CATEGORIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id      INT          AUTO_INCREMENT PRIMARY KEY,
  nombre  VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO categories (nombre) VALUES
  ('Auriculares'),
  ('Laptops'),
  ('Smartwatch'),
  ('Gaming'),
  ('Parlantes'),
  ('Teléfonos');

-- ─────────────────────────────────────────────────────────────
-- 2. USERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             INT          AUTO_INCREMENT PRIMARY KEY,
  username       VARCHAR(100) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  nombre         VARCHAR(150) NOT NULL,
  email          VARCHAR(200) UNIQUE,
  rol            ENUM('admin','pos','comprador') NOT NULL DEFAULT 'comprador',
  activo         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- 3. PRODUCTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           INT           AUTO_INCREMENT PRIMARY KEY,
  titulo       VARCHAR(255)  NOT NULL,
  precio       DECIMAL(10,2) NOT NULL,
  descuento    TINYINT       NOT NULL DEFAULT 0 COMMENT 'Porcentaje 0-100',
  categoria_id INT           NOT NULL,
  imagen       VARCHAR(500)  DEFAULT NULL COMMENT 'Ruta relativa en /uploads',
  activo       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_cat FOREIGN KEY (categoria_id)
    REFERENCES categories(id) ON UPDATE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 4. PRODUCT_STOCK  (1:1 con products)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_stock (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  producto_id   INT           NOT NULL UNIQUE,
  stock         INT           NOT NULL DEFAULT 0,
  stock_minimo  INT           NOT NULL DEFAULT 5,
  ubicacion     VARCHAR(20)   DEFAULT NULL,
  costo         DECIMAL(10,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_stock_prod FOREIGN KEY (producto_id)
    REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 5. STOCK_MOVEMENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_movements (
  id          INT         AUTO_INCREMENT PRIMARY KEY,
  fecha       DATE        NOT NULL,
  producto_id INT         NOT NULL,
  tipo        ENUM('Entrada','Salida','Ajuste','Transferencia') NOT NULL,
  cantidad    INT         NOT NULL,
  motivo      VARCHAR(255) DEFAULT NULL,
  usuario_id  INT         DEFAULT NULL,
  created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mov_prod FOREIGN KEY (producto_id)
    REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_mov_user FOREIGN KEY (usuario_id)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 6. PRICE_HISTORY
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_history (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  producto_id INT           NOT NULL,
  precio      DECIMAL(10,2) NOT NULL,
  motivo      VARCHAR(255)  DEFAULT NULL,
  fecha       DATE          NOT NULL,
  CONSTRAINT fk_ph_prod FOREIGN KEY (producto_id)
    REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 7. SUPPLIERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id         INT           AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(200)  NOT NULL,
  cuit       VARCHAR(20)   NOT NULL UNIQUE,
  contacto   VARCHAR(150)  DEFAULT NULL,
  email      VARCHAR(200)  DEFAULT NULL,
  tel        VARCHAR(50)   DEFAULT NULL,
  cond_pago  VARCHAR(50)   DEFAULT NULL,
  puntaje    DECIMAL(2,1)  NOT NULL DEFAULT 0,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- 8. PURCHASE_ORDERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_orders (
  id           INT           AUTO_INCREMENT PRIMARY KEY,
  fecha        DATE          NOT NULL,
  proveedor_id INT           NOT NULL,
  estado       ENUM('Pendiente','En tránsito','Recibida','Cancelada')
               NOT NULL DEFAULT 'Pendiente',
  comprobante  VARCHAR(100)  DEFAULT NULL,
  dias_entrega INT           DEFAULT NULL,
  total        DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_po_supplier FOREIGN KEY (proveedor_id)
    REFERENCES suppliers(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 9. PURCHASE_ORDER_ITEMS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id               INT           AUTO_INCREMENT PRIMARY KEY,
  orden_id         INT           NOT NULL,
  producto_id      INT           DEFAULT NULL,
  nombre_producto  VARCHAR(255)  NOT NULL COMMENT 'Histórico desnormalizado',
  cantidad         INT           NOT NULL,
  precio_unit      DECIMAL(10,2) NOT NULL,
  subtotal         DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * precio_unit) STORED,
  CONSTRAINT fk_poi_order   FOREIGN KEY (orden_id)    REFERENCES purchase_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_poi_product FOREIGN KEY (producto_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────
-- 10. CUSTOMERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id         INT           AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(200)  NOT NULL,
  email      VARCHAR(200)  NOT NULL UNIQUE,
  segmento   ENUM('VIP','Premium','Regular','Nuevo') NOT NULL DEFAULT 'Nuevo',
  telefono   VARCHAR(50)   DEFAULT NULL,
  usuario_id INT           DEFAULT NULL UNIQUE COMMENT 'FK a users si tiene cuenta',
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cust_user FOREIGN KEY (usuario_id)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 11. SALES_ORDERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales_orders (
  id           INT           AUTO_INCREMENT PRIMARY KEY,
  fecha        DATE          NOT NULL,
  canal        ENUM('E-commerce','POS') NOT NULL,
  cliente_id   INT           DEFAULT NULL,
  operador_id  INT           DEFAULT NULL COMMENT 'Usuario con rol POS',
  estado       ENUM('Pendiente','Pagada','Enviada','Entregada','Cancelada')
               NOT NULL DEFAULT 'Pendiente',
  metodo_pago  ENUM('MercadoPago','Efectivo','Tarjeta Cred','Débito','Transferencia')
               NOT NULL,
  total        DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_so_customer FOREIGN KEY (cliente_id)
    REFERENCES customers(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_so_operator FOREIGN KEY (operador_id)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 12. SALES_ORDER_ITEMS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales_order_items (
  id              INT           AUTO_INCREMENT PRIMARY KEY,
  orden_id        INT           NOT NULL,
  producto_id     INT           DEFAULT NULL,
  nombre_producto VARCHAR(255)  NOT NULL COMMENT 'Histórico desnormalizado',
  cantidad        INT           NOT NULL,
  precio_unit     DECIMAL(10,2) NOT NULL,
  subtotal        DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * precio_unit) STORED,
  CONSTRAINT fk_soi_order   FOREIGN KEY (orden_id)    REFERENCES sales_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_soi_product FOREIGN KEY (producto_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────
-- 13. CART_ITEMS  (carrito persistente por usuario)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id          INT       AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT       NOT NULL,
  producto_id INT       NOT NULL,
  cantidad    INT       NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart (usuario_id, producto_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (usuario_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_prod FOREIGN KEY (producto_id)
    REFERENCES products(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES para rendimiento
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_products_cat      ON products(categoria_id);
CREATE INDEX idx_products_activo   ON products(activo);
CREATE INDEX idx_so_fecha          ON sales_orders(fecha);
CREATE INDEX idx_so_canal          ON sales_orders(canal);
CREATE INDEX idx_so_estado         ON sales_orders(estado);
CREATE INDEX idx_po_fecha          ON purchase_orders(fecha);
CREATE INDEX idx_po_estado         ON purchase_orders(estado);
CREATE INDEX idx_mov_fecha         ON stock_movements(fecha);
CREATE INDEX idx_ph_producto       ON price_history(producto_id, fecha);
