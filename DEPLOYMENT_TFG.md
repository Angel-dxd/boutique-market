# Arquitectura de Despliegue y CI/CD

Este documento detalla la estrategia de contenerización y el flujo de Integración y Despliegue Continuo (CI/CD) diseñado para la plataforma "Marquez Family Business" (Boutique Market).

## 1. Arquitectura de Contenedores (Docker)

La aplicación ha sido desacoplada en una arquitectura de microservicios utilizando **Docker Compose**, lo que garantiza un entorno idéntico tanto en desarrollo como en producción.

### Componentes del Sistema

1. **Base de Datos (`db`)**:
   - **Imagen**: `mysql:8.0`
   - **Volúmenes**: Persistencia de datos en `db_data` para evitar pérdida de información al reiniciar los contenedores.
   - **Inicialización (Multitenant)**: Se utilizan scripts automatizados (`01-create-santi.sql`, `02-estructura_base.sql`) montados en `/docker-entrypoint-initdb.d/` para generar dinámicamente las bases de datos de ambos negocios (`boutique_market` y `boutique_santi`) en el primer arranque.

2. **Backend API (`backend`)**:
   - **Imagen Base**: `node:18-alpine` (ligera y segura para producción).
   - **Proceso**: Instalación limpia con `npm ci --only=production` para excluir dependencias de desarrollo y optimizar el peso de la imagen.
   - **Seguridad**: Inyección de variables de entorno mediante Docker para credenciales y secretos (JWT, AES-256).

3. **Frontend UI (`frontend`)**:
   - **Servidor Web**: `nginx:alpine`
   - **Optimización**: Se ha configurado Nginx (`nginx.conf`) para comprimir la transferencia con `gzip` y servir de manera eficiente los archivos estáticos de la SPA (Single Page Application), redirigiendo todo el tráfico no encontrado a `index.html` para el correcto funcionamiento del enrutador frontend.

---

## 2. Instrucciones de Despliegue Local

Para levantar el ecosistema completo en cualquier máquina con Docker instalado, basta con ejecutar un único comando desde la raíz del proyecto:

```bash
# Construir y levantar todos los servicios en segundo plano
docker compose up -d --build
```

Esto expondrá:
- **Frontend (UI)**: `http://localhost:4200`
- **Backend (API)**: `http://localhost:3000`
- **Base de Datos**: `localhost:3306`

---

## 3. Estrategia de CI/CD (Trabajo Futuro / Despliegue en la Nube)

Para un entorno de producción (ej. AWS, DigitalOcean, o Render), se propone el siguiente pipeline automatizado (ej. usando **GitHub Actions**):

### Fase 1: Integración Continua (CI)
- **Trigger**: Cada `push` a la rama `main`.
- **Linting & Code Quality**: Verificación de sintaxis del código Vanilla JS y Node.js.
- **Build de Imágenes**: Construcción de las imágenes de Docker (`frontend` y `backend`) para asegurar que no hay errores de dependencias.

### Fase 2: Despliegue Continuo (CD)
- **Registry**: Las imágenes validadas se suben a un registro (ej. Docker Hub o GitHub Container Registry).
- **Update Automático**: El servidor de producción recibe un webhook, descarga la nueva imagen y reinicia el servicio afectado (`docker compose pull && docker compose up -d`), asegurando un tiempo de inactividad casi nulo (*Zero Downtime Deployment*).

> [!NOTE]
> Esta arquitectura garantiza que la aplicación es escalable, replicable en cualquier entorno, y profesionalmente estructurada de acuerdo a los estándares actuales de la industria del software.
