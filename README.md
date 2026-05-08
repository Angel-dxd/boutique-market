# 🧾 Boutique Market — Sistema de Gestión Multitenant Cloud-Native

> **Trabajo de Fin de Grado · Desarrollo de Aplicaciones Multiplataforma (DAM)**
> Plataforma web integral para la gestión de dos negocios familiares reales, construida con arquitectura **Serverless / Cloud-First** utilizando Node.js, PostgreSQL (Supabase) y Vercel.

---

## 📖 ¿Qué es este proyecto?

**Boutique Market** es una aplicación web full-stack diseñada para digitalizar la gestión de dos negocios familiares independientes: **Oh-Nails** (Salón de manicura) y **El Gallo Azul** (Pollería).

El sistema utiliza una arquitectura **Multitenant**, donde un único despliegue sirve a ambos negocios manteniendo sus datos completamente aislados en bases de datos PostgreSQL independientes alojadas en la nube.

---

## 🏗️ Arquitectura técnica (Cloud Stack)

| Capa | Tecnología | Plataforma |
|---|---|---|
| **Frontend** | Vanilla JS (ES6+) + Tailwind CSS | **Vercel** (Despliegue Continuo) |
| **Backend** | Node.js + Express.js | **Render** (Web Service) |
| **Base de Datos** | PostgreSQL (Multitenant) | **Supabase** (Managed Cloud) |
| **Seguridad** | JWT + AES-256-CBC + Bcrypt | — |

---

## 🏢 Los dos negocios

- **Oh-Nails (Tenant: `market`)**: Gestión de citas, cartera de clientas recurrentes, finanzas y galería de trabajos.
- **El Gallo Azul (Tenant: `santi`)**: Gestión de inventario con alertas de stock, proveedores y pedidos de compra.

---

## 🔒 Seguridad de Nivel Industrial

- **Autenticación**: JWT (JSON Web Tokens) verificados por middleware en cada petición.
- **Cifrado de Datos**: Los correos electrónicos y datos sensibles se almacenan cifrados con **AES-256-CBC** en la base de datos.
- **Seguridad Multitenant**: Aislamiento garantizado mediante `AsyncLocalStorage` de Node.js, propagando el contexto del tenant de forma segura sin variables globales.
- **Protección de Cabeceras**: Implementación de **Helmet.js** para prevenir ataques comunes como XSS y Clickjacking.

---

## 🚀 Instalación y Desarrollo Local

### Requisitos previos

- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)

### Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Angel-dxd/boutique-market.git
   cd boutique-market
   ```

2. **Instalar dependencias:**
   ```bash
   cd backend && npm install
   ```

3. **Configurar Variables de Entorno:**
   Copia el archivo `backend/.env.example` a `backend/.env` y rellena las credenciales de tus proyectos de **Supabase**.

4. **Inicializar Base de Datos:**
   Ejecuta el contenido de `backend/schema_postgres.sql` en el SQL Editor de tu Dashboard de Supabase.

5. **Lanzar en local:**
   ```bash
   # Backend
   cd backend && npm run dev
   # Frontend
   # Abre el archivo frontend/index.html o usa un servidor estático (Live Server)
   ```

---

## 📈 KPIs y Dashboard

El sistema incluye un módulo de estadísticas que calcula automáticamente:
- **Rentabilidad**: Comparativa de ingresos vs gastos en tiempo real.
- **Stock Crítico**: Alertas automáticas cuando un producto baja del mínimo establecido.
- **Fidelización**: Identificación de clientas que no han visitado el salón en los últimos 30 días.

---

*Desarrollado por [Ángel Xavier](https://github.com/Angel-dxd) · 2026*