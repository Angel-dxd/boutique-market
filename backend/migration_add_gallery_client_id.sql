-- ============================================================
-- MIGRACIÓN: Añadir columna client_id a la tabla gallery
--
-- INSTRUCCIONES:
--   1. Abre tu proyecto de Supabase → SQL Editor (tenant: market)
--   2. Pega y ejecuta este script completo
--   3. Sin datos en riesgo: IF NOT EXISTS lo hace idempotente
-- ============================================================

-- 1. Añadir la columna (sin errores si ya existe)
ALTER TABLE gallery
    ADD COLUMN IF NOT EXISTS client_id INT DEFAULT NULL;

-- 2. Añadir la clave foránea (solo si no existe ya)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_gallery_client'
          AND table_name = 'gallery'
    ) THEN
        ALTER TABLE gallery
            ADD CONSTRAINT fk_gallery_client
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
    END IF;
END;
$$;

-- 3. Índice para acelerar búsquedas por cliente
CREATE INDEX IF NOT EXISTS idx_gallery_client_id ON gallery(client_id);

-- Verificación rápida
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gallery'
ORDER BY ordinal_position;
