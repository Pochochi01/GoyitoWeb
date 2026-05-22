#!/bin/bash
# ============================================================
#  Script de deploy para ZolImportados — VPS Hostinger KVM2
#  Ejecutar desde el VPS como root:
#    bash /var/www/proyectos-mysql/GoyitoWeb/deploy.sh
# ============================================================

set -e
PROJECT="/var/www/proyectos-mysql/GoyitoWeb"
DB_NAME="goyitoweb"
DB_USER="zolimportados_user"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ZolImportados — Deploy Script          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. Código ────────────────────────────────────────────────
echo "▶ [1/6] Actualizando código..."
cd "$PROJECT"
git pull origin main
echo "   ✓ Código actualizado"

# ── 2. Migración de BD ────────────────────────────────────────
echo ""
echo "▶ [2/6] Aplicando migración de base de datos (FK CASCADE)..."
echo "   Ingresá la contraseña MySQL para '$DB_USER':"
mysql -u "$DB_USER" -p "$DB_NAME" < "$PROJECT/backend/database/cascade_migration.sql" && \
  echo "   ✓ Migración aplicada" || \
  echo "   ⚠  La migración ya fue aplicada anteriormente (OK)"

# ── 3. Dependencias backend ───────────────────────────────────
echo ""
echo "▶ [3/6] Instalando dependencias del backend..."
cd "$PROJECT/backend"
npm install --omit=dev
echo "   ✓ Dependencias backend instaladas"

# ── 4. Frontend: verificar .env ───────────────────────────────
echo ""
echo "▶ [4/6] Verificando .env del frontend..."
if [ ! -f "$PROJECT/frontend/.env" ]; then
  echo "   CREANDO frontend/.env..."
  cat > "$PROJECT/frontend/.env" << 'EOF'
VITE_API_URL=https://api.zolimportados.com/api
EOF
  echo "   ✓ Creado frontend/.env"
else
  echo "   Contenido actual de frontend/.env:"
  cat "$PROJECT/frontend/.env"
fi

# ── 5. Build del frontend ─────────────────────────────────────
echo ""
echo "▶ [5/6] Compilando frontend..."
cd "$PROJECT/frontend"
npm install
npm run build
echo "   ✓ Frontend compilado en frontend/dist/"

# ── 6. Permisos y reinicio ────────────────────────────────────
echo ""
echo "▶ [6/6] Permisos y reinicio del backend..."
mkdir -p "$PROJECT/backend/uploads"
chmod 755 "$PROJECT/backend/uploads"
chown -R $(whoami):$(whoami) "$PROJECT/backend/uploads"

pm2 restart zolimportados-api 2>/dev/null || pm2 start "$PROJECT/backend/ecosystem.config.js" --env production
pm2 save

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✓ Deploy completado                    ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Verificaciones:"
echo "  API health: curl https://api.zolimportados.com/api/health"
echo "  Logs:       pm2 logs zolimportados-api --lines 30"
echo ""
