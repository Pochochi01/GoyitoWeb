# Migrations — orden de aplicación

Los repositories asumen las tablas definidas en `schema.reference.sql`.
Si arrancás de cero, ese archivo es suficiente. Si migrás desde una base
existente, aplicá las migrations en este orden:

## 1. Base — `schema.reference.sql`

Contiene TODAS las tablas iniciales. Es el snapshot completo del proyecto.

## 2. Extensiones incrementales (las que se agregaron después)

### 2.1 Extender `categories` (slug, imagen, orden, etc.)

Si tenías `categories` con solo `id` y `nombre`:

```sql
ALTER TABLE categories
  ADD COLUMN slug        VARCHAR(120) NULL                                       AFTER nombre,
  ADD COLUMN descripcion VARCHAR(255) NULL                                       AFTER slug,
  ADD COLUMN imagen      VARCHAR(500) NULL COMMENT 'Ruta relativa en /uploads'  AFTER descripcion,
  ADD COLUMN orden       INT NOT NULL DEFAULT 0                                   AFTER imagen,
  ADD COLUMN activo      BOOLEAN NOT NULL DEFAULT TRUE                            AFTER orden,
  ADD COLUMN created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE categories ADD UNIQUE INDEX uq_categories_slug (slug);
ALTER TABLE categories ADD        INDEX idx_categories_orden (orden);
```

### 2.2 Idempotencia MP en `sales_orders`

**CRÍTICO** para la integración con MercadoPago:

```sql
ALTER TABLE sales_orders
  ADD COLUMN mp_payment_id VARCHAR(50) NULL COMMENT 'ID del pago en MercadoPago' AFTER metodo_pago;

ALTER TABLE sales_orders
  ADD UNIQUE INDEX uq_sales_orders_mp_payment (mp_payment_id);
```

### 2.3 OAuth en `users`

```sql
ALTER TABLE users
  ADD COLUMN google_id   VARCHAR(50)  NULL                        AFTER email,
  ADD COLUMN avatar_url  VARCHAR(500) NULL                        AFTER google_id,
  ADD COLUMN provider    VARCHAR(20)  NOT NULL DEFAULT 'local'    AFTER avatar_url;

ALTER TABLE users ADD UNIQUE INDEX uq_users_google_id (google_id);

-- Permitir password_hash NULL para usuarios OAuth-only:
ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL;
```

### 2.4 Ampliar ENUM de roles (si tenías 'admin', 'pos', 'comprador')

```sql
ALTER TABLE users
  MODIFY COLUMN rol ENUM('admin','pos','comprador','admin_complejo') NOT NULL DEFAULT 'comprador';
```

## 3. Notas por motor de BD

- **PostgreSQL**: `ENUM` requiere `CREATE TYPE`. `AUTO_INCREMENT` → `SERIAL` o `GENERATED ALWAYS AS IDENTITY`. `TINYINT` → `SMALLINT`. `ON UPDATE CASCADE` está OK. `subtotal GENERATED ... STORED` → `GENERATED ALWAYS AS ... STORED`.

- **SQLite**: sin ENUM (usar CHECK). Sin FK por default (`PRAGMA foreign_keys=ON`).

- **MongoDB / NoSQL**: usar validación con `$jsonSchema`. Las FK no existen; adaptar el código para no confiar en integridad referencial declarativa (los repositories la deben simular).

## 4. Datos semilla mínimos

Insertar al menos:

```sql
-- Categorías iniciales
INSERT INTO categories (nombre) VALUES
  ('General'), ('Sin categorizar');

-- Un usuario admin (password_hash generado con bcrypt.hash('tu_password', 12))
INSERT INTO users (username, password_hash, nombre, email, rol)
VALUES ('admin', '$2a$12$...hash...', 'Administrador', 'admin@tu-dominio.com', 'admin');
```
