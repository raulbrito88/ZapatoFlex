# ZapatoFlex — Plataforma de Venta de Calzado en Línea

**Proyecto académico:** Arquitectura de Software — *Orquestando Códigos: La Sinfonía de los Sistemas*

ZapatoFlex S.A.S. (Colombia) es una plataforma de comercio electrónico para calzado deportivo, casual y formal. Este repositorio contiene el **análisis de requisitos**, **diagramas UML**, **documentación de patrones de diseño** y un **prototipo funcional** desplegable en la nube (Vercel).

---

## Estructura del repositorio

```
ZapatoFlex/
├── app/                    # Next.js App Router (Vista + Controlador - MVC)
│   ├── actions/             # Server Actions (lógica de aplicación)
│   │   ├── admin.ts          # CRUD productos
│   │   ├── auth.ts           # Registro e inicio de sesión
│   │   ├── carrito.ts        # Gestión del carrito
│   │   ├── catalogos.ts      # CRUD marcas, colores, tallas
│   │   └── checkout.ts       # Proceso de compra
│   ├── admin/               # Módulo administrativo
│   │   ├── catalogos/        # Gestión de catálogos (marcas, colores, tallas)
│   │   ├── pedidos/          # Listado de pedidos
│   │   └── productos/        # CRUD de productos
│   ├── carrito/             # Módulo carrito de compras
│   ├── login/               # Módulo autenticación
│   ├── pedidos/             # Historial y detalle de pedidos
│   ├── registro/            # Registro de usuarios
│   ├── tienda/              # Catálogo con filtros y búsqueda
│   └── components/          # Componentes reutilizables (Header, ThemeToggle)
├── lib/                     # Capa de dominio e infraestructura
│   ├── db.ts                # Singleton - cliente Prisma
│   ├── auth.ts              # Autenticación (cookies, bcrypt)
│   ├── repositories/        # Patrón Repository
│   │   ├── producto-repository.ts
│   │   ├── usuario-repository.ts
│   │   └── pedido-repository.ts
│   └── services/            # Servicios de negocio
│       ├── checkout-service.ts  # Orquestación del checkout
│       ├── pago-strategy.ts     # Strategy (métodos de pago)
│       └── email-service.ts     # Notificaciones por correo
├── prisma/
│   ├── schema.prisma        # Modelo de datos (13 tablas)
│   └── seed.ts              # Datos iniciales (admin + catálogos + productos)
├── package.json
└── README.md
```

---

## Requisitos previos

- **Node.js** 18+
- **npm** o **pnpm**

---

## Instalación y ejecución local

1. **Clonar e instalar dependencias**

   ```bash
   cd ZapatoFlex
   npm install
   ```

2. **Configurar variables de entorno**

   Crear archivo `.env` en la raíz:

   ```env
   DATABASE_URL="file:./dev.db"

   # Email (opcional, para notificaciones de compra)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=tu-app-password
   ```

   Para el email se requiere una **contraseña de aplicación** de Gmail (no la contraseña normal).

3. **Crear tablas y datos iniciales**

   ```bash
   npx prisma db push
   npm run db:seed
   ```

   Se crean:
   - **Usuario admin:** `admin@zapatoflex.com` / `admin123`
   - **Catálogos:** 4 marcas, 6 colores, 9 tallas (36-44)
   - **3 productos** de ejemplo con stock por talla

4. **Iniciar servidor de desarrollo**

   ```bash
   npm run dev
   ```

   Abrir [http://localhost:3000].

---

## Despliegue en Vercel

1. **Base de datos en la nube**
   Vercel no persiste el sistema de archivos. Usar una base de datos gestionada:
   - [Vercel Postgres](https://vercel.com/storage/postgres)
   - [Turso](https://turso.tech/) (SQLite compatible)
   - [Neon](https://neon.tech/) (PostgreSQL)

2. **Configurar variables de entorno en Vercel**
   En el proyecto de Vercel → Settings → Environment Variables:
   - `DATABASE_URL` = URL de conexión de la BD
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (para emails)

3. **Schema Prisma para producción**
   Si usas PostgreSQL, en `prisma/schema.prisma` cambia:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   Luego ejecutar seed apuntando a la BD de producción.

4. **Conectar repositorio y desplegar**
   Conectar el repo con Vercel. El comando de build (`npm run build`) ya incluye `prisma generate`.

---

## Modelo de datos

El sistema cuenta con **12 tablas** organizadas en 4 grupos:

| Grupo | Tablas |
|-------|--------|
| Usuarios | `Usuario` |
| Catálogos | `Marca`, `Color`, `Talla` |
| Productos | `Producto`, `ProductoTalla`, `ImagenProducto` |
| Comercio | `Carrito`, `LineaCarrito`, `Pedido`, `LineaPedido`, `Pago` |

**Relaciones clave:**
- `Producto` → `Marca` (FK), `Color` (FK): integridad referencial via select
- `ProductoTalla`: stock discriminado por talla (ej: Runner Pro talla 38 = 50 unidades)
- `LineaPedido.talla`: guarda la talla comprada para historial

---

## Módulos del sistema

| Módulo | Descripción |
|--------|-------------|
| Autenticación | Registro, login, sesión con cookies httpOnly, bcrypt |
| Catálogo | Listado con filtros (categoría, marca, color, talla, precio, búsqueda) |
| Carrito | Agregar con talla, editar cantidad, eliminar; validación de stock |
| Pagos | Simulación contraentrega (Strategy extensible a tarjeta/PSE) |
| Inventario | Stock por talla, descuento al confirmar pedido |
| Notificaciones | Email de confirmación de compra al cliente (Nodemailer) |
| Administrativo | CRUD productos con selects, gestión catálogos, pedidos |
| Frontend web | Next.js 14, App Router, modo claro/oscuro, diseño responsive |

---

## Patrones de diseño aplicados

| Patrón | Implementación en el proyecto |
|--------|-------------------------------|
| **MVC** | Vista (componentes/páginas), Controlador (actions), Modelo (Prisma/entidades) |
| **Repository** | `producto-repository`, `usuario-repository`, `pedido-repository` |
| **Singleton** | Cliente Prisma en `lib/db.ts` |
| **Strategy** | Métodos de pago: `ContraentregaStrategy` (extensible a Tarjeta/PSE) |
| **Factory** | Creación de `Pedido` y `Pago` en el servicio de checkout |
| **Cliente-Servidor** | Navegador ↔ Next.js en Vercel |
| **Arquitectura en capas** | Presentación (`app/`), Aplicación (`actions/`, `services/`), Dominio (entidades), Infraestructura (`db`, `repositories/`) |

---

## Requisitos Funcionales

| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF01 | Registro de usuarios | Registro con nombre, email y contraseña |
| RF02 | Inicio de sesión | Autenticación con bcrypt + cookies httpOnly |
| RF03 | Catálogo por categorías | Deportivos, Casuales, Formales |
| RF04 | Filtros de búsqueda | Talla, precio, marca, color, texto |
| RF05 | Agregar al carrito | Con selección de talla |
| RF06 | Gestión del carrito | Editar cantidades, eliminar productos |
| RF07 | Proceso de checkout | Verificación de stock por talla |
| RF08 | Simulación de pago | Contraentrega con patrón Strategy |
| RF09 | Admin — Productos | CRUD con selects de marca/color y stock por talla |
| RF10 | Admin — Pedidos | Visualización con detalle de tallas |
| RF11 | Admin — Catálogos | Gestión de marcas, colores y tallas |
| RF12 | Gestión de inventario | Stock por talla, descuento automático |
| RF13 | Historial de compras | Pedidos del usuario con detalle |
| RF14 | Notificación de compra | Email de confirmación (Nodemailer) |

---

## Diagramas UML

El proyecto cuenta con 4 diagramas diseñados en Mermaid:

1. **Casos de uso** — 3 actores (Usuario, Admin, Sistema) y 15 casos de uso
2. **Clases** — 12 entidades con relaciones, incluyendo catálogos (Marca, Color, Talla) y ProductoTalla
3. **Secuencia** — Proceso de compra: verificación stock por talla → pago (Strategy) → descuento inventario → email
4. **Despliegue** — Cliente (Browser) ↔ Servidor (Vercel/Next.js) ↔ BD (Prisma) ↔ SMTP (Gmail)

---

## Alcance del prototipo

- [x] Registro de usuario
- [x] Inicio de sesión seguro (bcrypt + cookies httpOnly)
- [x] Catálogo con filtros (categoría, marca, color, talla, precio, búsqueda)
- [x] Carrito funcional con selección de talla
- [x] Simulación de pago (contraentrega - Strategy)
- [x] Stock discriminado por talla
- [x] Email de confirmación de compra
- [x] Panel administrativo (productos con selects, catálogos, pedidos)
- [x] Catálogos gestionables (marcas, colores, tallas)
- [x] Historial de pedidos del usuario
- [x] Modo claro/oscuro
- [x] Base de datos (Prisma + SQLite/PostgreSQL)
- [x] Desplegable en la nube (Vercel + BD gestionada)

---

## Escenario de crecimiento (6 meses)

La arquitectura actual (monolito modular con capas y patrones) permite:

- **Más usuarios:** Escalar en Vercel y usar BD gestionada con más capacidad.
- **Pagos reales:** Añadir nuevas estrategias de pago (Strategy) sin cambiar el flujo de checkout.
- **Más productos:** Los catálogos (marca, color, talla) son extensibles desde el panel admin.
- **App móvil:** Exponer API REST para consumo móvil.
- **Mercado internacional:** Modularizar por dominio y evolucionar a microservicios si se requiere.

---

## Tecnologías

| Tecnología | Uso |
|------------|-----|
| Next.js 14 | Framework fullstack (App Router) |
| React 18 | Interfaz de usuario |
| Prisma 6 | ORM y modelo de datos |
| SQLite | Base de datos de desarrollo |
| Nodemailer | Envío de correos electrónicos |
| Zod | Validación de datos |
| bcryptjs | Hashing de contraseñas |
| TypeScript | Tipado estático |

---

