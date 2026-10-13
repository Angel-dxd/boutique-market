# PROYECTO ARIEL

## Borrador de requisitos funcionales

### 1. Objetivo general

ARIEL será una aplicación de gestión que permita al usuario controlar y consultar de forma centralizada diferentes aspectos de su actividad, principalmente:

* Pedidos.
* Inventario.
* Proveedores.
* Gastos.
* Rendimiento económico.
* Información personal y profesional.

La aplicación deberá mostrar la información de forma sencilla y visual, permitiendo al usuario introducir datos y obtener automáticamente cálculos y estadísticas a partir de ellos.

---

# 2. Inicio / Dashboard

La pantalla principal será el **Inicio** de la aplicación.

Su objetivo será proporcionar una visión general de la situación actual.

Deberá mostrar información resumida como:

* Rendimiento actual.
* Ingresos.
* Gastos.
* Beneficio bruto.
* Porcentaje de beneficio.
* Pedidos pendientes o recientes.
* Estado del inventario.
* Información relevante de proveedores.

La información deberá poder visualizarse mediante tarjetas, indicadores y gráficos para que el usuario pueda entender rápidamente la situación.

### Ejemplo

Si el usuario registra:

* Ingresos: 5.000 €
* Gastos: 1.000 €

La aplicación podría calcular automáticamente:

**Beneficio bruto = 4.000 €**

Y mostrar también el porcentaje correspondiente:

**Margen = 80 %**

Los valores deberán calcularse automáticamente a partir de los datos registrados, evitando que el usuario tenga que hacer los cálculos manualmente.

---

# 3. Rendimiento

La sección **Rendimiento** permitirá analizar económicamente la actividad.

Deberá permitir registrar y consultar:

### Ingresos

Dinero generado durante un determinado periodo.

### Gastos

Dinero utilizado en diferentes conceptos.

Por ejemplo:

* Alimentación.
* Despensa.
* Transporte.
* Material.
* Proveedores.
* Otros gastos.

Los gastos deberán poder desglosarse por categorías.

### Ejemplo

Despensa:

* Compra 1: 500 €
* Compra 2: 300 €
* Compra 3: 200 €

**Total despensa: 1.000 €**

La aplicación deberá calcular automáticamente los totales.

---

# 4. Cálculos económicos

La aplicación deberá realizar automáticamente diferentes cálculos.

Por ejemplo:

### Ingresos totales

`Ingresos = suma de todos los ingresos`

### Gastos totales

`Gastos = suma de todos los gastos`

### Beneficio bruto

`Beneficio bruto = ingresos - gastos`

### Porcentaje / margen

`Margen (%) = (beneficio bruto / ingresos) × 100`

Estos valores deberán actualizarse automáticamente cuando el usuario añada, modifique o elimine información.

---

# 5. Gastos

La sección de gastos permitirá registrar cada gasto individual.

Cada gasto podría contener:

* Concepto.
* Categoría.
* Importe.
* Fecha.
* Descripción.
* Proveedor, si corresponde.

El usuario podrá consultar posteriormente cuánto dinero ha gastado y en qué.

También sería interesante poder filtrar los gastos por:

* Fecha.
* Categoría.
* Proveedor.
* Periodo.

---

# 6. Pedidos

La sección **Pedidos** permitirá gestionar los pedidos realizados o recibidos.

Cada pedido podrá contener información como:

* Número o identificador.
* Proveedor.
* Fecha.
* Productos.
* Cantidades.
* Precio.
* Importe total.
* Estado.

Estados posibles:

* Pendiente.
* En proceso.
* Recibido.
* Cancelado.

El sistema deberá calcular automáticamente el importe total del pedido.

---

# 7. Inventario

La sección **Inventario** permitirá controlar los productos o recursos disponibles.

Cada elemento del inventario podrá tener:

* Nombre.
* Categoría.
* Cantidad disponible.
* Precio.
* Proveedor.
* Stock mínimo.
* Fecha de actualización.

El sistema podrá avisar cuando un producto tenga poco stock.

### Ejemplo

**Producto:** Producto A
**Stock actual:** 5
**Stock mínimo:** 10

→ Mostrar advertencia de **stock bajo**.

El inventario podrá estar relacionado con los pedidos y proveedores.

---

# 8. Proveedores

La sección **Proveedores** permitirá almacenar y gestionar la información de los proveedores.

Cada proveedor podrá contener:

* Nombre.
* Empresa.
* Teléfono.
* Correo electrónico.
* Dirección.
* Productos suministrados.
* Historial de pedidos.

Desde un proveedor se podría consultar qué pedidos se han realizado y cuánto dinero se ha gastado con él.

---

# 9. Información personal

La aplicación también contará con un apartado de **Información personal** del usuario.

Esta sección permitirá consultar y modificar sus datos personales y profesionales.

### Datos personales

* Nombre.
* Fecha de nacimiento.
* Sexo.
* Dirección.

### Información profesional

* Profesión.
* Ámbito profesional.
* Información relacionada con su actividad.

La información estará asociada exclusivamente al usuario principal de ARIEL.

---

# 10. Dirección

Dentro de la información personal se podrá almacenar la dirección del usuario.

Podrá incluir:

* Calle.
* Número.
* Ciudad.
* Provincia/Estado.
* Código postal.
* País.

---

# 11. Idiomas

La aplicación deberá permitir cambiar el idioma de la interfaz.

Idiomas iniciales:

* 🇪🇸 Español.
* 🇧🇷 Portugués brasileño.
* 🇬🇧 Inglés.

El cambio de idioma deberá afectar a los textos de la interfaz, botones, menús, mensajes y etiquetas.

El usuario podrá cambiar de idioma mediante un selector visible en la aplicación.

---

# 12. Relaciones entre módulos

Los diferentes módulos deberán estar conectados entre sí.

Por ejemplo:

**Proveedor**
↓
**Pedido**
↓
**Inventario**
↓
**Gasto**
↓
**Rendimiento**

Esto permitirá que la información introducida una sola vez pueda utilizarse en diferentes partes de la aplicación.

Por ejemplo, cuando se registre un pedido a un proveedor:

* El pedido quedará guardado.
* Se registrará su importe.
* Podrá reflejarse como gasto.
* El inventario podrá actualizarse cuando el pedido sea recibido.
* El rendimiento económico podrá actualizarse automáticamente.

---

# 13. Objetivo de la experiencia de usuario

La aplicación deberá ser sencilla y clara.

El usuario debería poder entrar y entender rápidamente:

**¿Cuánto tengo?**
**¿Cuánto he gastado?**
**¿Cuánto estoy ganando?**
**¿Qué tengo en inventario?**
**¿Qué pedidos tengo?**
**¿Con qué proveedores trabajo?**

El dashboard será el punto central desde el que podrá acceder a cada módulo.

---

# 14. Prioridad del proyecto

La primera versión deberá centrarse en las funcionalidades fundamentales:

### Prioridad alta

* Login / usuario.
* Dashboard.
* Ingresos.
* Gastos.
* Cálculo de rendimiento.
* Pedidos.
* Inventario.
* Proveedores.
* Información personal.
* Cambio de idioma.

### Prioridad media

* Gráficos.
* Filtros.
* Alertas de stock.
* Historial.
* Relación entre pedidos, gastos e inventario.

### Prioridad futura

* Funcionalidades avanzadas de análisis.
* Estadísticas más avanzadas.
* Automatizaciones.
* Exportación de información.
* Informes.

La aplicación deberá empezar con una base funcional y estable antes de añadir funcionalidades avanzadas.
