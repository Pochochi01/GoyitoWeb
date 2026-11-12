# Blueprint reutilizable — Express + JWT + OAuth + MercadoPago

Plantilla extraída del proyecto GoyitoWeb, **sin código específico de MySQL**.
El acceso a datos está abstraído en `repositories/` como clases con métodos
"not implemented" que vos rellenás con el ORM/DB que prefieras.

## Qué incluye

- Auth tradicional (JWT) + OAuth Google stateless
- Users, Customers, Suppliers, Addresses
- Products, Categories, Stock, Movements, Price history
- Cart, Sales orders, Purchase orders, POS
- Payments (MercadoPago Checkout Pro) — con webhook + sync + idempotencia
- Uploads (Multer + Sharp)
- Reviews, Settings, Analytics
- Middlewares: auth, role, optionalAuth, error handler, multer error handler

## Estructura

```
template/
├── backend/
│   ├── server.js                    ← bootstrap Express
│   ├── ecosystem.config.js          ← config para PM2
│   ├── config/
│   │   ├── db.example.js           ← reemplazar con tu conexión
│   │   ├── mp.config.js            ← MercadoPago SDK
│   │   └── passport.js             ← Passport Google OAuth
│   ├── middlewares/
│   │   ├── authMiddleware.js       ← verifica JWT
│   │   ├── roleMiddleware.js       ← restringe por rol
│   │   ├── optionalAuth.js         ← auth no obligatoria
│   │   └── errorMiddleware.js      ← error handler global
│   ├── services/
│   │   ├── tokenService.js         ← JWT sign/verify
│   │   ├── imageService.js         ← Multer + Sharp
│   │   ├── payment.service.js      ← MercadoPago wrapper
│   │   └── paymentService.js       ← adapter (compat)
│   ├── repositories/                ← INTERFACES a implementar
│   │   ├── UserRepository.js
│   │   ├── CustomerRepository.js
│   │   ├── ProductRepository.js
│   │   ├── CategoryRepository.js
│   │   ├── ProductStockRepository.js
│   │   ├── StockMovementRepository.js
│   │   ├── PriceHistoryRepository.js
│   │   ├── SupplierRepository.js
│   │   ├── PurchaseOrderRepository.js
│   │   ├── SalesOrderRepository.js
│   │   ├── CartRepository.js
│   │   ├── AddressRepository.js
│   │   ├── ReviewRepository.js
│   │   └── SettingsRepository.js
│   ├── controllers/                 ← LÓGICA de negocio (agnóstica al ORM)
│   │   ├── authController.js
│   │   ├── oauthController.js
│   │   ├── userController.js
│   │   ├── customerController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── stockController.js
│   │   ├── supplierController.js
│   │   ├── purchaseOrderController.js
│   │   ├── salesOrderController.js
│   │   ├── cartController.js
│   │   ├── addressController.js
│   │   ├── reviewController.js
│   │   ├── settingsController.js
│   │   ├── payment.controller.js
│   │   ├── posController.js
│   │   └── analyticsController.js
│   ├── routes/
│   │   └── (una por controller)
│   └── utils/
│       └── logger.js
├── database/
│   ├── schema.reference.sql         ← DDL de referencia (comentado)
│   └── MIGRATIONS.md                ← lista + orden de migrations
├── .env.example
└── package.json.example
```

## Cómo usarlo

1. **Copiá `template/backend/` a tu nuevo proyecto** (renombralo si querés).
2. **Elegí tu stack de datos**:
   - **Sequelize**: en cada repository, reemplazá `throw new Error('not implemented')`
     por `return await Model.findOne({where: ...})` etc.
   - **Prisma**: `return prisma.user.findFirst(...)`.
   - **MongoDB (Mongoose)**: adaptá el esquema.
   - **PostgreSQL raw**: reemplazá con `pg`.
3. **Instalá las dependencias** (ver `package.json.example`).
4. **Copiá `.env.example` a `.env`** y completá los valores.
5. **Registrá las routes en `server.js`** (ya está el skeleton).
6. **Verificá el `database/schema.reference.sql`** — ajustá tipos al DB que uses.

## Contratos de repositorio

Cada `repositories/XxxRepository.js` documenta:
- Métodos que necesita
- Tipo del argumento (JSDoc)
- Tipo del retorno (JSDoc)
- Ejemplos de uso

Si respetás las signatures, los controllers funcionan sin modificación.

## Decisiones de arquitectura importantes

Ver `ARCHITECTURE.md` para el detalle. Resumen:

- **JWT stateless** (no sessions). Cookie httpOnly + `Authorization: Bearer`.
- **OAuth Passport en modo stateless** (`session: false`).
- **MercadoPago**:
  - Creación de orden **diferida** (recién al aprobar el pago).
  - **Doble reconciliación**: webhook + sync client-triggered.
  - **Idempotencia** por UNIQUE INDEX en `mp_payment_id`.
  - Nunca confiar en query params (siempre re-consultar a MP).
- **Uploads**: Multer memoryStorage → Sharp (resize + WebP + rotate EXIF).
- **Repository pattern**: controllers agnósticos al ORM.

## Seguridad — checklist

- [ ] `JWT_SECRET` largo y único (usar `openssl rand -hex 64`).
- [ ] `COOKIE_SECRET` distinto al JWT.
- [ ] `MP_ACCESS_TOKEN` en env, nunca en código.
- [ ] `GOOGLE_CLIENT_SECRET` en env.
- [ ] CORS restringido a orígenes conocidos.
- [ ] Cookies `secure: true` en producción.
- [ ] Rate limiting (agregar `express-rate-limit`).
- [ ] Verificación de firma en webhook MP (mejora futura documentada).
