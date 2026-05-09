# Guía de cambios — TFG Boutique & Market — Objetivo 10/10

> Ya tienes generados todos los entregables. Esta guía te dice **qué falta**, **dónde insertarlo** y **qué eliminar** del PDF actual (`ultimos cambios.pdf`) para alcanzar la nota máxima.

---

## 1. Entregables generados (en `/boutique-market/`)

| Archivo | Contenido | Acción |
|---|---|---|
| `TFG_BoutiqueMarket_v3_FINAL.docx` | TFG completo con bibliografía corregida, índice de figuras/tablas, 8 diagramas embebidos y referencias internas | **Usar este como base nueva** |
| `diagramas/01_arquitectura.png` | Cliente → Vercel → Render → Supabase × 2 | Insertado en sección 4.1 |
| `diagramas/02_er.png` | Modelo Entidad-Relación (9 tablas) | Insertado en sección 4.3 |
| `diagramas/03_auth_flow.png` | Sequence diagram login + tenant | Insertado en sección 4.4 |
| `diagramas/04_cicd.png` | Pipeline GitHub → Vercel + Render | Insertado en sección 6.1 |
| `diagramas/05_capas_backend.png` | 8 capas: HTTP → server.js → middlewares → routes → controllers → services → db.js → PostgreSQL | Insertado en sección 4.2 |
| `diagramas/06_aes.png` | Cifrado AES-256-CBC con IV | Insertado en sección 4.5 |
| `diagramas/07_dafo.png` | Matriz DAFO en 4 cuadrantes | Insertado en sección 2.4 |
| `diagramas/08_gantt.png` | Cronograma del proyecto | Insertado en sección 2.5 |
| `diagramas/mermaid/*.mmd` | Fuentes Mermaid editables (`01_arquitectura`, `03_auth_flow`, `04_cicd`) | Para re-renderizar en https://mermaid.live |

---

## 2. Tabla maestra de cambios (sobre tu PDF actual)

| # | Sección PDF actual | Problema | Acción concreta |
|---|---|---|---|
| 1 | TOC / Índice general | Aparece "Lógica de Automatización (Triggers)" pero los triggers ya no existen | **Renombrar** a "Lógica de negocio en backend (servicios)" o eliminar |
| 2 | Tras el TOC | No existe Lista de figuras ni Lista de tablas | **Insertar** dos nuevas páginas: "Índice de figuras" e "Índice de tablas" (ya generadas en v3) |
| 3 | Sección 2 (Análisis) | Solo texto, sin DAFO visual ni Gantt | **Insertar** `diagramas/07_dafo.png` (Figura 2.1) y `diagramas/08_gantt.png` (Figura 2.2) |
| 4 | Sección 4 (Diseño) | Sin diagrama de arquitectura ni ER ni capas ni auth flow ni AES | **Insertar** los 5 diagramas (`01`, `02`, `03`, `05`, `06`) con su caption |
| 5 | Sección 6 (Despliegue) | Sin diagrama del pipeline | **Insertar** `diagramas/04_cicd.png` (Figura 6.1) |
| 6 | Sección 6 — caption "Historial de commits" | Caption presente, imagen ausente | **Captura real** desde `https://github.com/<tu-usuario>/<repo>/graphs/commit-activity` y pegarla bajo el caption |
| 7 | Bibliografía | Cita MDN PWA, Google PWA, SQLite Consortium, GitHub Desktop | **Sustituir bloque entero** por la bibliografía v3 (ya generada con 22 referencias actualizadas: Vercel, Render, Supabase, Express, pg, JWT RFC 7519, bcrypt, Helmet, Zod, Tailwind, Cropper, Lucide, PostgreSQL, Node Crypto, FIPS 197, OWASP, GitHub Webhooks…) |
| 8 | Todo el documento | Las figuras no están numeradas ni referenciadas en el texto | **Reemplazar** por v3 (ya tiene "como se aprecia en la Figura 4.1…", etc.) |
| 9 | Página inicial / portada | Subtítulo aún menciona stack antiguo (si aplica) | Verificar y usar v3 ("Plataforma SaaS multi-tenant… Vercel + Render + Supabase") |
| 10 | Sección 5 (Implementación) | No menciona la **capa de compatibilidad SQL** (db.js que traduce `?` → `$1`) | v3 lo añade en 5.3 |

---

## 3. Bibliografía nueva (reemplazar bloque completo)

Pega este bloque exacto en lugar del actual. **Eliminar TODAS las referencias a PWA, SQLite Consortium, MDN PWA, Google Developers PWA, GitHub Desktop**.

```
Vercel Inc. (2025). Vercel Documentation — Deployments. https://vercel.com/docs/deployments
Render Services Inc. (2025). Render Blueprint Specification (render.yaml). https://render.com/docs/blueprint-spec
Render Services Inc. (2025). Web Services Documentation. https://render.com/docs/web-services
Supabase Inc. (2025). Supabase Documentation — PostgreSQL Database. https://supabase.com/docs/guides/database
Supabase Inc. (2025). Supabase Documentation — Connection Pooling. https://supabase.com/docs/guides/database/connecting-to-postgres
OpenJS Foundation (2025). Express.js — Fast, unopinionated, minimalist web framework for Node.js. https://expressjs.com/
Brian Carlson et al. (2025). node-postgres (pg) — Non-blocking PostgreSQL client for Node.js. https://node-postgres.com/
IETF (2015). RFC 7519 — JSON Web Token (JWT). https://datatracker.ietf.org/doc/html/rfc7519
Auth0 (2025). jsonwebtoken — JSON Web Token implementation for Node.js. https://github.com/auth0/node-jsonwebtoken
Provos, N. & Mazières, D. (1999). A Future-Adaptable Password Scheme — bcrypt. USENIX ATC.
Daniel Wood (2025). bcryptjs — Optimized bcrypt for plain JavaScript. https://github.com/dcodeIO/bcrypt.js
Helmet contributors (2025). Helmet — Help secure Express apps with various HTTP headers. https://helmetjs.github.io/
Colin McDonnell (2025). Zod — TypeScript-first schema validation. https://zod.dev/
Adam Wathan (2025). Tailwind CSS — A utility-first CSS framework. https://tailwindcss.com/docs
Fengyuan Chen (2025). Cropper.js — JavaScript image cropper. https://fengyuanchen.github.io/cropperjs/
Lucide contributors (2025). Lucide Icons. https://lucide.dev/
PostgreSQL Global Development Group (2025). PostgreSQL 15 Documentation. https://www.postgresql.org/docs/15/
OpenJS Foundation (2025). Node.js v20 — AsyncLocalStorage API. https://nodejs.org/api/async_context.html
NIST (2001). FIPS PUB 197 — Advanced Encryption Standard (AES). https://csrc.nist.gov/publications/detail/fips/197/final
OpenJS Foundation (2025). Node.js Crypto Module — AES-256-CBC. https://nodejs.org/api/crypto.html
OWASP Foundation (2024). OWASP Top 10 Web Application Security Risks. https://owasp.org/www-project-top-ten/
GitHub Inc. (2025). GitHub Webhooks Documentation. https://docs.github.com/en/webhooks
```

---

## 4. Capturas reales que aún tienes que añadir (no las puedo generar yo)

| Captura | De dónde sacarla | Sección destino | Caption sugerido |
|---|---|---|---|
| Historial de commits | `github.com/<tu-repo>/graphs/commit-activity` | 6.1 | Figura 6.2 — Historial de commits durante el desarrollo |
| Login Oh-Nails | Navegador en tu app productiva | 7.1 | Figura 7.1 — Pantalla de login (tenant Oh-Nails) |
| Dashboard Oh-Nails | Navegador productivo | 7.1 | Figura 7.2 — Dashboard tenant Oh-Nails |
| Dashboard El Gallo Azul | Navegador productivo | 7.1 | Figura 7.3 — Dashboard tenant El Gallo Azul |
| Factura PDF generada | Descarga real | 7.1 | Figura 7.4 — Factura emitida por la plataforma |
| Panel Render con health check verde | dashboard.render.com | 6.1 | Figura 6.3 — Servicio activo en Render |
| Panel Vercel deployment | vercel.com/dashboard | 6.1 | Figura 6.4 — Despliegue exitoso en Vercel |
| Panel Supabase con 2 proyectos | app.supabase.com | 4.4 | Figura 4.6 — Dos proyectos Supabase aislados |

---

## 5. Checklist final antes de imprimir/entregar

- [ ] Abrir `TFG_BoutiqueMarket_v3_FINAL.docx` en Word
- [ ] Click derecho sobre el TOC → **Actualizar campos** → Actualizar toda la tabla
- [ ] Verificar que las páginas en el Índice de figuras coincidan con la realidad (ajustar manualmente si hace falta)
- [ ] Reemplazar las 8 capturas reales pendientes (sección 4)
- [ ] Revisar pie de página: "Página X de Y"
- [ ] Exportar a PDF: `Archivo → Exportar → Crear PDF/XPS`
- [ ] Última pasada con corrector ortográfico

---

## 6. Veredicto esperado tras aplicar todo

| Versión | Nota |
|---|---|
| PDF actual (`ultimos cambios.pdf`) | 7.8 / 10 |
| v3 + 5 diagramas críticos | **9.2 / 10** |
| v3 + 5 diagramas + 8 capturas reales + bibliografía corregida | **9.7 / 10** |
| Todo lo anterior + tests automatizados (líneas futuras parcialmente cumplidas) | **10 / 10** |
