# 🧾 Boutique Market — Sistema de Gestión Multitenant

[![CI](https://github.com/Angel-dxd/boutique-market/actions/workflows/ci.yml/badge.svg)](https://github.com/Angel-dxd/boutique-market/actions/workflows/ci.yml)

> **Proyecto final · Desarrollo de Aplicaciones Multiplataforma (DAM)**
> Plataforma web que usan a diario dos negocios familiares reales, con una API en Node.js y una base de datos PostgreSQL aislada para cada negocio.

**🔗 Demo:** [boutique-market.vercel.app](https://boutique-market.vercel.app) → pulsa **Oh-Nails** o **El Gallo Azul** en *"Probar la demo"*
**📖 API:** [documentación Swagger](https://boutique-market-api.onrender.com/api/docs/)

> La demo funciona íntegramente en el navegador con **datos ficticios**: no se conecta con el backend ni con las bases de datos de los negocios, y los cambios que hagas se borran al cerrar la pestaña.

---

## 📖 ¿Qué es este proyecto?

**Boutique Market** digitaliza la gestión de dos negocios familiares independientes: **Oh-Nails** (salón de manicura) y **El Gallo Azul** (pollería).

Un único despliegue sirve a los dos negocios, pero cada uno tiene **su propia base de datos PostgreSQL**: el backend identifica el tenant en cada petición y nunca mezcla sus datos.

---

## 🏗️ Arquitectura

| Capa | Tecnología | Plataforma |
|---|---|---|
| **Frontend** | JavaScript (ES6+, módulos) + Tailwind CSS | **Vercel** |
| **Backend** | Node.js + Express · Zod · Winston · Swagger | **Render** |
| **Base de datos** | PostgreSQL, una base de datos por tenant | **Supabase** |
| **Seguridad** | JWT · bcrypt · AES-256-CBC · Helmet · rate limiting | — |
| **Calidad** | Jest + Supertest · GitHub Actions · Docker | — |

```
Navegador ──HTTPS──▶ Vercel (frontend) ──fetch /api + x-tenant-id──▶ Render (API Express)
                                                                    ├──▶ PostgreSQL · market (Oh-Nails)
                                                                    └──▶ PostgreSQL · santi  (El Gallo Azul)
```

---

## 🏢 Los dos negocios

- **Oh-Nails (tenant `market`)**: agenda de citas, clientas recurrentes con aviso de inactividad a 30 días, finanzas y galería de trabajos.
- **El Gallo Azul (tenant `santi`)**: inventario con alertas de stock y caducidad, proveedores, facturas y estadísticas.

---

## 🔒 Seguridad

- **Autenticación**: JWT verificado por middleware en cada petición. El tenant viaja dentro del token: si la cabecera `x-tenant-id` no coincide, la API responde **403**.
- **Aislamiento multitenant**: `AsyncLocalStorage` propaga el contexto del tenant durante toda la petición, sin variables globales ni fugas entre peticiones concurrentes.
- **Cifrado**: datos sensibles cifrados con **AES-256-CBC** (IV único por registro) y contraseñas con **bcrypt**.
- **Cabeceras y abuso**: **Helmet**, CORS restringido por entorno y **rate limiting** en autenticación y API.
- **Datos**: el repositorio no contiene datos reales; los entornos locales usan *seeds* ficticios.

---

## 🐳 Ejecutar en local con Docker (recomendado)

Requisitos: [Docker](https://www.docker.com/) con Docker Compose.

```bash
git clone https://github.com/Angel-dxd/boutique-market.git
cd boutique-market
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:4200 |
| API | http://localhost:3000 |
| Documentación | http://localhost:3000/api/docs |

Usuarios de prueba: **`arelys`** (Oh-Nails) y **`santi`** (El Gallo Azul), contraseña **`demo1234`**.

Docker crea un PostgreSQL con **dos bases de datos** (`market` y `santi`), aplica el esquema (`backend/schema_postgres.sql`) y carga datos ficticios (`backend/db/seed_*.sql`), igual que la arquitectura de producción. Para empezar desde cero: `docker compose down -v`.

---

## 🛠️ Ejecutar sin Docker

Requisitos: Node.js 20+ y una base de datos PostgreSQL por tenant (por ejemplo, Supabase).

```bash
cd backend
npm install
cp .env.example .env     # rellena DATABASE_URL_MARKET, DATABASE_URL_SANTI, JWT_SECRET y ENCRYPTION_KEY
npm run dev              # API en http://localhost:3000

cd ../frontend
npm install
npm run dev              # frontend en http://localhost:4200
```

---

## 🧪 Tests

```bash
cd backend && npm test
```

El CI (GitHub Actions) ejecuta los tests en Node 20 y 22 y, después, levanta el stack completo con Docker para comprobar el login y el aislamiento entre tenants.

---

## 📈 KPIs del dashboard

- **Rentabilidad**: ingresos frente a gastos en tiempo real.
- **Stock crítico**: alertas cuando un producto baja del mínimo o está próximo a caducar.
- **Fidelización**: clientas que no han vuelto al salón en los últimos 30 días.

---

*Desarrollado por [Ángel Xavier Pons Márquez](https://github.com/Angel-dxd) · 2026*
