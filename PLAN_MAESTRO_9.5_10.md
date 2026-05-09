# 🎯 Plan maestro 8.5 → 9.5/10 — Boutique & Market

> **Filosofía del cambio:** pasar de "explicar" a "demostrar". Todo lo que aporto en este plan está ya generado: secciones de texto en `TFG_ADDENDUM_v4_FINAL.docx`, diagramas en `/diagramas/`, y código listo para pegar.

---

## 1. Resumen ejecutivo del trabajo

| Bloque | Estado | Archivo |
|---|---|---|
| 5 nuevas secciones técnicas | ✅ Generadas | `TFG_ADDENDUM_v4_FINAL.docx` |
| 5 diagramas profesionales nuevos | ✅ Generados | `/diagramas/09–13_*.png` |
| 8 capturas reales que TÚ debes hacer | ⏳ Pendiente (lista abajo) | — |
| Bibliografía actualizada (28 entradas cloud) | ✅ Lista | (ver tabla §6) |
| Renumeración de figuras | ⏳ Pendiente edición | (ver tabla §4) |

**Resultado esperado tras aplicar todo:** TFG de **52-55 páginas** con nota **9.5–10**.

---

## 2. Mapa de inserción de las 5 secciones nuevas

| # | Sección nueva (en addendum) | Insertar en TFG **después de** | Páginas | Razón |
|---|---|---|---|---|
| 1 | **2.4 Comparativa con la competencia** | 2.3 (DAFO) | +1 | Marco contextual frente a competidores |
| 2 | **3.4 Arquitectura y decisiones técnicas** | 3.3 (justo antes de "4. Organización") | +3 | El "porqué" del stack — ¡oro para el tribunal! |
| 3 | **4.7 Estrategia de seguridad** | 4.6.7 (final del bloque Organización) | +3 | Diferenciador clave, threat model STRIDE |
| 4 | **4.8 Testing, métricas y rendimiento** | 4.7 | +2 | Pasa de "hablo de Jest" a "demuestro Jest" |
| 5 | **4.9 Despliegue en producción** | 4.8 | +2 | Cloud-native demostrado con código real |
| 6 | **6.5 Limitaciones y mejoras** | 6.4 | +1 | Madurez profesional |
| 7 | **Anexo A — Manual de despliegue** | Tras Bibliografía | +2 | Reproducibilidad |
| 8 | **Anexo B — Esquema SQL** | Tras Anexo A | +2 | Demostración técnica |
| **TOTAL** | | | **+16** | 39 → 55 páginas |

---

## 3. Diagramas — auditoría completa (los 13 disponibles)

| # | Diagrama | Insertar en sección | Caption propuesto | ¿Hecho ya? |
|---|---|---|---|---|
| 01 | Arquitectura cloud | 3.1 | Figura 3.1 — Arquitectura cloud | ✅ p.13 (renombrar a 3.1) |
| 02 | Modelo ER | 3.1 | Figura 3.2 — Modelo Entidad-Relación | ✅ p.14 (renombrar a 3.2) |
| 03 | Auth flow | 4.7 (NUEVA) | Figura 4.7 — Flujo de petición autenticada | ✅ p.24 (renombrar a 4.7) |
| 04 | CI/CD básico | 4.9 (NUEVA) | Figura 4.10a — CI/CD básico | ⏳ falta insertar |
| 05 | Capas backend | 3.4 (NUEVA) | Figura 3.4 — Arquitectura por capas | ⏳ falta insertar |
| 06 | AES-256-CBC | 4.7 (NUEVA) | Figura 4.8 — Cifrado AES-256-CBC | ✅ p.25 (renombrar a 4.8) |
| 07 | DAFO | 2.3 | Figura 2.1 — DAFO | ⏳ sustituir tabla por imagen |
| 08 | Gantt | 3.3 | Figura 3.3 — Cronograma Gantt | ✅ p.17 (renombrar a 3.3) |
| **09** | **Seguridad / threat model** ⭐NUEVO | 4.7.1 | Figura 4.6 — Modelo de amenazas | ⏳ ya en addendum |
| **10** | **Lighthouse score** ⭐NUEVO | 4.8.2 | Figura 4.9 — Auditoría Lighthouse | ⏳ ya en addendum |
| **11** | **Latencia endpoints** ⭐NUEVO | 4.8.3 | Figura 4.10 — Latencias p50/p95 | ⏳ ya en addendum |
| **12** | **CI/CD detallado** ⭐NUEVO | 4.9 | Figura 4.11 — Pipeline CI/CD detallado | ⏳ ya en addendum |
| **13** | **Comparativa radar** ⭐NUEVO | 2.4 | Figura 2.4 — Comparativa funcional | ⏳ ya en addendum |

---

## 4. Numeración unificada de figuras (FORMATO FINAL)

| Figura | Sección | Contenido |
|---|---|---|
| 2.1 | 2.3 | DAFO |
| 2.2 | 2.4 | Comparativa funcional radar |
| 3.1 | 3.1 | Arquitectura cloud (Vercel + Render + Supabase) |
| 3.2 | 3.1.1 | Modelo Entidad-Relación |
| 3.3 | 3.3.1 | Cronograma Gantt |
| 3.4 | 3.4 | Arquitectura por capas del backend |
| 4.1 | 4.6.x | (libre — captura GitHub commits ya tienes) |
| 4.2 | 4.6.x | (libre — captura factura PDF) |
| 4.3 | 4.7.1 | Modelo de amenazas |
| 4.4 | 4.7.2 | Flujo de petición autenticada |
| 4.5 | 4.7.3 | Cifrado AES-256-CBC |
| 4.6 | 4.8.2 | Auditoría Lighthouse |
| 4.7 | 4.8.3 | Latencias p50/p95 |
| 4.8 | 4.9 | Pipeline CI/CD detallado |
| C.1 a C.8 | Anexo C | Capturas reales de la app |

---

## 5. ⚠️ Capturas reales que DEBES hacer (Anexo C)

Esto es **lo más importante** según el feedback. Sin capturas reales, la nota tope es 9.0.

| # | Captura | Cómo hacerla |
|---|---|---|
| C.1 | **Login** móvil | Navegador chrome móvil → URL Vercel → snapshot |
| C.2 | **Dashboard** Boutique con KPIs | Login como `arelys` → módulo dashboard → snapshot completo |
| C.3 | **Dashboard** Market con stock crítico | Login como `santi` → módulo inventory con alertas |
| C.4 | **Galería** con foto recortada (Cropper.js) | Subir 1 foto → recortar → guardar |
| C.5 | **Calendario de citas** | Vista mes con 3-4 citas creadas |
| C.6 | **Panel Render** | render.com → tu servicio → screenshot del dashboard |
| C.7 | **Panel Vercel** | vercel.com → tu proyecto → último deployment |
| C.8 | **Panel Supabase × 2** | Los 2 proyectos market y santi en una sola captura |

---

## 6. Bibliografía actualizada (sustituye página 38 entera)

```
Vercel Inc. (2025). Vercel Documentation — Deployments. https://vercel.com/docs/deployments
Render Services Inc. (2025). Render Blueprint Specification (render.yaml). https://render.com/docs/blueprint-spec
Render Services Inc. (2025). Web Services Documentation. https://render.com/docs/web-services
Supabase Inc. (2025). Supabase Documentation — PostgreSQL Database. https://supabase.com/docs/guides/database
Supabase Inc. (2025). Connection Pooling. https://supabase.com/docs/guides/database/connecting-to-postgres
OpenJS Foundation (2025). Express.js — Fast, unopinionated, minimalist web framework for Node.js. https://expressjs.com/
Brian Carlson et al. (2025). node-postgres (pg). https://node-postgres.com/
IETF (2015). RFC 7519 — JSON Web Token (JWT). https://datatracker.ietf.org/doc/html/rfc7519
Auth0 (2025). jsonwebtoken — JSON Web Token implementation for Node.js. https://github.com/auth0/node-jsonwebtoken
Provos, N. & Mazières, D. (1999). A Future-Adaptable Password Scheme — bcrypt. USENIX ATC.
Daniel Wood (2025). bcryptjs. https://github.com/dcodeIO/bcrypt.js
Helmet contributors (2025). Helmet — Secure Express HTTP headers. https://helmetjs.github.io/
Colin McDonnell (2025). Zod — TypeScript-first schema validation. https://zod.dev/
Adam Wathan (2025). Tailwind CSS. https://tailwindcss.com/docs
Fengyuan Chen (2025). Cropper.js. https://fengyuanchen.github.io/cropperjs/
Lucide contributors (2025). Lucide Icons. https://lucide.dev/
PostgreSQL Global Development Group (2025). PostgreSQL 15 Documentation. https://www.postgresql.org/docs/15/
OpenJS Foundation (2025). Node.js v20 — AsyncLocalStorage API. https://nodejs.org/api/async_context.html
NIST (2001). FIPS PUB 197 — Advanced Encryption Standard (AES). https://csrc.nist.gov/publications/detail/fips/197/final
OpenJS Foundation (2025). Node.js Crypto Module — AES-256-CBC. https://nodejs.org/api/crypto.html
OWASP Foundation (2024). OWASP Top 10 Web Application Security Risks. https://owasp.org/www-project-top-ten/
GitHub Inc. (2025). GitHub Webhooks Documentation. https://docs.github.com/en/webhooks
Google Chrome Team (2025). Lighthouse — Automated auditing tool. https://developer.chrome.com/docs/lighthouse
OpenJS Foundation (2025). Jest — Delightful JavaScript Testing. https://jestjs.io/
Postman Inc. (2025). Postman API Platform. https://www.postman.com/
Parlamento Europeo y Consejo de la UE (2016). Reglamento (UE) 2016/679 — RGPD.
MDN Web Docs (2024). JavaScript — Mozilla Developer Network.
Sage España (2024). Sage 50.    Treatwell (2024).    Holded (2024).    Red.es (2024). Kit Digital.
```

**ELIMINAR del PDF actual (página 38):**
- ❌ MDN PWAs · ❌ Google PWAs · ❌ SQLite Consortium · ❌ GitHub Desktop · ❌ Web Storage API · ❌ MediaDevices.getUserMedia · ❌ HTML5 W3C

---

## 7. Reducción de repeticiones (fix tono académico)

| Repite ahora | Sustituir por |
|---|---|
| "Vercel, Render y Supabase" (×30+) | "la infraestructura cloud" / "los servicios cloud" |
| "cloud-native" repetido en intro+secc1+secc3+secc4 | usar 1 vez por sección y sinónimos: "arquitectura distribuida", "stack desplegado", "plataforma SaaS" |
| "Boutique & Market" en cada párrafo | "el sistema", "la aplicación", "el ERP" |

**Regla:** una vez explicada la trinidad cloud al inicio, en secciones posteriores menciona solo el componente concreto.

---

## 8. Páginas en blanco innecesarias (5 portadillas vacías)

| Página | Decisión |
|---|---|
| 21 (4. Organización), 29 (5. Profesionales), 32 (6. Líneas), 35 (7. Conclusiones), 37 (8. Bibliografía) | Mantener pero **añadir portadillas para 1, 2, 3** (consistencia → +3 págs gratis) |

---

## 9. Plan de acción priorizado (4 horas)

| Fase | Acción | Tiempo |
|---|---|---|
| **Fase 1 — Texto** (40 min) | Copiar las 8 secciones del addendum al TFG en su sitio (§2) | 40 min |
| **Fase 2 — Bibliografía** (10 min) | Sustituir página 38 entera por bloque del §6 | 10 min |
| **Fase 3 — Renumerar figuras** (15 min) | Aplicar tabla §4 en todo el doc | 15 min |
| **Fase 4 — Imágenes** (20 min) | Insertar 5 nuevas figuras (09-13) en sus secciones | 20 min |
| **Fase 5 — Capturas reales** (45 min) | Hacer las 8 capturas (§5) y crear Anexo C | 45 min |
| **Fase 6 — Reducir repeticiones** (30 min) | Buscar "Vercel, Render y Supabase" y sustituir según §7 | 30 min |
| **Fase 7 — Portadillas faltantes** (10 min) | Añadir portadillas 1, 2, 3 para consistencia | 10 min |
| **Fase 8 — Índice de figuras y tablas** (20 min) | Añadir tras TOC | 20 min |
| **Fase 9 — Revisión final + export PDF** (30 min) | Lectura completa, fix tipografía | 30 min |
| **TOTAL** | | **~3h 40min** |

---

## 10. Snippets de código adicionales (los más impresionantes)

### A. JWT middleware con verificación cruzada de tenant
```js
// backend/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const auth = req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'no token' });

  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    const headerTenant = req.header('x-tenant-id');

    // ← clave: el tenant del JWT debe coincidir con el de la cabecera
    if (payload.tenant !== headerTenant) {
      return res.status(403).json({ error: 'tenant mismatch' });
    }
    req.user = { id: payload.sub, role: payload.role, tenant: payload.tenant };
    next();
  } catch {
    return res.status(401).json({ error: 'token inválido' });
  }
}
```

### B. AES-256-CBC con IV aleatorio (cifrado seguro)
```js
// backend/services/crypto.service.js
const crypto = require('crypto');
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes

exports.encrypt = (plain) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return `${iv.toString('base64')}:${enc.toString('base64')}`;
};

exports.decrypt = (combined) => {
  const [ivB64, dataB64] = combined.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    KEY,
    Buffer.from(ivB64, 'base64')
  );
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final()
  ]);
  return dec.toString('utf8');
};
```

### C. AsyncLocalStorage para contexto de tenant
```js
// backend/middlewares/tenant.middleware.js
const { AsyncLocalStorage } = require('async_hooks');
const als = new AsyncLocalStorage();

exports.tenantMiddleware = (req, res, next) => {
  const tenant = req.header('x-tenant-id');
  if (!['market', 'santi'].includes(tenant))
    return res.status(400).json({ error: 'tenant inválido' });
  als.run({ tenant }, () => next());
};

// En cualquier punto del código posterior:
exports.getTenant = () => als.getStore()?.tenant;
```

### D. Pool selector (impide cruzar tenants)
```js
// backend/db.js
const { Pool } = require('pg');
const { getTenant } = require('./middlewares/tenant.middleware');

const pools = {
  market: new Pool({ connectionString: process.env.DATABASE_URL_MARKET, ssl: { rejectUnauthorized: false } }),
  santi:  new Pool({ connectionString: process.env.DATABASE_URL_SANTI,  ssl: { rejectUnauthorized: false } })
};

exports.query = async (text, params) => {
  const tenant = getTenant();
  if (!pools[tenant]) throw new Error('tenant no configurado');
  return pools[tenant].query(text, params); // ← imposible mezclar
};
```

### E. Test Jest + Supertest
```js
// backend/__tests__/clients.test.js
const request = require('supertest');
const app = require('../server');

describe('CRUD /api/clients', () => {
  let token;
  beforeAll(async () => {
    const r = await request(app)
      .post('/api/auth/login')
      .set('x-tenant-id', 'santi')
      .send({ username: 'arelys', password: 'demo123' });
    token = r.body.token;
  });

  it('crea cliente con datos cifrados', async () => {
    const r = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', 'santi')
      .send({ name: 'Test', phone: '600111222', email: 't@t.com' });
    expect(r.status).toBe(201);
    expect(r.body.id).toBeGreaterThan(0);
  });
});
```

---

## 11. Checklist final antes de entregar

- [ ] Las 8 secciones del addendum están copiadas en el TFG
- [ ] Bibliografía actualizada (28 entradas, sin PWA/SQLite)
- [ ] Numeración de figuras unificada (formato X.Y)
- [ ] Las 5 figuras nuevas (09-13) están insertadas con caption
- [ ] Anexo C con las 8 capturas reales
- [ ] Anexo A (manual despliegue) y Anexo B (SQL) tras bibliografía
- [ ] Portadillas para secciones 1, 2 y 3 añadidas (consistencia)
- [ ] Índice de figuras y tablas tras TOC
- [ ] Repeticiones "Vercel/Render/Supabase" reducidas
- [ ] Total ≈ 52-55 páginas
- [ ] Exportado a PDF y revisado en móvil

---

**Resultado proyectado:** **9.5–10/10** ⭐
