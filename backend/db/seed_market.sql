-- ============================================================
-- Datos de ejemplo — tenant 'market' (Oh-Nails)
-- 100 % ficticios. Solo para desarrollo local con docker-compose.
-- Las fechas son relativas a CURRENT_DATE para que siempre haya citas actuales.
-- ============================================================

-- Usuario local: arelys / demo1234
INSERT INTO users (username, password, role) VALUES
('arelys', '$2a$10$35oJRw9op5wKXZugp5MbbewCxSpmL7RFJ1pflZ50TcJYO/4VRGw.2', 'user')
ON CONFLICT (username) DO NOTHING;

INSERT INTO clients (name, phone, email, notes, last_visit) VALUES
('Lucía Fernández', '600 000 010', 'lucia@example.com',   'Prefiere tonos nude.', CURRENT_DATE - 2),
('Marta Gómez',     '600 000 011', 'marta@example.com',   NULL,                   CURRENT_DATE - 5),
('Paula Navarro',   '600 000 012', 'paula@example.com',   NULL,                   CURRENT_DATE - 9),
('Elena Ruiz',      '600 000 013', 'elena@example.com',   'Alergia al látex.',    CURRENT_DATE - 12),
('Carmen Ortega',   '600 000 014', 'carmen@example.com',  NULL,                   CURRENT_DATE - 16),
('Sara Molina',     '600 000 015', 'sara@example.com',    NULL,                   CURRENT_DATE - 21),
('Irene Castillo',  '600 000 016', 'irene@example.com',   'Viene cada 3 semanas.', CURRENT_DATE - 27),
('Nuria Vidal',     '600 000 017', 'nuria@example.com',   NULL,                   CURRENT_DATE - 34),
('Raquel Herrera',  '600 000 018', 'raquel@example.com',  NULL,                   CURRENT_DATE - 41),
('Andrea Prieto',   '600 000 019', 'andrea@example.com',  NULL,                   CURRENT_DATE - 48),
('Silvia Romero',   '600 000 020', 'silvia@example.com',  NULL,                   CURRENT_DATE - 63),
('Clara Benítez',   '600 000 021', 'clara@example.com',   NULL,                   CURRENT_DATE - 80);

-- Agenda: dos citas por día durante los últimos 45 días y los próximos 10
INSERT INTO calendar (client, date, description, profit)
SELECT
    (ARRAY['Lucía Fernández','Marta Gómez','Paula Navarro','Elena Ruiz','Carmen Ortega','Sara Molina',
           'Irene Castillo','Nuria Vidal','Raquel Herrera','Andrea Prieto','Silvia Romero','Clara Benítez'])[1 + (((d + 60) * 5 + slot) % 12)],
    CURRENT_DATE + d,
    (ARRAY['09:30','10:30','11:30','12:30','16:00','17:00','18:00'])[1 + ((d + 50 + slot * 3) % 7)],
    (ARRAY[25, 45, 35, 30, 40, 32])[1 + ((d + 50 + slot) % 6)]
FROM generate_series(-45, 10) AS d
CROSS JOIN generate_series(0, 1) AS slot
WHERE EXTRACT(DOW FROM CURRENT_DATE + d) <> 0;

INSERT INTO finance (amount, type, category, date)
SELECT 420 + (w * 37) % 160, 'income', 'Servicios', CURRENT_DATE - w * 7 FROM generate_series(0, 9) AS w;
INSERT INTO finance (amount, type, category, date)
SELECT 60 + (w * 13) % 50, 'expense', 'Material', CURRENT_DATE - w * 7 - 2 FROM generate_series(0, 9, 2) AS w;
INSERT INTO finance (amount, type, category, date)
SELECT 450, 'expense', 'Alquiler', CURRENT_DATE - w * 7 - 4 FROM generate_series(0, 9, 4) AS w;

INSERT INTO gallery (title, category, image, client_id) VALUES
('Francesa clásica', 'Manicura',       NULL, 1),
('Baby boomer',      'Esculpidas',     NULL, 2),
('Mármol blanco',    'Nail art',       NULL, 3),
('Degradado coral',  'Semipermanente', NULL, 4);
