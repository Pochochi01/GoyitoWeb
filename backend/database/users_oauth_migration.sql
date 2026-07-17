-- ============================================================
--  Migration: agregar soporte de OAuth (Google) a users
--
--  · google_id    — ID único de Google (sub del token JWT de Google)
--  · avatar_url   — foto de perfil del usuario
--  · provider     — origen del registro: 'local' (email/pass) o 'google'
--  · password_hash — pasa a NULL (los usuarios Google-only no tienen pass)
--
--  Se ejecuta UNA SOLA VEZ.
-- ============================================================

USE goyitoweb;

ALTER TABLE users
  ADD COLUMN google_id   VARCHAR(50)  NULL                AFTER email,
  ADD COLUMN avatar_url  VARCHAR(500) NULL                AFTER google_id,
  ADD COLUMN provider    VARCHAR(20)  NOT NULL DEFAULT 'local' AFTER avatar_url;

-- google_id debe ser único pero permitir múltiples NULL (usuarios locales)
ALTER TABLE users
  ADD UNIQUE INDEX uq_users_google_id (google_id);

-- Permitir password_hash NULL para usuarios Google-only.
-- ATENCIÓN: tu auth tradicional debe seguir validando que password_hash NO sea NULL
-- antes de comparar bcrypt (ya lo hace authController.login con `if (!match)`).
ALTER TABLE users
  MODIFY COLUMN password_hash VARCHAR(255) NULL;
