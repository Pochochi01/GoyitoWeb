-- ============================================================
--  Schema de REFERENCIA (comentado) — tablas que espera el blueprint.
--
--  Está escrito en dialecto MySQL/MariaDB. Adaptar tipos a tu motor:
--    - Postgres: DECIMAL igual, TINYINT → SMALLINT, TIMESTAMP DEFAULT NOW(),
--                ENUM se usa como CHECK constraint o tipos custom, AUTO_INCREMENT → SERIAL/IDENTITY,
--                ON UPDATE CURRENT_TIMESTAMP no existe → usar trigger o omitir.
--    - MongoDB: convertir a colecciones — las FK se manejan por lookup.
--    - Sequelize/Prisma: usar tipos del ORM en las migrations.
--
--  Este NO es un script listo para ejecutar en un motor distinto a MySQL.
--  Sirve como CONTRATO de datos que los repositories deben cumplir.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. CATEGORIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL UNIQUE,
  slug        VARCHAR(120) NULL UNIQUE,
  descripcion VARCHAR(255) NULL,
  imagen      VARCHAR(500) NULL,                 -- ruta relativa en /uploads
  orden       INT NOT NULL DEFAULT 0,
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categories_orden (orden)
);

-- ─────────────────────────────────────────────────────────────
-- 2. USERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE users (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  username       VARCHAR(100) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NULL,               -- NULL para usuarios OAuth-only
  nombre         VARCHAR(150) NOT NULL,
  email          VARCHAR(200) UNIQUE,
  google_id      VARCHAR(50)  UNIQUE NULL,        -- OAuth
  avatar_url     VARCHAR(500) NULL,
  provider       VARCHAR(20)  NOT NULL DEFAULT 'local',  -- 'local' | 'google'
  rol            ENUM('admin','pos','comprador','admin_complejo') NOT NULL DEFAULT 'comprador',
  activo         BOOLEAN NOT NULL DEFAULT TRUE,
  sucursal_id    INT NULL,                        -- solo para rol 'pos'
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- 3. PRODUCTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE products (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  barcode      VARCHAR(50)   UNIQUE NULL,
  titulo       VARCHAR(255)  NOT NULL,
  precio       DECIMAL(10,2) NOT NULL,
  descuento    TINYINT       NOT NULL DEFAULT 0,  -- 0..100
  categoria_id INT           NOT NULL,
  imagen       VARCHAR(500)  NULL,
  descripcion  TEXT          NULL,
  activo       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_cat FOREIGN KEY (categoria_id)
    REFERENCES categories(id) ON UPDATE CASCADE,
  INDEX idx_products_cat     (categoria_id),
  INDEX idx_products_activo  (activo)
);

CREATE TABLE product_images (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  ruta        VARCHAR(500) NOT NULL,
  orden       INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_pi_prod FOREIGN KEY (producto_id)
    REFERENCES products(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 4. PRODUCT_STOCK
-- ─────────────────────────────────────────────────────────────
CREATE TABLE product_stock (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  producto_id   INT NOT NULL UNIQUE,
  stock         INT NOT NULL DEFAULT 0,
  stock_minimo  INT NOT NULL DEFAULT 5,
  ubicacion     VARCHAR(20) NULL,
  costo         DECIMAL(10,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_stock_prod FOREIGN KEY (producto_id)
    REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 5. STOCK_MOVEMENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE stock_movements (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  fecha       DATE NOT NULL,
  producto_id INT NOT NULL,
  tipo        ENUM('Entrada','Salida','Ajuste','Transferencia') NOT NULL,
  cantidad    INT NOT NULL,
  motivo      VARCHAR(255) NULL,
  usuario_id  INT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mov_prod FOREIGN KEY (producto_id)
    REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_mov_user FOREIGN KEY (usuario_id)
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_mov_fecha (fecha)
);

-- ─────────────────────────────────────────────────────────────
-- 6. PRICE_HISTORY
-- ─────────────────────────────────────────────────────────────
CREATE TABLE price_history (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  precio      DECIMAL(10,2) NOT NULL,
  motivo      VARCHAR(255) NULL,
  fecha       DATE NOT NULL,
  CONSTRAINT fk_ph_prod FOREIGN KEY (producto_id)
    REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_ph_producto (producto_id, fecha)
);

-- ─────────────────────────────────────────────────────────────
-- 7. SUPPLIERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE suppliers (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(200) NOT NULL,
  cuit       VARCHAR(20)  NOT NULL UNIQUE,
  contacto   VARCHAR(150) NULL,
  email      VARCHAR(200) NULL,
  tel        VARCHAR(50)  NULL,
  cond_pago  VARCHAR(50)  NULL,
  puntaje    DECIMAL(2,1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- 8. PURCHASE_ORDERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE purchase_orders (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  fecha        DATE NOT NULL,
  proveedor_id INT NOT NULL,
  estado       ENUM('Pendiente','En tránsito','Recibida','Cancelada') NOT NULL DEFAULT 'Pendiente',
  comprobante  VARCHAR(100) NULL,
  dias_entrega INT NULL,
  total        DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_po_supplier FOREIGN KEY (proveedor_id)
    REFERENCES suppliers(id) ON DELETE CASCADE
);

CREATE TABLE purchase_order_items (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  orden_id         INT NOT NULL,
  producto_id      INT NULL,
  nombre_producto  VARCHAR(255) NOT NULL,  -- histórico desnormalizado
  cantidad         INT NOT NULL,
  precio_unit      DECIMAL(10,2) NOT NULL,
  subtotal         DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * precio_unit) STORED,
  CONSTRAINT fk_poi_order   FOREIGN KEY (orden_id)    REFERENCES purchase_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_poi_product FOREIGN KEY (producto_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────
-- 9. CUSTOMERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE customers (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(200) NOT NULL,
  email      VARCHAR(200) NOT NULL UNIQUE,
  segmento   ENUM('VIP','Premium','Regular','Nuevo') NOT NULL DEFAULT 'Nuevo',
  telefono   VARCHAR(50) NULL,
  usuario_id INT NULL UNIQUE,  -- link a users si tiene cuenta
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cust_user FOREIGN KEY (usuario_id)
    REFERENCES users(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────
-- 10. SALES_ORDERS  ← incluye mp_payment_id para idempotencia
-- ─────────────────────────────────────────────────────────────
CREATE TABLE sales_orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  fecha         DATE NOT NULL,
  canal         ENUM('E-commerce','POS') NOT NULL,
  cliente_id    INT NULL,
  operador_id   INT NULL,          -- usuario POS
  estado        ENUM('Pendiente','Pagada','Enviada','Entregada','Cancelada')
                NOT NULL DEFAULT 'Pendiente',
  metodo_pago   ENUM('MercadoPago','Efectivo','Tarjeta Cred','Débito','Transferencia') NOT NULL,
  mp_payment_id VARCHAR(50) NULL UNIQUE,  -- ← CRÍTICO: idempotencia MP
  total         DECIMAL(12,2) NOT NULL DEFAULT 0,
  sucursal_id   INT NULL,          -- para ventas POS
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_so_customer FOREIGN KEY (cliente_id)  REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_so_operator FOREIGN KEY (operador_id) REFERENCES users(id)     ON DELETE SET NULL,
  INDEX idx_so_fecha  (fecha),
  INDEX idx_so_canal  (canal),
  INDEX idx_so_estado (estado)
);

CREATE TABLE sales_order_items (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  orden_id        INT NOT NULL,
  producto_id     INT NULL,   -- SET NULL si el producto se elimina (mantiene historial)
  nombre_producto VARCHAR(255) NOT NULL,
  cantidad        INT NOT NULL,
  precio_unit     DECIMAL(10,2) NOT NULL,
  subtotal        DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * precio_unit) STORED,
  CONSTRAINT fk_soi_order   FOREIGN KEY (orden_id)    REFERENCES sales_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_soi_product FOREIGN KEY (producto_id) REFERENCES products(id)     ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────
-- 11. CART_ITEMS (carrito persistente por usuario)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE cart_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad    INT NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart (usuario_id, producto_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (usuario_id)  REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_cart_prod FOREIGN KEY (producto_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 12. USER_ADDRESSES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE user_addresses (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id    INT NOT NULL,
  alias         VARCHAR(50) NOT NULL DEFAULT 'Casa',
  calle         VARCHAR(200) NOT NULL,
  numero        VARCHAR(20) NULL,
  piso          VARCHAR(20) NULL,
  ciudad        VARCHAR(100) NOT NULL,
  provincia     VARCHAR(100) NULL,
  codigo_postal VARCHAR(20) NULL,
  es_principal  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_addr_user FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 13. REVIEWS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  orden_id   INT NOT NULL,
  usuario_id INT NOT NULL,
  rating     TINYINT NOT NULL,   -- 1..5
  reseña     TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_review (orden_id, usuario_id),
  CONSTRAINT fk_rv_order FOREIGN KEY (orden_id)   REFERENCES sales_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_rv_user  FOREIGN KEY (usuario_id) REFERENCES users(id)        ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 14. SITE_SETTINGS  (clave-valor)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE site_settings (
  clave VARCHAR(100) PRIMARY KEY,
  valor TEXT
);

-- ─────────────────────────────────────────────────────────────
-- 15. POS_BRANCHES  (sucursales para el POS)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE pos_branches (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) NULL,
  telefono  VARCHAR(50) NULL,
  activa    BOOLEAN NOT NULL DEFAULT TRUE
);
