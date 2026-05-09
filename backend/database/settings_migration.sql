-- ── Configuraciones del sitio ──────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  clave      VARCHAR(100)  NOT NULL,
  valor      TEXT,
  updated_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (clave)
);

-- Valores por defecto
INSERT IGNORE INTO site_settings (clave, valor) VALUES
  ('whatsapp_numero',  ''),
  ('whatsapp_mensaje', 'Hola! Me comunico desde la tienda online de Goyito''s Digital.');
