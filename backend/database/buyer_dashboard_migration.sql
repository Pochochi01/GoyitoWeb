-- ============================================================
--  GoyitoWeb · Buyer Dashboard Migration
--  - user_addresses: hasta 3 direcciones de envío por usuario
--  - reviews:        una reseña por orden (solo cuando Entregada)
-- ============================================================

USE goyitoweb;

-- ─── 1. Direcciones de envío ─────────────────────────────────
CREATE TABLE IF NOT EXISTS user_addresses (
  id             INT           AUTO_INCREMENT PRIMARY KEY,
  usuario_id     INT           NOT NULL,
  alias          VARCHAR(50)   NOT NULL DEFAULT 'Casa'  COMMENT 'Casa / Trabajo / Otro',
  calle          VARCHAR(200)  NOT NULL,
  numero         VARCHAR(20)   DEFAULT NULL,
  piso           VARCHAR(30)   DEFAULT NULL              COMMENT 'Piso / Depto',
  ciudad         VARCHAR(100)  NOT NULL,
  provincia      VARCHAR(100)  DEFAULT NULL,
  codigo_postal  VARCHAR(20)   DEFAULT NULL,
  es_principal   BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_addr_user FOREIGN KEY (usuario_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_addr_usuario ON user_addresses(usuario_id);

-- ─── 2. Reseñas de compra ─────────────────────────────────────
-- Una reseña por orden, habilitada solo cuando el estado = 'Entregada'
CREATE TABLE IF NOT EXISTS reviews (
  id          INT        AUTO_INCREMENT PRIMARY KEY,
  orden_id    INT        NOT NULL,
  usuario_id  INT        NOT NULL,
  rating      TINYINT    NOT NULL COMMENT '1-5 estrellas',
  reseña      TEXT       DEFAULT NULL,
  created_at  TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_review         UNIQUE KEY (orden_id, usuario_id),
  CONSTRAINT fk_review_orden   FOREIGN KEY (orden_id)   REFERENCES sales_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_user    FOREIGN KEY (usuario_id) REFERENCES users(id)        ON DELETE CASCADE,
  CONSTRAINT chk_rating        CHECK (rating BETWEEN 1 AND 5)
);
