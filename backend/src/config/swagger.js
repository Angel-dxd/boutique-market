/**
 * config/swagger.js
 * Especificación OpenAPI 3.0 para la API REST de Boutique Market.
 * Accesible en /api/docs cuando el servidor está en ejecución.
 *
 * Cubre todos los módulos: Auth, Inventario, Proveedores, Clientes,
 * Facturas, Finanzas, Calendario, Galería, Estadísticas y Mensajes.
 */

const openApiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Boutique Market API',
        version: '1.0.0',
        description: `
## Sistema de Gestión Multitenant Cloud-Native

API REST para la gestión de dos negocios familiares:
- **Oh-Nails** (\`tenant: market\`) — Salón de manicura: citas, clientes, finanzas, galería.
- **El Gallo Azul** (\`tenant: santi\`) — Pollería: inventario, proveedores, pedidos.

### Autenticación
Todas las rutas protegidas requieren:
1. Un token **JWT Bearer** en la cabecera \`Authorization\`.
2. La cabecera \`x-tenant-id\` con el valor \`market\` o \`santi\`.

El tenant del token debe coincidir con el header. En caso contrario se devuelve \`403 Forbidden\`.

### Rate Limiting
- \`/api/auth\`: máximo **10 peticiones** por IP cada 15 minutos.
- Resto de la API: máximo **200 peticiones** por IP cada 15 minutos.
        `,
        contact: {
            name: 'Ángel Xavier',
            url: 'https://github.com/Angel-dxd/boutique-market'
        },
        license: {
            name: 'MIT'
        }
    },
    servers: [
        {
            url: 'https://boutique-market-api.onrender.com',
            description: 'Producción (Render)'
        },
        {
            url: 'http://localhost:3000',
            description: 'Desarrollo local'
        }
    ],
    tags: [
        { name: 'Auth', description: 'Autenticación y gestión de usuarios' },
        { name: 'Inventario', description: 'Productos, stock y caducidades (El Gallo Azul)' },
        { name: 'Proveedores', description: 'Gestión de proveedores (El Gallo Azul)' },
        { name: 'Pedidos', description: 'Órdenes de compra a proveedores (El Gallo Azul)' },
        { name: 'Clientes', description: 'Cartera de clientas (Oh-Nails)' },
        { name: 'Facturas', description: 'Facturación y tickets (Oh-Nails)' },
        { name: 'Finanzas', description: 'Ingresos, gastos y rentabilidad (Oh-Nails)' },
        { name: 'Calendario', description: 'Gestión de citas (Oh-Nails)' },
        { name: 'Galería', description: 'Portfolio de trabajos (Oh-Nails)' },
        { name: 'Estadísticas', description: 'KPIs y métricas del dashboard' },
        { name: 'Mensajes', description: 'Sistema de mensajería interna' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Token JWT obtenido en POST /api/auth/login'
            },
            tenantHeader: {
                type: 'apiKey',
                in: 'header',
                name: 'x-tenant-id',
                description: 'Identificador del tenant: `market` (Oh-Nails) o `santi` (El Gallo Azul)'
            }
        },
        schemas: {
            SuccessResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Operación realizada con éxito' }
                }
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    errors: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['El campo es obligatorio']
                    }
                }
            },
            LoginRequest: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                    username: { type: 'string', example: 'admin' },
                    password: { type: 'string', format: 'password', example: 'Password1' }
                }
            },
            LoginResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    token: { type: 'string', description: 'JWT válido por 12h por defecto' },
                    user: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer', example: 1 },
                            username: { type: 'string', example: 'admin' },
                            tenant: { type: 'string', example: 'market' }
                        }
                    }
                }
            },
            Product: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    title: { type: 'string', example: 'Pechuga de pollo' },
                    price: { type: 'number', format: 'float', example: 5.99 },
                    cost: { type: 'number', format: 'float', example: 3.50 },
                    stock: { type: 'integer', example: 100 },
                    min_stock: { type: 'integer', example: 10 },
                    category: { type: 'string', example: 'Aves' },
                    provider_id: { type: 'integer', nullable: true, example: 2 },
                    expiration_date: { type: 'string', format: 'date', nullable: true, example: '2026-12-31' }
                }
            },
            ProductInput: {
                type: 'object',
                required: ['title', 'price'],
                properties: {
                    title: { type: 'string', minLength: 2, example: 'Pechuga de pollo' },
                    price: { type: 'number', minimum: 0, example: 5.99 },
                    cost: { type: 'number', minimum: 0, example: 3.50 },
                    stock: { type: 'integer', minimum: 0, example: 100 },
                    min_stock: { type: 'integer', minimum: 0, example: 10 },
                    category: { type: 'string', example: 'Aves' },
                    provider_id: { type: 'integer', nullable: true, example: 2 },
                    expiration_date: { type: 'string', format: 'date', nullable: true }
                }
            },
            Client: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'María García' },
                    phone: { type: 'string', nullable: true, example: '612345678' },
                    email: { type: 'string', nullable: true, example: 'maria@example.com' },
                    notes: { type: 'string', nullable: true, example: 'Clienta VIP' },
                    created_at: { type: 'string', format: 'date-time' }
                }
            },
            Provider: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'Distribuidora García' },
                    contact_person: { type: 'string', nullable: true },
                    phone: { type: 'string', nullable: true },
                    email: { type: 'string', nullable: true },
                    notes: { type: 'string', nullable: true }
                }
            },
            Appointment: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    client_id: { type: 'integer', example: 3 },
                    client_name: { type: 'string', example: 'María García' },
                    date: { type: 'string', format: 'date', example: '2026-06-01' },
                    time: { type: 'string', example: '10:30' },
                    service: { type: 'string', example: 'Manicura gel' },
                    price: { type: 'number', example: 35.00 },
                    notes: { type: 'string', nullable: true }
                }
            },
            DashboardStats: {
                type: 'object',
                properties: {
                    total_revenue: { type: 'number', example: 4580.00 },
                    total_expenses: { type: 'number', example: 1230.50 },
                    net_profit: { type: 'number', example: 3349.50 },
                    low_stock_count: { type: 'integer', example: 3 },
                    inactive_clients_count: { type: 'integer', example: 7 },
                    appointments_this_month: { type: 'integer', example: 42 }
                }
            }
        }
    },
    security: [
        { bearerAuth: [], tenantHeader: [] }
    ],
    paths: {
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Iniciar sesión',
                description: 'Autentica al usuario y devuelve un token JWT. Limitado a 10 intentos por IP cada 15 minutos.',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginRequest' }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Login correcto',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } }
                    },
                    400: { description: 'Datos de entrada inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    401: { description: 'Credenciales incorrectas', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    429: { description: 'Demasiados intentos — rate limit alcanzado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Registrar usuario',
                description: 'Crea un nuevo usuario. En producción requiere autenticación previa del mismo tenant (excepto bootstrap del primer usuario).',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['username', 'password'],
                                properties: {
                                    username: { type: 'string', minLength: 3, maxLength: 50, example: 'newuser' },
                                    password: { type: 'string', minLength: 8, example: 'Password1' },
                                    email: { type: 'string', format: 'email', nullable: true }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Usuario creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
                    400: { description: 'Validación fallida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    403: { description: 'Registro deshabilitado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/auth/change-password': {
            put: {
                tags: ['Auth'],
                summary: 'Cambiar contraseña',
                description: 'Cambia la contraseña del usuario autenticado. Requiere JWT válido.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['currentPassword', 'newPassword'],
                                properties: {
                                    currentPassword: { type: 'string', format: 'password' },
                                    newPassword: { type: 'string', format: 'password', minLength: 8 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Contraseña actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
                    401: { description: 'Contraseña actual incorrecta o no autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/products': {
            get: {
                tags: ['Inventario'],
                summary: 'Listar productos',
                description: 'Devuelve todos los productos del tenant. Opcionalmente filtra por categoría.',
                parameters: [
                    { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filtrar por categoría' },
                    { name: 'low_stock', in: 'query', schema: { type: 'boolean' }, description: 'Solo productos con stock por debajo del mínimo' }
                ],
                responses: {
                    200: {
                        description: 'Lista de productos',
                        content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } }
                    },
                    401: { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            post: {
                tags: ['Inventario'],
                summary: 'Crear producto',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } }
                },
                responses: {
                    201: { description: 'Producto creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
                    400: { description: 'Validación fallida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/products/{id}': {
            put: {
                tags: ['Inventario'],
                summary: 'Actualizar producto',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } }
                },
                responses: {
                    200: { description: 'Producto actualizado' },
                    404: { description: 'Producto no encontrado' }
                }
            },
            delete: {
                tags: ['Inventario'],
                summary: 'Eliminar producto',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Producto eliminado' },
                    404: { description: 'Producto no encontrado' }
                }
            }
        },
        '/api/products/{id}/stock': {
            patch: {
                tags: ['Inventario'],
                summary: 'Actualizar stock',
                description: 'Actualización parcial del stock de un producto.',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['stock'],
                                properties: { stock: { type: 'integer', minimum: 0, example: 50 } }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Stock actualizado' },
                    400: { description: 'Valor de stock inválido' }
                }
            }
        },
        '/api/providers': {
            get: {
                tags: ['Proveedores'],
                summary: 'Listar proveedores',
                responses: {
                    200: {
                        description: 'Lista de proveedores',
                        content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Provider' } } } }
                    }
                }
            },
            post: {
                tags: ['Proveedores'],
                summary: 'Crear proveedor',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Provider' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Proveedor creado' }
                }
            }
        },
        '/api/clients': {
            get: {
                tags: ['Clientes'],
                summary: 'Listar clientes',
                description: 'Devuelve la cartera de clientes del tenant. Los emails se devuelven desencriptados.',
                responses: {
                    200: {
                        description: 'Lista de clientes',
                        content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Client' } } } }
                    }
                }
            },
            post: {
                tags: ['Clientes'],
                summary: 'Crear cliente',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name'],
                                properties: {
                                    name: { type: 'string', minLength: 2, maxLength: 100 },
                                    phone: { type: 'string', nullable: true },
                                    email: { type: 'string', format: 'email', nullable: true },
                                    notes: { type: 'string', maxLength: 500, nullable: true }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Cliente creado' },
                    409: { description: 'Cliente duplicado (posible)' }
                }
            }
        },
        '/api/calendar/appointments': {
            get: {
                tags: ['Calendario'],
                summary: 'Listar citas',
                parameters: [
                    { name: 'month', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 12 }, description: 'Mes (1-12)' },
                    { name: 'year', in: 'query', schema: { type: 'integer' }, description: 'Año' }
                ],
                responses: {
                    200: {
                        description: 'Lista de citas',
                        content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Appointment' } } } }
                    }
                }
            },
            post: {
                tags: ['Calendario'],
                summary: 'Crear cita',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Appointment' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Cita creada' }
                }
            }
        },
        '/api/dashboard/stats': {
            get: {
                tags: ['Estadísticas'],
                summary: 'KPIs del dashboard',
                description: 'Devuelve las métricas clave del negocio: rentabilidad, stock crítico, clientes inactivos y citas del mes.',
                responses: {
                    200: {
                        description: 'Estadísticas del negocio',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/DashboardStats' } } }
                    }
                }
            }
        },
        '/api/finance': {
            get: {
                tags: ['Finanzas'],
                summary: 'Listar movimientos financieros',
                parameters: [
                    { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] }, description: 'Filtrar por tipo' },
                    { name: 'month', in: 'query', schema: { type: 'integer' } },
                    { name: 'year', in: 'query', schema: { type: 'integer' } }
                ],
                responses: {
                    200: { description: 'Lista de movimientos' }
                }
            },
            post: {
                tags: ['Finanzas'],
                summary: 'Registrar movimiento financiero',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['type', 'amount', 'description'],
                                properties: {
                                    type: { type: 'string', enum: ['income', 'expense'] },
                                    amount: { type: 'number', minimum: 0 },
                                    description: { type: 'string' },
                                    date: { type: 'string', format: 'date' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Movimiento registrado' }
                }
            }
        },
        '/api/gallery': {
            get: {
                tags: ['Galería'],
                summary: 'Listar imágenes de la galería',
                responses: {
                    200: { description: 'Lista de imágenes' }
                }
            },
            post: {
                tags: ['Galería'],
                summary: 'Subir imagen a la galería',
                description: 'Sube una imagen codificada en Base64.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['image'],
                                properties: {
                                    image: { type: 'string', format: 'byte', description: 'Imagen en Base64' },
                                    caption: { type: 'string', nullable: true }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Imagen subida' }
                }
            }
        },
        '/api/messages': {
            get: {
                tags: ['Mensajes'],
                summary: 'Obtener mensajes internos',
                responses: {
                    200: { description: 'Lista de mensajes' }
                }
            },
            post: {
                tags: ['Mensajes'],
                summary: 'Enviar mensaje',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['content'],
                                properties: {
                                    content: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Mensaje enviado' }
                }
            }
        }
    }
};

module.exports = openApiSpec;
