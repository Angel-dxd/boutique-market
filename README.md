# 🧾 Boutique Market — Sistema de Gestión Multitenant

> **Trabajo de Fin de Grado · Desarrollo de Aplicaciones Multiplataforma (DAM)**
> Plataforma web integral para la gestión de dos negocios familiares reales, construida desde cero con Node.js, Vanilla JS y MySQL.

---

## 📖 ¿Qué es este proyecto?

**Boutique Market** es una aplicación web full-stack que resuelve un problema real: dos negocios familiares que necesitaban digitalizar su gestión (citas, clientes, inventario, finanzas) sin depender de software de terceros ni pagar suscripciones.

La solución es un único sistema que sirve a **dos negocios completamente independientes** desde el mismo servidor, manteniendo sus datos 100% aislados. A esto se le llama arquitectura **multitenant**.

---

## 🏢 Los dos negocios

| Tenant | Negocio | Propietaria/o | Descripción |
|---|---|---|---|
| `market` | 💅 **Oh-Nails** | Arelys | Salón de manicura. Gestiona citas, clientes y finanzas diarias |
| `santi` | 🐓 **El Gallo Azul** | Santi | Pollería. Gestiona inventario, proveedores y estadísticas |

Cada tenant tiene su **propia base de datos MySQL**, su propio usuario de login, y su propio panel de control. Comparten el código del servidor, pero nunca sus datos.

---

## ✨ Funcionalidades

### 💅 Oh-Nails (Arelys)

| Módulo | Descripción |
|---|---|
| **Agenda** | Calendario de citas con hora, cliente, servicio y precio. Vista diaria con recordatorios vía WhatsApp |
| **Clientas** | Registro completo con historial de visitas, notas personales y sistema de alertas de fidelización (clientes sin visita en +30 días) |
| **Finanzas** | Registro de ingresos y gastos con semáforo de rentabilidad mensual |
| **Galería** | Portfolio visual de trabajos de manicura con editor de imágenes integrado (recorte cuadrado + filtros fotográficos) |

### 🐓 El Gallo Azul (Santi)

| Módulo | Descripción |
|---|---|
| **Inventario** | Control de stock con alertas de reposición crítica y calculadora de márgenes (coste, IVA, beneficio neto) |
| **Proveedores** | Directorio de proveedores con contacto y categoría. Importación masiva por CSV |
| **Pedidos** | Registro de facturas de compra vinculadas a proveedor |
| **Estadísticas** | Dashboard con KPIs del negocio: rotación de stock, gasto mensual, proveedores activos |
| **WhatsApp Business** | Contacto automático con proveedores a través de la API oficial de WhatsApp Business |

---

## 🏗️ Arquitectura técnica

```
boutique-market/
├── backend/                  ← API REST (Node.js + Express + MySQL)
│   ├── server.js             ← Entrada principal: middlewares globales, rutas, CORS
│   ├── schema.sql            ← Esquema completo de la base de datos
│   ├── config.example.json   ← Plantilla de configuración por tenant
│   ├── .env.example          ← Plantilla de variables de entorno
│   └── src/
│       ├── config/           ← Conexión MySQL y contexto multitenant (AsyncLocalStorage)
│       ├── controllers/      ← Lógica de negocio por módulo
│       ├── middlewares/      ← Validación de inputs (Zod) y autenticación JWT
│       ├── routes/           ← Definición de todos los endpoints REST
│       ├── services/         ← Integraciones externas (WhatsApp Business API)
│       └── utils/            ← Cifrado AES-256-CBC, helpers compartidos
│
├── frontend/                 ← SPA (HTML5 + Vanilla JS ES6+ + Tailwind CSS)
│   ├── index.html            ← Punto de entrada único (Single Page Application)
│   ├── css/                  ← Estilos compilados con Tailwind
│   └── js/features/
│       ├── core/             ← Router SPA, cliente HTTP (api.js), store de sesión
│       ├── auth/             ← Pantalla de login multitenant
│       ├── boutique/         ← Todos los módulos de Oh-Nails
│       ├── market/           ← Todos los módulos de El Gallo Azul
│       └── shared/           ← Componentes reutilizables (modales, notificaciones)
│
├── arrancar.sh               ← Script de inicio con gestión automática de puertos
├── docker-compose.yml        ← Despliegue en contenedores con persistencia de datos
└── README.MD                 ← Este archivo
```

### Decisiones de diseño

- **Vanilla JS sin frameworks**: El frontend no usa React, Vue ni Angular. Se comunica con el backend exclusivamente mediante la Fetch API. Esto demuestra dominio de los fundamentos de JavaScript y del ciclo completo de una petición HTTP.
- **Backend propio en Node.js**: Sin BaaS ni bases de datos como servicio. El proyecto tuvo una primera iteración con React + Supabase que fue descartada para tener control total sobre los datos, la seguridad y la lógica de negocio.
- **Arquitectura multitenant por base de datos**: El aislamiento de datos entre negocios se implementa con `AsyncLocalStorage` de Node.js, que propaga el contexto del tenant a lo largo de toda la cadena de ejecución de cada petición, sin variables globales.

---

## 🔒 Seguridad implementada

| Capa | Tecnología | Propósito |
|---|---|---|
| **Autenticación** | JWT (JSON Web Tokens) | Sesiones sin estado, verificadas en cada petición |
| **Contraseñas** | Bcrypt (10 salt rounds) | Hash unidireccional resistente a ataques de fuerza bruta |
| **Datos personales** | AES-256-CBC + IV aleatorio | Cifrado bidireccional de emails y PII en base de datos |
| **Cabeceras HTTP** | Helmet.js | Protección automática contra XSS, clickjacking, MIME sniffing |
| **Validación de inputs** | Zod + middlewares propios | Sanitización estricta antes de llegar al controlador |
| **Separación de datos** | AsyncLocalStorage | Aislamiento garantizado entre tenants en tiempo de ejecución |
| **Duplicados** | Validación doble (frontend + backend) | Prevención de clientes/registros duplicados en base de datos |

---

## 🚀 Instalación y puesta en marcha

### Requisitos previos

- [Node.js](https://nodejs.org/) v16 o superior
- [MySQL](https://www.mysql.com/) 8.0 o superior
- Git

### Opción A: Instalación manual (recomendada para desarrollo)

**1. Clonar el repositorio**

```bash
git clone https://github.com/Angel-dxd/boutique-market.git
cd boutique-market
```

**2. Instalar dependencias del backend**

```bash
cd backend
npm install
cd ..
```

**3. Configurar las variables de entorno**

```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` con tus credenciales reales:

```env
PORT=3000
CORS_ORIGIN=*

DB_HOST=localhost
DB_USER=root
DB_PASS=tu_contraseña_mysql
DB_NAME=boutique_market

CRYPTO_KEY=una_clave_de_exactamente_32_caracteres_aqui
```

> ⚠️ `CRYPTO_KEY` debe tener exactamente 32 caracteres. Se usa para cifrar los emails de las clientas con AES-256-CBC.

**4. Configurar la conexión por tenant**

```bash
cp backend/config.example.json backend/config.json
```

Edita `backend/config.json` con las credenciales de cada base de datos:

```json
{
  "market": {
    "host": "localhost",
    "user": "root",
    "password": "tu_contraseña",
    "database": "boutique_market"
  },
  "santi": {
    "host": "localhost",
    "user": "root",
    "password": "tu_contraseña",
    "database": "boutique_santi"
  }
}
```

**5. Crear las bases de datos y el esquema**

```bash
# Crear las dos bases de datos
mysql -u root -p -e "CREATE DATABASE boutique_market; CREATE DATABASE boutique_santi;"

# Aplicar el esquema a cada una
mysql -u root -p boutique_market < backend/schema.sql
mysql -u root -p boutique_santi < backend/schema.sql
```

**6. Arrancar el proyecto**

```bash
chmod +x arrancar.sh
./arrancar.sh
```

El script levanta el backend y el frontend en paralelo, libera los puertos si estaban ocupados y se cierra limpiamente con `Ctrl+C`.

```
✅ Backend disponible en: http://localhost:3000
✅ Frontend disponible en: http://localhost:4200
📱 Acceso desde móvil (misma red WiFi): http://[tu-ip-local]:4200
```

---

### Opción B: Docker (recomendada para producción)

```bash
docker-compose up --build
```

Docker levanta el backend, el frontend (con Nginx) y la base de datos MySQL en contenedores aislados. Los datos persisten en un volumen de Docker aunque se reinicie el sistema.

```
✅ Frontend: http://localhost:80
✅ Backend API: http://localhost:3000
```

> 💡 Los datos de MySQL se guardan en el volumen `db_data`. Apagar o reiniciar los contenedores **no borra nada**.

---

## 👤 Primer acceso

Una vez arrancado el proyecto, necesitas crear los usuarios iniciales mediante la API:

```bash
# Usuario para Oh-Nails (Arelys)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: market" \
  -d '{"username": "arelys", "password": "tu_contraseña"}'

# Usuario para El Gallo Azul (Santi)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: santi" \
  -d '{"username": "santi", "password": "tu_contraseña"}'
```

Abre `http://localhost:4200` en el navegador, selecciona el negocio e introduce las credenciales.

---

## 🗄️ Modelo de datos

Todas las tablas siguen convención `snake_case` en inglés técnico, con claves foráneas explícitas.

| Tabla | Descripción |
|---|---|
| `users` | Credenciales de acceso por tenant (username + hash bcrypt + email cifrado AES) |
| `calendar` | Citas: cliente, fecha, hora, descripción y precio de la sesión |
| `clients` | Clientas recurrentes: nombre, teléfono, email, notas y fecha de última visita |
| `finance` | Movimientos financieros: tipo (ingreso/gasto), concepto, importe y fecha |
| `nails` | Galería de trabajos: imagen en Base64, título y categoría |
| `inventory` | Productos: nombre, stock actual, stock mínimo, precio coste y precio venta |
| `providers` | Proveedores: nombre, contacto, categoría y notas |
| `invoices` | Facturas de compra vinculadas a proveedor: importe, fecha y estado |

---

## 🔌 API REST — Referencia rápida

Todos los endpoints requieren la cabecera `x-tenant-id: market` o `x-tenant-id: santi`.
Los endpoints protegidos requieren también `Authorization: Bearer <token>`.

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Obtener token JWT |
| `GET` | `/api/clients` | Listar clientas |
| `POST` | `/api/clients` | Crear clienta (valida duplicados) |
| `GET` | `/api/calendar` | Obtener citas del calendario |
| `POST` | `/api/calendar` | Crear nueva cita |
| `GET` | `/api/finance` | Listar movimientos financieros |
| `GET` | `/api/gallery` | Obtener galería de trabajos |
| `POST` | `/api/gallery` | Subir nueva imagen (Base64) |
| `GET` | `/api/products` | Listar inventario con paginación |
| `GET` | `/api/providers` | Listar proveedores |
| `GET` | `/api/dashboard` | KPIs del dashboard por tenant |

---

## 🛠️ Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Runtime | Node.js | v18+ |
| Framework backend | Express.js | v4 |
| Base de datos | MySQL | v8 |
| ORM / Query builder | mysql2 (raw SQL) | — |
| Validación | Zod | v3 |
| Autenticación | jsonwebtoken + bcrypt | — |
| Frontend | HTML5 + Vanilla JS ES6+ | — |
| Estilos | Tailwind CSS | v3 |
| Iconos | Lucide Icons | CDN |
| Editor de imágenes | Cropper.js | v1.5 |
| Mensajería | WhatsApp Business API | v19 |
| Despliegue | Docker + Nginx | — |

---

## 📜 Licencia

Proyecto desarrollado con fines académicos como Trabajo de Fin de Grado del ciclo formativo **Desarrollo de Aplicaciones Multiplataforma (DAM)**.

---

*Desarrollado por [Ángel Xavier](https://github.com/Angel-dxd) · 2026*