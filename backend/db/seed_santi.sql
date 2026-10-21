-- ============================================================
-- Datos de ejemplo — tenant 'santi' (El Gallo Azul)
-- 100 % ficticios. Solo para desarrollo local con docker-compose.
-- ============================================================

-- Usuario local: santi / demo1234
INSERT INTO users (username, password, role) VALUES
('santi', '$2a$10$35oJRw9op5wKXZugp5MbbewCxSpmL7RFJ1pflZ50TcJYO/4VRGw.2', 'user')
ON CONFLICT (username) DO NOTHING;

INSERT INTO providers (name, phone, company, category) VALUES
('Avícola del Turia',         '600 000 101', 'Avícola del Turia S.L.', 'Producto'),
('Granja Las Encinas',        '600 000 102', 'Granja Las Encinas',     'Producto'),
('Envases Levante',           '600 000 103', 'Envases Levante S.A.',   'Suministros'),
('Especias del Mediterráneo', '600 000 104', 'Especias Med',           'Producto');

INSERT INTO inventory (title, price, cost, stock, min_stock, category, provider_id, expiration_date) VALUES
('Pollo entero',             5.50, 3.90,  64,  40, 'Aves',        1, CURRENT_DATE + 5),
('Pechuga fileteada',        8.90, 6.20,  18,  25, 'Aves',        1, CURRENT_DATE + 4),
('Muslos de pollo',          4.80, 3.10,  52,  30, 'Aves',        2, CURRENT_DATE + 6),
('Alitas adobadas',          6.20, 4.00,   9,  20, 'Elaborados',  2, CURRENT_DATE + 3),
('Huevos camperos (docena)', 3.20, 2.10, 120,  50, 'Huevos',      2, CURRENT_DATE + 21),
('Hamburguesa de pollo',     7.50, 4.60,  33,  20, 'Elaborados',  1, CURRENT_DATE + 9),
('Pavo en filetes',         10.90, 7.80,  14,  15, 'Aves',        1, CURRENT_DATE + 12),
('Bandejas de envasado',     0.15, 0.06, 900, 300, 'Suministros', 3, NULL),
('Bolsas compostables',      0.08, 0.03, 140, 400, 'Suministros', 3, NULL),
('Adobo casero',             2.50, 1.10,  26,  10, 'Especias',    4, CURRENT_DATE + 60);

INSERT INTO invoices (provider_id, amount, reference, date, status, tax_included, tax_amount) VALUES
(1, 1284.50, 'FAC-2026-0141', CURRENT_DATE - 3,  'pending', TRUE, 128.45),
(2,  860.20, 'GLE-5520',      CURRENT_DATE - 9,  'paid',    TRUE,  86.02),
(3,  214.75, 'ENV-0932',      CURRENT_DATE - 15, 'paid',    TRUE,  21.48),
(1, 1190.00, 'FAC-2026-0127', CURRENT_DATE - 24, 'paid',    TRUE, 119.00),
(4,   96.40, 'ESP-118',       CURRENT_DATE - 31, 'pending', TRUE,   9.64);
