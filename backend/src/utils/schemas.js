/**
 * utils/schemas.js
 * Definición de esquemas de validación con Zod para toda la API.
 */
const { z } = require('zod');

/**
 * Esquema para Productos (Inventario)
 */
const productSchema = z.object({
    title: z.string({ required_error: 'El título es obligatorio' })
        .min(2, 'El título debe tener al menos 2 caracteres')
        .trim(),
    price: z.number({ required_error: 'El precio es obligatorio', invalid_type_error: 'El precio debe ser un número' })
        .min(0, 'El precio no puede ser negativo'),
    cost: z.number({ invalid_type_error: 'El coste debe ser un número' }).min(0).optional().default(0),
    stock: z.number({ invalid_type_error: 'El stock debe ser un número entero' }).int().min(0).optional().default(0),
    min_stock: z.number({ invalid_type_error: 'El stock mínimo debe ser entero' }).int().min(0).optional().default(5),
    category: z.string().optional().default('General'),
    provider_id: z.number().int().positive().nullable().optional(),
    expiration_date: z.string().nullable().optional().transform(val => (val === '' ? null : val))
});

/**
 * Esquema para actualización parcial de Stock
 */
const stockUpdateSchema = z.object({
    stock: z.number({ required_error: 'El stock es obligatorio', invalid_type_error: 'El stock debe ser numérico' })
        .int('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo')
});

/**
 * Esquema para Autenticación (Login y Registro)
 */
const authLoginSchema = z.object({
    username: z.string({ required_error: 'El nombre de usuario es obligatorio' }).trim(),
    password: z.string({ required_error: 'La contraseña es obligatoria' })
});

const authRegisterSchema = z.object({
    username: z.string({ required_error: 'El nombre de usuario es obligatorio' }).trim().min(3).max(50),
    password: z.string({ required_error: 'La contraseña es obligatoria' })
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(100)
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
        .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
    email: z.string().trim().email('El email no tiene un formato válido').optional().nullable()
});

const changePasswordSchema = z.object({
    currentPassword: z.string({ required_error: 'La contraseña actual es obligatoria' }),
    newPassword: z.string({ required_error: 'La nueva contraseña es obligatoria' })
        .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
        .max(100)
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
        .regex(/[0-9]/, 'La nueva contraseña debe contener al menos un número')
});

/**
 * Esquema para Clientes (Boutique)
 */
const clientSchema = z.object({
    name: z.string({ required_error: 'El nombre del cliente es obligatorio' })
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede superar los 100 caracteres')
        .trim(),
    phone: z.string()
        .trim()
        .regex(/^[0-9+\s\-().]{9,20}$/, 'El teléfono debe tener un formato válido (mínimo 9 caracteres numéricos)')
        .nullable()
        .optional()
        .transform(val => (val === '' ? null : val)), // Convert empty string to null
    email: z.string()
        .trim()
        .email('El email no tiene un formato válido')
        .max(150, 'El email no puede superar los 150 caracteres')
        .nullable()
        .optional()
        .transform(val => (val === '' ? null : val)), // Convert empty string to null
    notes: z.string()
        .max(500, 'Las notas no pueden superar los 500 caracteres')
        .nullable()
        .optional()
        .transform(val => (val === '' ? null : val)),
    force: z.boolean().optional()
});

module.exports = {
    productSchema,
    stockUpdateSchema,
    authRegisterSchema,
    authLoginSchema,
    changePasswordSchema,
    clientSchema
};

