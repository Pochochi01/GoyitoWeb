# Guía rápida de responsive design — GoyitoWeb

Esta guía documenta los patrones de breakpoints y técnicas usados en el proyecto.
Aplicalos al crear componentes nuevos para mantener consistencia.

## Stack

- **Tailwind CSS** con los breakpoints por defecto:
  - `sm:` ≥ 640px  (tablets chicas, mobile en landscape)
  - `md:` ≥ 768px  (tablets)
  - `lg:` ≥ 1024px (notebooks)
  - `xl:` ≥ 1280px (desktops grandes)
- **Mobile-first**: las clases sin prefijo aplican desde 0px. Solo agregás breakpoints para sobreescribir hacia arriba.

## Viewports objetivo

| Dispositivo | Width | Comprobar manualmente |
|---|---|---|
| iPhone SE / Android chico | 375px | ✅ |
| iPhone 14 / Pixel | 390-414px | ✅ |
| Tablet vertical | 768px | ✅ |
| Notebook | 1024-1366px | ✅ |
| Desktop grande | 1920px+ | ✅ |

## Patrones aplicados en este proyecto

### 1. Anchos/alturas — NO hardcodear píxeles en mobile

```jsx
// ❌ MAL — el card se rompe en pantallas < 260px y desperdicia espacio
<img className="w-[260px] h-[180px]" />

// ✅ BIEN — fluido en mobile, capped en desktop, ratio fijo
<img className="w-full max-w-[260px] aspect-[260/180] object-cover" />
```

Cuando necesitás un tamaño fijo (logos, iconos), está bien: `h-12 w-12`.
Pero **cualquier imagen de contenido** debe ser fluida.

### 2. Texto — escalar entre mobile y desktop

```jsx
// ❌ MAL — text-7xl en mobile (375px) rompe el layout
<h1 className="text-7xl font-bold">{title}</h1>

// ✅ BIEN — escalado progresivo
<h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold leading-tight">
  {title}
</h1>
```

Tabla de referencia que usamos:

| Rol del texto | Mobile | Tablet | Desktop |
|---|---|---|---|
| Hero title | `text-3xl` | `sm:text-5xl` | `lg:text-7xl` |
| Section heading | `text-2xl` | `sm:text-3xl` | `lg:text-4xl` |
| Card title | `text-base` | `sm:text-lg` | — |
| Body | `text-sm` | `sm:text-base` | — |
| Caption | `text-xs` | — | — |

Siempre con `leading-tight` o `leading-relaxed` para evitar líneas amontonadas o muy estiradas.

### 3. Grids — `grid-cols-1` SIEMPRE base

```jsx
// ❌ MAL — implícitamente columna en mobile, pero falta la intención
<div className="grid md:grid-cols-3">

// ✅ BIEN — explícito, fácil de leer
<div className="grid grid-cols-1 md:grid-cols-3">
```

Para productos: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.

### 4. Posicionamiento absoluto — escalar las posiciones también

```jsx
// ❌ MAL — `left-14` se desborda en mobile cuando el contenedor es chico
<img className="absolute top-0 left-14 w-[200px]" />

// ✅ BIEN — posición y tamaño escalan juntos
<img className="absolute top-2 right-2 sm:left-24 sm:right-auto w-[120px] sm:w-[200px]" />
```

### 5. Botones táctiles — mínimo 44px de altura

Apple HIG y Material Design recomiendan 44px (28 CSS pixels en algunos cálculos, pero la regla simple es `min-h-[44px]`).

```jsx
// ❌ MAL — botón de 32px, difícil de tocar en mobile
<button className="py-2 px-4 text-xs">Comprar</button>

// ✅ BIEN — alcanza 44px con padding y mínimo explícito
<button className="py-2 px-5 sm:px-8 min-h-[44px] text-sm font-semibold">
  Comprar
</button>
```

### 6. Padding/margin — adaptar por viewport

```jsx
// ❌ MAL — 32px de padding en mobile = claustrofóbico
<div className="p-8">…</div>

// ✅ BIEN — más compacto en mobile, espacioso en desktop
<div className="p-4 sm:p-6 lg:p-8">…</div>
```

### 7. Layouts apilables — `flex-col` a `flex-row`

```jsx
// Productos + panel lateral
<div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
  <div className="flex-1">…productos…</div>
  <div className="w-full lg:w-80 lg:flex-shrink-0">…panel…</div>
</div>
```

El panel ocupa ancho completo en mobile, lateral en desktop.

### 8. `sticky` solo donde tiene sentido

```jsx
// ❌ MAL — sticky en mobile ocupa pantalla útil
<div className="sticky top-24">…panel…</div>

// ✅ BIEN — sticky solo en desktop
<div className="lg:sticky lg:top-24">…panel…</div>
```

### 9. Imágenes — `object-cover` o `object-contain`, nunca deformar

```jsx
// ❌ MAL — la imagen se estira si el ratio no coincide
<img src={x} className="w-full h-48" />

// ✅ BIEN — recorta para mantener el ratio, sin deformar
<img src={x} className="w-full h-48 object-cover" />

// O para imágenes que no deben recortarse (logos, productos):
<img src={x} className="w-full max-w-[300px] h-auto object-contain" />
```

### 10. `picture` para formatos modernos (WebP)

El backend convierte todas las imágenes subidas a WebP. Para usarlo:

```jsx
<picture>
  <source srcSet={imgUrl} type="image/webp" />
  <img src={imgUrl} alt={title} className="w-full object-cover" />
</picture>
```

Si en el futuro agregás AVIF o thumbnails:

```jsx
<picture>
  <source srcSet={imgUrlAvif} type="image/avif" />
  <source srcSet={imgUrlWebp} type="image/webp" />
  <img src={imgUrl} alt={title} className="w-full object-cover" />
</picture>
```

## Checklist para componentes nuevos

Antes de mergear un componente, verificá:

- [ ] Abrí DevTools, modo dispositivo (Ctrl+Shift+M en Chrome), probé en 375px / 768px / 1024px.
- [ ] Ningún `w-[Xpx]` o `h-[Ypx]` fijo en imágenes de contenido (logos sí).
- [ ] Texto escala con `sm:`/`lg:` si el componente tiene títulos.
- [ ] Botones tienen `min-h-[44px]`.
- [ ] Grids empiezan con `grid-cols-1`.
- [ ] Padding/margin grandes (`p-8+`, `mx-12+`) tienen variante mobile.
- [ ] Posicionamiento absoluto (si existe) escala con la pantalla.
- [ ] Imágenes usan `object-cover` o `object-contain` — nunca se deforman.
- [ ] Si el componente tiene `sticky`/`fixed`, está acotado a desktop con `lg:`.

## Componentes que ya cumplen estos patrones

- [Tienda.jsx](src/Pages/Tienda.jsx) — buena referencia de grid de productos
- [Login.jsx](src/Pages/Login.jsx) — formulario contenido con `max-w-md`
- [ShopProductCard.jsx](src/Components/Store/ShopProductCard.jsx) — card con lightbox responsive
- [Heading.jsx](src/Components/Shared/Heading.jsx) — escala de tipografía estándar

Cuando dudes, mirá uno de estos primero.
