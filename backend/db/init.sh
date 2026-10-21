#!/bin/sh
# Inicializa el Postgres local de docker-compose con una base de datos por tenant,
# igual que en producción (Supabase): mismo esquema, datos totalmente aislados.
# Solo se ejecuta la primera vez que se crea el volumen de datos.
set -e

for tenant in market santi; do
    echo "→ Creando base de datos '$tenant'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -c "CREATE DATABASE $tenant;"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$tenant" -f /seed/schema_postgres.sql
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$tenant" -f "/seed/seed_$tenant.sql"
done
