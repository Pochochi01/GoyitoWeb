# Variables de entorno para el VPS — ZolImportados

## backend/.env

```env
PORT=5001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=3306
DB_USER=zolimportados_user
DB_PASS=TU_PASSWORD_MYSQL
DB_NAME=zolimportados_db

JWT_SECRET=GENERAR_CON: openssl rand -hex 64
JWT_EXPIRES_IN=7d

COOKIE_SECRET=GENERAR_CON: openssl rand -hex 32

CLIENT_ORIGIN=https://zolimportados.com

MP_ACCESS_TOKEN=APP_USR-xxxx-xxxx-xxxx-xxxx
MP_PUBLIC_KEY=APP_USR-xxxx-xxxx-xxxx-xxxx
MP_CURRENCY=ARS
MP_STATEMENT_DESCRIPTOR=ZOLIMPORTADOS

UPLOADS_DIR=uploads
```

## frontend/.env  (usada ANTES de hacer npm run build)

```env
VITE_API_URL=https://api.zolimportados.com/api
```

## Comandos para el VPS

```bash
# 1. Copiar configs Nginx
cp /var/www/proyectos-mysql/GoyitoWeb/nginx/api.zolimportados.com.conf \
   /etc/nginx/sites-available/api.zolimportados.com.conf

cp /var/www/proyectos-mysql/GoyitoWeb/nginx/zolimportados.com.conf \
   /etc/nginx/sites-available/zolimportados.com.conf

# 2. Verificar y recargar Nginx
nginx -t && systemctl reload nginx

# 3. Rebuild del frontend con las variables correctas
cd /var/www/proyectos-mysql/GoyitoWeb/frontend
npm run build

# 4. Reiniciar el backend
pm2 restart zolimportados-api
pm2 save
```
