-- 1. FACTURAS -> INVOICES
ALTER TABLE facturas 
ADD COLUMN proveedor_id INT, 
ADD COLUMN referencia VARCHAR(255);

RENAME TABLE facturas TO invoices;

ALTER TABLE invoices
CHANGE COLUMN proveedor_id provider_id INT,
CHANGE COLUMN monto amount DECIMAL(10,2) NOT NULL,
CHANGE COLUMN referencia reference VARCHAR(255),
CHANGE COLUMN descripcion description TEXT,
CHANGE COLUMN fecha date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. APPOINTMENTS -> CALENDAR
RENAME TABLE appointments TO calendar;

ALTER TABLE calendar 
CHANGE COLUMN cliente client VARCHAR(255), 
CHANGE COLUMN fecha date TIMESTAMP, 
CHANGE COLUMN descripcion description TEXT, 
CHANGE COLUMN ganancia profit DECIMAL(10,2);

-- 3. FINANZAS -> FINANCE
RENAME TABLE finanzas TO finance;

ALTER TABLE finance 
CHANGE COLUMN monto amount DECIMAL(10,2), 
CHANGE COLUMN tipo type VARCHAR(50), 
CHANGE COLUMN categoria category VARCHAR(255), 
CHANGE COLUMN fecha date TIMESTAMP;

-- 4. PRODUCTOS -> INVENTORY
RENAME TABLE productos TO inventory;

ALTER TABLE inventory 
CHANGE COLUMN categoria category VARCHAR(255), 
CHANGE COLUMN proveedor_id provider_id INT;

-- 5. PROVIDERS
ALTER TABLE providers 
CHANGE COLUMN nombre name VARCHAR(255), 
CHANGE COLUMN telefono phone VARCHAR(50), 
CHANGE COLUMN empresa company VARCHAR(255), 
CHANGE COLUMN categoria category VARCHAR(255);

-- 6. OTRAS CORRECCIONES OPCIONALES SI APLICAN (Clients y Users ya están en Inglés)
