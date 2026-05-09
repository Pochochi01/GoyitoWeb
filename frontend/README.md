# GoyitoWeb – Frontend (Vite + React + Tailwind)

El contenido del frontend vive en la **raíz** del repositorio (src/, public/, index.html, vite.config.js, etc.).

Para el despliegue en Hostinger VPS, mover estos archivos aquí:

```
src/
public/
index.html
package.json
package-lock.json
vite.config.js
tailwind.config.js
postcss.config.js
eslint.config.js
```

## Comandos

```bash
npm install
npm run dev       # desarrollo
npm run build     # genera dist/
```

## Variables de entorno (.env)

```env
VITE_API_URL=http://localhost:4000/api
```

En producción:
```env
VITE_API_URL=https://tudominio.com/api
```
