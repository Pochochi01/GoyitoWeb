# Login con Google — Guía de setup

Implementación de OAuth 2.0 con Google usando `passport-google-oauth20` en
**modo stateless** (sin sessions), consistente con el JWT del login tradicional.

## Resumen del flujo

```
┌──────────┐   1. Click "Continuar con Google"      ┌──────────────────┐
│ Frontend │ ──────────────────────────────────────►│ /api/auth/google │
│  /login  │                                         └────────┬─────────┘
└──────────┘                                                  │ redirect
                                                              ▼
                                                  ┌────────────────────┐
                                                  │ accounts.google    │
                                                  │   (consent screen) │
                                                  └─────────┬──────────┘
                                                            │ user approves
                                                            ▼
                            ┌─────────────────────────────────────────┐
                            │ /api/auth/google/callback?code=XXX      │
                            │ - passport verifica el code             │
                            │ - busca por google_id → email → crea    │
                            │ - emite JWT con id/username/rol         │
                            │ - setea cookie httpOnly                 │
                            └─────────────────────────────────────────┘
                                                            │ 302
                                                            ▼
┌──────────────────┐     /auth/callback?token=JWT_HERE
│ Frontend         │  ◄──────────────────────────────────────────────
│ /auth/callback   │
│ - guarda token   │
│ - llama /auth/me │
│ - redirige según │
│   rol del user   │
└──────────────────┘
```

## 1. Setup en Google Cloud Console (una vez)

1. Ir a https://console.cloud.google.com/
2. Crear un proyecto (o seleccionar uno existente).
3. **APIs & Services → OAuth consent screen**:
   - User Type: **External**.
   - App name: `Goyito's Digital` (o el que prefieras).
   - User support email: tu email.
   - Developer contact: tu email.
   - Authorized domains: agregá `zolimportados.com` (para prod).
   - **Scopes**: agregar `.../auth/userinfo.email` y `.../auth/userinfo.profile`.
   - **Test users**: mientras estés en "Testing", agregá los emails que van a poder loguearse.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Name: `goyitoweb-backend`.
   - **Authorized JavaScript origins**:
     - Dev: `http://localhost:5001`
     - Prod: `https://api.zolimportados.com`
   - **Authorized redirect URIs** (ESTAS DEBEN COINCIDIR CON `OAUTH_CALLBACK_URL` DEL .env):
     - Dev: `http://localhost:5001/api/auth/google/callback`
     - Prod: `https://api.zolimportados.com/api/auth/google/callback`
5. Click "Create" → te muestra `Client ID` y `Client secret`. **Copialos**.

## 2. Variables de entorno

### Dev (`backend/.env`)

```env
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
OAUTH_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
PUBLIC_URL=http://localhost:5173
```

### Prod (`backend/.env` del VPS)

```env
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
OAUTH_CALLBACK_URL=https://api.zolimportados.com/api/auth/google/callback
PUBLIC_URL=https://zolimportados.com
```

## 3. Migration SQL

Ya aplicada en local. En el VPS:

```bash
cd /var/www/proyectos-mysql/GoyitoWeb
git pull
mysql -u goyito -p goyitoweb < backend/database/users_oauth_migration.sql
pm2 restart all
```

La migration agrega: `google_id`, `avatar_url`, `provider` a `users` y hace
`password_hash` NULLable (los usuarios Google-only no tienen contraseña).

## 4. Dependencias

Ya instaladas en local. En el VPS, después del `git pull`:

```bash
cd /var/www/proyectos-mysql/GoyitoWeb/backend
npm install
pm2 restart all
```

## 5. Política de cuentas

El verify callback en `config/passport.js` busca en este orden:

1. **Por `google_id`** — login recurrente (segunda vez que el usuario entra).
2. **Por `email`** — si ya existe una cuenta con ese email (registro tradicional
   previo), se **linkea** automáticamente: se guarda `google_id` y `avatar_url`
   en el registro existente. El usuario puede entrar con ambos métodos.
3. **Crear nuevo** — si no existe nada, se crea con:
   - `username`: derivado del email (parte antes de `@`, alfanumérico)
   - `password_hash`: NULL (solo entra con Google)
   - `provider`: `'google'`
   - `rol`: `'comprador'`

## 6. Archivos clave

| Archivo | Responsabilidad |
|---|---|
| `config/passport.js` | Configura `GoogleStrategy`. Verify callback que linkea/crea. |
| `controllers/oauthController.js` | Firma JWT, setea cookie, redirige al frontend. |
| `routes/auth.routes.js` | Registra `GET /google`, `GET /google/callback`, `GET /google/failure`. |
| `models/User.js` | `findByEmail`, `findByGoogleId`, `linkGoogleAccount`, `createFromGoogle`. |
| `server.js` | `app.use(passport.initialize())`. |
| `frontend/src/Pages/Login.jsx` | Botón "Continuar con Google" → `window.location.href`. |
| `frontend/src/Pages/AuthCallback.jsx` | Lee `?token=`, persiste, redirige por rol. |
| `frontend/src/context/AuthContext.jsx` | `loginWithToken(token)` que llama `/auth/me`. |

## 7. Seguridad

- **JWT stateless**: no usamos `express-session`. El JWT es la única
  fuente de auth (mismo mecanismo que el login tradicional).
- **Cookie httpOnly + localStorage**: misma estrategia que `authController.login`.
  Cookie para fetch server-side, localStorage para que axios mande `Authorization: Bearer`.
- **CORS**: ya configurado en `server.js` con `credentials: true` y orígenes
  permitidos vía `CLIENT_ORIGIN`. No requiere cambios.
- **Verify email**: solo permitimos emails marcados como verificados por Google
  (`profile.emails[0].verified !== false`).
- **Linkeo seguro**: confiamos en Google para validar la propiedad del email.
  Si querés más estricto (evitar account takeover por OAuth comprometido),
  cambiá la política #2 del verify callback (`config/passport.js`) para
  pedir confirmación antes de linkear.

## 8. Testing manual

### Dev

1. `cd backend && npm run dev`
2. `cd frontend && npm run dev`
3. Abrí `http://localhost:5173/login`.
4. Click "Continuar con Google" → consent screen de Google.
5. Aceptá → te lleva a `/auth/callback?token=...` → spinner → redirect a `/`.
6. En la BD:
   ```sql
   SELECT id, username, email, google_id, provider, rol FROM users ORDER BY id DESC LIMIT 5;
   ```
   Deberías ver el usuario nuevo (o tu cuenta linkeada si ya existía con ese email).

### Errores comunes

| Síntoma | Causa probable | Fix |
|---|---|---|
| `redirect_uri_mismatch` | `OAUTH_CALLBACK_URL` no coincide con la URI registrada en Google Console | Agregá la URI exacta a "Authorized redirect URIs" |
| `403: access_blocked` | Tu cuenta no está en "Test users" del consent screen (en estado Testing) | Agregá tu email a Test users, o publicá la app |
| `oauth_error=auth_failed` en la URL | Email no verificado por Google, o usuario inactivo | Revisá los logs del backend |
| Redirect a `localhost:5173` pero estoy en prod | Falta `PUBLIC_URL` en el `.env` de producción | Setealo en el VPS |
| Cuenta nueva creada en vez de linkear | El email del registro tradicional difiere del de Google | Es esperado — son cuentas distintas |
