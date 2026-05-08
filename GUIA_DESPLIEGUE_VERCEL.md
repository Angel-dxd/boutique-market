# Guía de despliegue gratuito — Boutique & Market

**Estrategia**: Frontend en **Vercel** + Backend Node en **Render Free** + DB **Supabase Postgres**.
**Tiempo estimado**: 2-4 h. **Coste**: 0€.
**Repo**: `https://github.com/Angel-dxd/boutique-market.git` (rama `main`).

---

## 0. Pre-requisitos checklist

| Requisito | Cómo se verifica |
|---|---|
| Cuenta GitHub conectada a Vercel | https://vercel.com (ya hecho) |
| Cuenta Supabase con proyecto + tablas | Dashboard https://supabase.com/dashboard |
| Cuenta Render (gratis con GitHub) | https://render.com/register |
| Node 18+ instalado localmente | `node -v` |
| Git CLI o GitHub Desktop | `git --version` |

---

## 1. Cambios mínimos al código (antes de pushear)

Tu stack actual usa MySQL2 + `config.json` con dos pools (`market` y `santi`). Para Supabase **Postgres** se necesitan tres ajustes.

### 1.1 Reemplazar `mysql2` por `pg` (driver Postgres)

`backend/package.json` — cambia la dependencia:

```json
{
  "dependencies": {
    "bcrypt": "^6.0.0",
    "cors": "^2.8.6",
    "dotenv": "^16.6.1",
    "express": "^4.22.1",
    "helmet": "^8.1.0",
    "jsonwebtoken": "^9.0.3",
    "pg": "^8.13.0",
    "zod": "^4.3.6"
  }
}
```

> Borra `mysql2`, añade `pg`. Después: `cd backend && npm install`.

### 1.2 Adaptar `backend/src/config/db.js` a Postgres

Sustituye el contenido completo por:

```js
/**
 * Configuración de Base de Datos Multi-tenant — Postgres (Supabase).
 * Cada tenant ('market', 'santi') puede usar un schema distinto dentro del mismo
 * proyecto Supabase, o dos proyectos Supabase separados.
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { AsyncLocalStorage } = require('async_hooks');

const tenantContext = new AsyncLocalStorage();

const configPath = path.join(__dirname, '../../config.json');
const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const pools = {};
for (const [tenant, cfg] of Object.entries(configData)) {
    pools[tenant] = new Pool({
        connectionString: process.env[`DATABASE_URL_${tenant.toUpperCase()}`] || cfg.connectionString,
        ssl: { rejectUnauthorized: false }
    });

    pools[tenant].connect()
        .then(c => { console.log(`✅ Pool conectado: tenant '${tenant}'`); c.release(); })
        .catch(err => console.error(`❌ Error tenant '${tenant}':`, err.message));
}

const db = {
    query: async (sql, params = []) => {
        const tenant = tenantContext.getStore() || 'market';
        const pool = pools[tenant] || pools['market'];
        // pg usa $1, $2... en lugar de ? — ver sección 1.4
        const result = await pool.query(sql, params);
        return [result.rows, result.fields];
    },
    execute: async (sql, params = []) => {
        const tenant = tenantContext.getStore() || 'market';
        const pool = pools[tenant] || pools['market'];
        const result = await pool.query(sql, params);
        return [result.rows, result.fields];
    },
    tenantContext
};

module.exports = db;
```

### 1.3 Crear `backend/config.example.json` con las cadenas Supabase

> Recuerda: `config.json` está en `.gitignore` (no se sube). Solo subes el `.example`.

```json
{
  "market": {
    "connectionString": "postgresql://postgres.<ref>:<password>@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"
  },
  "santi": {
    "connectionString": "postgresql://postgres.<ref-santi>:<password>@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"
  }
}
```

> Saca cada `connectionString` desde **Supabase Dashboard → Project Settings → Database → Connection string → URI** (modo **Transaction pooler** para serverless o **Session** para Render).

### 1.4 ⚠️ Adaptar sintaxis SQL en los controllers

MySQL usa `?`, Postgres usa `$1, $2...`. Tienes que recorrer los 10 controllers y cambiar:

```js
// ANTES (MySQL)
db.query('SELECT * FROM clientes WHERE id = ? AND tenant = ?', [id, tenant]);

// DESPUÉS (Postgres)
db.query('SELECT * FROM clientes WHERE id = $1 AND tenant = $2', [id, tenant]);
```

Otros cambios menores frecuentes:

| MySQL | Postgres |
|---|---|
| `?` | `$1, $2, $3...` |
| `AUTO_INCREMENT` | `SERIAL` o `GENERATED ALWAYS AS IDENTITY` |
| `LIMIT 10 OFFSET 5` | igual |
| `NOW()` | `NOW()` (ok) |
| `DATE_FORMAT(x, '%Y-%m-%d')` | `TO_CHAR(x, 'YYYY-MM-DD')` |
| `IFNULL(a, b)` | `COALESCE(a, b)` |
| Backticks ` `` ` para nombres | Comillas dobles `"campo"` |
| `ER_DUP_ENTRY` | code `'23505'` |

> **Tip rápido**: usa búsqueda global en VSCode (`Ctrl+Shift+F`) por `db.query(` y `db.execute(` — tendrás todos los puntos a revisar.

### 1.5 Ajustar el error handler en `server.js`

```js
// Cambiar:
if (err.code === 'ER_DUP_ENTRY') { ... }
if (err.code === 'ER_BAD_FIELD_ERROR') { ... }

// Por:
if (err.code === '23505') { /* duplicate key */ ... }
if (err.code === '42703') { /* undefined column */ ... }
```

### 1.6 Configurar CORS para producción

Tu `cors({ origin: '*' })` actual es demasiado permisivo en producción. Cambia:

```js
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200').split(',');
app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) cb(null, true);
        else cb(new Error('CORS bloqueado'));
    }
}));
```

### 1.7 Variable de entorno API en frontend

Crea `frontend/js/features/core/config.js`:

```js
// Determina la URL de la API según el entorno
export const API_URL = import.meta?.env?.VITE_API_URL
    || window.__API_URL__
    || (window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api');
```

Y modifica `api.js` línea 9:

```js
import { API_URL } from './config.js';
```

> Como tu frontend NO usa Vite bundler real (es Vanilla JS servido estático), inyecta la URL en `index.html` antes de cargar `app.js`:

```html
<script>
  window.__API_URL__ = 'https://boutique-market-api.onrender.com/api';
</script>
<script type="module" src="/js/features/core/app.js"></script>
```

---

## 2. Migrar el schema MySQL → Postgres en Supabase

> Si **ya migraste** las 7 tablas y datos (como dijiste), salta a la sección 3.

Si aún no:

1. Exporta tu MySQL local:
   ```bash
   mysqldump -u user -p boutique_market > market_dump.sql
   mysqldump -u user -p boutique_santi > santi_dump.sql
   ```
2. Convierte sintaxis con `pgloader` (gratis, open source):
   ```bash
   brew install pgloader   # mac
   sudo apt install pgloader  # linux
   pgloader mysql://user:pass@localhost/boutique_market \
            postgresql://postgres.<ref>:<pass>@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
   ```
3. Verifica en Supabase Dashboard → Table Editor que las 7 tablas + 7 triggers están.
4. Adapta los triggers: la sintaxis SQLite/MySQL ≠ PL/pgSQL. Ver Anexo A más abajo.

---

## 3. Subir cambios a GitHub

```bash
cd /ruta/a/tu/proyecto
git checkout -b feat/deploy-vercel-render
git add backend/package.json backend/src/config/db.js backend/server.js \
        backend/config.example.json frontend/js/features/core/api.js \
        frontend/index.html frontend/js/features/core/config.js
git commit -m "feat(deploy): adaptar backend a Postgres y preparar despliegue cloud

- Reemplaza mysql2 por pg (driver PostgreSQL)
- Refactoriza db.js para usar connectionString por tenant
- Cambia error codes MySQL por códigos SQLSTATE Postgres
- Restringe CORS a orígenes permitidos en producción
- Inyecta API_URL desde index.html para frontend estático
- Añade config.example.json sin credenciales reales"

git push origin feat/deploy-vercel-render
```

Después abre PR en GitHub: `feat/deploy-vercel-render` → `main`.

### Plantilla de descripción del MR/PR

```markdown
## Resumen
Migración de la base de datos a Supabase Postgres y preparación del proyecto
para despliegue en infraestructura cloud gratuita (Vercel + Render).

## Cambios
- 🔄 Driver de BD: `mysql2` → `pg`
- 🔧 `db.js` adaptado a `connectionString` por tenant
- 🛡️ CORS restringido a orígenes permitidos en producción
- 📦 Añadido `config.example.json` (las credenciales reales quedan en .env del servidor)
- 🌐 Frontend: `API_URL` inyectada vía `index.html` para entorno producción

## Pasos de seguridad realizados
- ✅ Confirmado que `config.json` y `.env` siguen en `.gitignore`
- ✅ Sin credenciales reales en el commit (verificado con `git diff --cached`)
- ✅ Variables sensibles van como ENV en Render/Vercel, nunca en repo
- ✅ Triggers Postgres mantienen integridad referencial (idéntica a SQLite)

## Test plan
- [ ] Deploy en Render: `/` responde `{ status: "Online" }`
- [ ] Deploy en Vercel: carga el `index.html` sin error de CSS
- [ ] Login funcional con usuario admin
- [ ] CRUD de clientes (boutique) y productos (market)
- [ ] Cambio de tenant respeta aislamiento de datos
```

---

## 4. Desplegar el backend en Render Free

1. Login en https://render.com con GitHub.
2. **New +** → **Web Service** → conecta el repo `boutique-market`.
3. Configura:

| Campo | Valor |
|---|---|
| Name | `boutique-market-api` |
| Region | `Frankfurt` (o el más cercano a Supabase) |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm ci --only=production` |
| Start Command | `node server.js` |
| Plan | **Free** |

4. **Environment Variables** (pestaña Environment):

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATABASE_URL_MARKET` | `postgresql://postgres.<ref>:<pass>@aws-0-...pooler.supabase.com:5432/postgres` |
| `DATABASE_URL_SANTI` | `postgresql://postgres.<ref-santi>:<pass>@...:5432/postgres` |
| `JWT_SECRET` | `<genera 64 chars random>` (no reutilices el dev) |
| `ALLOWED_ORIGINS` | `https://boutique-market.vercel.app,http://localhost:4200` |

5. **Deploy** → espera ~3-5 min → te dará URL tipo `https://boutique-market-api.onrender.com`.
6. Verifica: `curl https://boutique-market-api.onrender.com/` debe devolver JSON `Online`.

> ⚠️ **Render Free duerme tras 15 min sin tráfico**. Primera petición tras dormir tarda ~30s. Soluciones:
> - Para defensa de TFG puntual: aceptable.
> - Para uso real: configura **UptimeRobot** (gratis, https://uptimerobot.com) que haga ping cada 5 min al endpoint `/`.

---

## 5. Desplegar el frontend en Vercel

1. Antes de pushear, edita `frontend/index.html` con la URL de Render:

```html
<script>window.__API_URL__ = 'https://boutique-market-api.onrender.com/api';</script>
```

Commit y push.

2. Login en https://vercel.com → **Add New** → **Project** → importa `boutique-market`.
3. Configura:

| Campo | Valor |
|---|---|
| Framework Preset | **Other** |
| Root Directory | `frontend` |
| Build Command | `npm run build:css` |
| Output Directory | `.` (raíz del frontend) |
| Install Command | `npm install` |

4. **Environment Variables**: ninguna necesaria (la URL del API ya va en `index.html`).
5. **Deploy** → espera ~1-2 min → te da URL `https://boutique-market.vercel.app`.

### Si tu frontend necesita rewrites (URLs limpias)

Crea `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## 6. Verificación post-deploy

| Check | Comando / acción | Esperado |
|---|---|---|
| Backend vivo | `curl https://boutique-market-api.onrender.com/` | `{"message":"Boutique & Market API Running"}` |
| Frontend carga | Abrir `https://boutique-market.vercel.app` | Pantalla de login renderiza |
| Login funcional | Probar credenciales reales | Redirección a dashboard |
| CORS ok | DevTools → Network → ver `Access-Control-Allow-Origin` | `https://boutique-market.vercel.app` |
| Tenant header | DevTools → Network → `x-tenant-id: market` o `santi` | Datos diferenciados |
| RLS / privacidad | Login como admin vs usuario normal | Cada uno ve solo su info |

---

## 7. Troubleshooting frecuente

| Síntoma | Causa probable | Solución |
|---|---|---|
| `ECONNREFUSED` en Render logs | Connection string mal formada | Revisa pooler vs direct connection en Supabase |
| `error: password authentication failed` | Password Supabase con caracteres especiales sin URL-encode | Usa `encodeURIComponent` o regenera password sin símbolos |
| Frontend muestra "CORS blocked" | `ALLOWED_ORIGINS` no incluye dominio Vercel | Añade `https://*.vercel.app` o el dominio exacto |
| Cold start de 30s en backend | Render Free duerme | UptimeRobot pinging cada 5min |
| `CSS no carga` en Vercel | Falta build de Tailwind | Verifica `Build Command: npm run build:css` |
| `/login` da 404 al refrescar | Falta rewrite SPA | Añade `vercel.json` (sección 5) |

---

## Anexo A — Migración de triggers SQLite/MySQL a PL/pgSQL

Tus 7 triggers cambian de sintaxis pero **no de lógica**. Ejemplo conversión:

```sql
-- MySQL/SQLite
CREATE TRIGGER tr_actualizar_stock
AFTER INSERT ON ventas
FOR EACH ROW
BEGIN
  UPDATE productos SET stock = stock - NEW.cantidad WHERE id = NEW.producto_id;
END;
```

```sql
-- PostgreSQL (Supabase)
CREATE OR REPLACE FUNCTION fn_actualizar_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE productos SET stock = stock - NEW.cantidad WHERE id = NEW.producto_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_actualizar_stock
AFTER INSERT ON ventas
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_stock();
```

> Defensa para tribunal: "El concepto de integridad referencial vía triggers se mantiene. Solo cambia la sintaxis de declaración, demostrando portabilidad del diseño relacional."

---

## Anexo B — Cambios necesarios en la memoria del TFG (`123.pdf`)

Para mantener coherencia entre lo entregado y lo desplegado, modifica los siguientes apartados de la memoria. Te indico **dónde** y **qué** cambiar.

### B.1 Resumen / Abstract (página 1)

| Frase actual | Reemplazar por |
|---|---|
| "...desarrollado como Aplicación Web Progresiva (PWA) con Vanilla JavaScript, HTML5, CSS3 y SQLite." | "...desarrollado como Aplicación Web Progresiva (PWA) con Vanilla JavaScript, HTML5, CSS3, una API REST en Node.js/Express y base de datos PostgreSQL gestionada en Supabase." |
| "...integridad referencial gestionada por 7 triggers SQLite y un esquema relacional de 7 tablas." | "...integridad referencial gestionada por 7 triggers PL/pgSQL y un esquema relacional de 7 tablas." |
| Palabras clave: "...SQLite, Vanilla JavaScript..." | "...PostgreSQL, Supabase, Vercel, Vanilla JavaScript..." |

### B.2 Sección 2.2.3 — Tipo de proyecto requerido (página 8)

| Frase actual | Reemplazar por |
|---|---|
| "Tecnologías: Vanilla JavaScript ... y Localstorage/API para la persistencia de datos." | "Tecnologías: Vanilla JavaScript en frontend para rendimiento óptimo, API REST con Node.js/Express en backend, y PostgreSQL (Supabase) para persistencia con Row Level Security nativa." |

### B.3 Sección 2.2.4 — Nivel 1 Accesibilidad (página 9)

| Frase actual | Reemplazar por |
|---|---|
| "Requiere la contratación de un Hosting/Servidor con certificado SSL para garantizar la seguridad de los datos." | "Despliegue gratuito en infraestructura cloud (Vercel CDN + Render + Supabase) con certificados SSL automáticos vía Let's Encrypt, eliminando barreras de coste para el cliente final." |

### B.4 Sección 3.2.1 — Estudio de viabilidad técnica (página 13)

Añade un sub-apartado **3.2.1.b — Arquitectura de despliegue**:

```
La arquitectura de producción se ha diseñado siguiendo el principio de
separación de responsabilidades en proveedores especializados de coste cero:

- Frontend estático servido desde Vercel (CDN global, HTTPS automático).
- Backend Node.js/Express alojado en Render (contenedor gestionado).
- Base de datos PostgreSQL gestionada en Supabase (backups automáticos).

Esta separación facilita la escalabilidad horizontal independiente de cada
capa y mantiene el coste total en 0€/mes durante la fase de validación con
los usuarios reales (Arelys y Santi).
```

### B.5 Sección 3.4.4 — Necesidades de financiación (página 18)

| Frase actual | Reemplazar por |
|---|---|
| (cualquier mención a coste de hosting/servidor) | "Coste de despliegue en producción: 0€/mes durante el primer año aprovechando los planes gratuitos de Vercel (100GB bandwidth), Render (instancia 512MB con sleep tras inactividad) y Supabase (500MB DB + 1GB storage)." |

### B.6 DAFO — Tabla página 9

**Añade a Fortalezas (F)**:
- "Despliegue continuo automatizado mediante Vercel (cada push a main genera deploy nuevo)."
- "Infraestructura cloud sin coste con HTTPS y CDN global."

**Añade a Debilidades (D)**:
- "Cold-start del backend en plan gratuito de Render (~30s tras 15min de inactividad)."
- "Vendor lock-in moderado en Supabase (mitigable: schema SQL estándar exportable)."

**Añade a Oportunidades (O)**:
- "Posibilidad de upgrade gradual a planes de pago si el negocio escala (Vercel Pro 20€/mes, Supabase Pro 25$/mes)."

### B.7 Sección 4.6 — Seguimiento y control (página 27)

Añade en **4.6.5 Procedimiento para gestión y registro de cambios**:

```
El sistema implementa un pipeline de Despliegue Continuo (CD):

1. Cada Pull Request en GitHub genera un entorno de previsualización
   en Vercel con URL única, permitiendo validar cambios antes de merge.
2. El merge a la rama main dispara automáticamente:
   a. Build y deploy del frontend en Vercel (~1 min).
   b. Build y deploy del backend en Render (~3 min).
3. La base de datos Supabase mantiene migraciones versionadas en /supabase/migrations.

Este flujo garantiza trazabilidad completa de los cambios y rollback
inmediato en caso de incidencia (botón "Rollback to previous deploy").
```

### B.8 Sección 8 — Bibliografía

Añade referencias:

```
- Vercel Inc. (2026). Vercel Deployment Documentation.
  https://vercel.com/docs

- Supabase Inc. (2026). Supabase PostgreSQL Database.
  https://supabase.com/docs/guides/database

- Render Services (2026). Render Web Services on Free Plan.
  https://render.com/docs/free
```

---

## 8. Comandos rápidos de verificación final

```bash
# 1. Backend up
curl -i https://boutique-market-api.onrender.com/

# 2. Login funcional
curl -X POST https://boutique-market-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: market" \
  -d '{"email":"admin@test.com","password":"tu_password"}'

# 3. Frontend up
curl -I https://boutique-market.vercel.app/

# 4. Logs en tiempo real Render
# Dashboard Render → tu servicio → Logs

# 5. Logs en tiempo real Vercel
# Dashboard Vercel → tu proyecto → Deployments → último → Functions logs
```

---

## 9. Resumen ejecutivo del flujo

```
┌─────────────┐  HTTPS   ┌──────────────┐  HTTPS   ┌──────────────┐
│   Usuario   │ ───────► │   Vercel     │ ───────► │   Render     │
│  (browser)  │          │  (Frontend   │          │  (Backend    │
│             │          │   estático)  │          │   Node API)  │
└─────────────┘          └──────────────┘          └──────┬───────┘
                                                          │
                                                          │ TLS
                                                          ▼
                                                   ┌──────────────┐
                                                   │   Supabase   │
                                                   │ (PostgreSQL) │
                                                   └──────────────┘
```

**Coste total mensual**: 0€.
**Tiempo del primer deploy completo**: 2-4 h (siguiendo esta guía sin interrupciones).
**Tiempo de cada deploy posterior**: 1-3 min (`git push` y listo).

---

> Cuando todos los checks de la sección 6 estén en verde, abre el PDF de la memoria del TFG y aplica los cambios indicados en el **Anexo B**. Te recomiendo hacerlo en una **rama separada del documento** (`memoria-v2-cloud.docx`) para conservar la versión original por si el tribunal pide ambas.
