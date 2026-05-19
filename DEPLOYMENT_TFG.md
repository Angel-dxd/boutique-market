# Arquitectura de Despliegue y CI/CD

Este documento detalla la estrategia de contenerización y el flujo de Integración y Despliegue Continuo (CI/CD) de la plataforma **Boutique Market**.

---

## 1. Arquitectura Cloud (Producción)

El stack de producción es completamente serverless y no requiere gestión de infraestructura propia:

| Capa | Tecnología | Plataforma |
|---|---|---|
| Frontend | Vanilla JS + Tailwind CSS | Vercel (CD automático desde `main`) |
| Backend API | Node.js 18 + Express | Render (Web Service) |
| Base de Datos | PostgreSQL 15 (Multitenant) | Supabase (2 proyectos independientes) |

---

## 2. Arquitectura de Contenedores (Desarrollo Local con Docker)

La aplicación puede levantarse completamente en local mediante **Docker Compose**, garantizando un entorno reproducible.

### Componentes del Sistema

**Base de Datos (`db`)**
- **Imagen**: `postgres:15-alpine`
- **Volúmenes**: Persistencia de datos en `db_data` para evitar pérdida de información al reiniciar los contenedores.
- **Inicialización (Multitenant)**: Scripts SQL montados en `/docker-entrypoint-initdb.d/` crean dinámicamente las dos bases de datos (`boutique_market` y `boutique_santi`) en el primer arranque.

**Backend API (`backend`)**
- **Imagen Base**: `node:18-alpine` (ligera y segura para producción).
- **Proceso**: Instalación limpia con `npm ci --only=production` para excluir dependencias de desarrollo y optimizar el peso de la imagen.
- **Seguridad**: Variables de entorno inyectadas via Docker para credenciales y secretos (JWT_SECRET, AES_KEY).

**Frontend UI (`frontend`)**
- **Servidor Web**: `nginx:alpine`
- **Optimización**: Nginx configurado con `gzip` para comprimir activos estáticos y SPA fallback (`try_files $uri /index.html`) para el hash router.

### Arranque rápido

```bash
# Construir y levantar todos los servicios en segundo plano
docker compose up -d --build
```

Servicios expuestos:
- **Frontend (UI)**: `http://localhost:4200`
- **Backend (API)**: `http://localhost:3000`
- **Documentación API**: `http://localhost:3000/api/docs`
- **Base de Datos**: `localhost:5432`

---

## 3. CI/CD implementado — GitHub Actions

El pipeline está activo en `.github/workflows/ci.yml` y se ejecuta automáticamente.

### Fase 1: Integración Continua (CI) — **Activo**
- **Trigger**: cada `push` a `main` y cada `Pull Request`.
- **Matrix**: Node.js 18.x y 20.x en paralelo.
- **Steps**: checkout → setup Node → `npm ci` → `npm test` (Jest + Supertest).
- **Artefacto**: reporte de cobertura subido como artifact en la ejecución de Node 20.

### Fase 2: Despliegue Continuo (CD) — Render + Vercel
- **Vercel**: detecta cada push a `main` y redespliega el frontend automáticamente (0 configuración adicional).
- **Render**: configurado con auto-deploy desde `main` vía `render.yaml`. Cualquier push dispara un rebuild y redeployment del backend.

> [!NOTE]
> Esta arquitectura garantiza que la aplicación es escalable, replicable en cualquier entorno, y estructurada conforme a los estándares actuales de la industria del software.
