# Arquitectura — decisiones técnicas del blueprint

## Patrón general: MVC + Repository

```
Request → Route → Middleware → Controller → Repository → DB
                                  ↓
                              Service (helpers reutilizables)
```

- **Route**: define método HTTP + path + orden de middlewares.
- **Middleware**: auth, role, optionalAuth, error handler, multer error handler.
- **Controller**: valida input, orquesta llamadas a repositories, arma la respuesta HTTP.
- **Repository**: única capa que habla con la BD. Interfaces documentadas.
- **Service**: helpers puros o wrappers de librerías externas (JWT, Sharp, MercadoPago).

**Ventaja del repository pattern**: cambiar de MySQL a Postgres, Prisma o Mongo
solo implica reescribir los archivos en `repositories/`. Los controllers no cambian.

## Auth stateless con JWT

### Por qué JWT y no sessions

- No requiere store persistente (Redis, MongoStore).
- Escala horizontal sin sticky sessions.
- Se usa el mismo token para browser (cookie) y clientes API (Bearer).

### Doble persistencia: cookie + localStorage

- **Cookie httpOnly** (`token`): fuente de verdad para requests server-side.
  No accesible desde JS → resiste XSS.
- **localStorage** (`goyito_token`): usado por axios para mandar
  `Authorization: Bearer`. Es la única forma de que fetch/axios lo mande
  automáticamente si el frontend hace requests a otro subdominio.

El `authMiddleware` acepta cualquiera de los dos.

## OAuth con Passport en modo stateless

- `passport.authenticate('google', { session: false })` — sin `serializeUser`,
  sin `express-session`.
- El callback firma un JWT del mismo formato que el login tradicional.
- Redirige al frontend con `?token=` para que persista en localStorage.

### Política de linkeo por email

Si un usuario existente (login tradicional) entra con Google usando el mismo
email → se linkea automáticamente. `google_id` se agrega al registro existente.

Alternativa más estricta (no implementada): pedir confirmación antes de linkear.

## MercadoPago — 5 decisiones clave

### 1. Creación diferida de la orden

La orden NO se crea antes del pago. Se crea recién cuando MP aprueba, en el
`sync` (usuario vuelve) o en el `webhook` (MP notifica async).

**Evita**: órdenes zombie en "Pendiente" si el usuario cancela o cierra MP.
**Trade-off**: no hay ID de orden para mostrarle al usuario antes de pagar.

### 2. Doble reconciliación (webhook + sync)

Ambos caminos ejecutan el mismo helper `_syncFromMercadoPago`.

- **Webhook** cubre: usuario cerró el navegador antes de volver.
- **Sync** cubre: dev local sin URL pública (MP no puede llegar al webhook).

### 3. Idempotencia por `mp_payment_id UNIQUE`

- Antes de crear, buscar por `mp_payment_id`. Si existe, solo actualizar estado.
- El UNIQUE INDEX es la última defensa contra race conditions webhook↔sync.
- El código intercepta `ER_DUP_ENTRY` (MySQL) / `23505` (Postgres) y hace fallback a lookup.

### 4. NO confiar en query params

Los params de la URL de retorno pueden ser falsificados. Siempre re-consultar
a MP con `paymentAPI.get({id})` usando el access token del backend.

### 5. Metadata para reconstruir la orden

Los items y datos del cliente van en `metadata` de la preference. Al consultar
el payment, MP devuelve ese metadata → el backend arma la orden desde ahí.

**Trade-off**: MP tiene límite de tamaño (~500 items). Para carritos muy grandes
conviene una tabla `mp_checkout_drafts` temporal.

## Uploads — Multer + Sharp

- **Multer** con `memoryStorage`: recibe el archivo en RAM.
- **Sharp** procesa el buffer: `rotate()` (EXIF) → `resize(1200, inside, withoutEnlargement)` → `webp(quality: 82)`.
- Guardado como `.webp` en `/uploads`.
- Handler de error específico (`multerErrorHandler`) devuelve mensajes amigables (413, 415).

Coordinar con nginx `client_max_body_size` >= 15M (dar margen sobre los 10 MB de Multer).

## Seguridad — defensas y gaps

### Aplicadas

- Passwords con `bcryptjs` (cost 12).
- JWT firmado con secreto largo.
- Cookies `httpOnly` + `sameSite: lax` + `secure` en producción.
- CORS restringido a orígenes conocidos.
- Verificación del email verified por Google en OAuth.
- Sanitización de `producto_id` contra FK antes de INSERT.
- Sanitización de valores numéricos (`""` → `0`) antes de escribir en DECIMAL.
- Idempotencia contra reintentos de MP.

### Gaps documentados (no implementados)

- **Verificación de firma del webhook MP** (`x-signature` header).
  Recomendable en prod; requiere lógica adicional con el secret del webhook.
- **Rate limiting** — usar `express-rate-limit`, especialmente en `/webhook` y `/login`.
- **Content Security Policy** — usar `helmet`.
- **Row-level security** para queries admin (por ahora se confía en `requireRole`).

## Transacciones

Toda operación que toca múltiples tablas usa transacción explícita:

```js
await withTransaction(async (conn) => {
  // ...pasar conn a TODAS las llamadas de repository dentro
})
```

`withTransaction` debe implementarse en `config/db.js` según el driver.
Ver `db.example.js` para ejemplos por ORM.

## Errores tolerables vs no tolerables

- **FK a `producto_id` inexistente**: se sanea a NULL para permitir crear la orden
  con historial (nombre_producto). El error del catálogo no debe romper la venta.
- **DECIMAL con `""`**: se sanea a `0`. Nunca debería llegar a MySQL como está.
- **Email OAuth no verificado**: se rechaza. Passport devuelve `false`.
- **Payment con estado desconocido**: se logea warning, no se hace nada. La orden
  queda en el estado anterior.
