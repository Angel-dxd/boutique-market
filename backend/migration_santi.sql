SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;
SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'e9e78ad4-171f-11f1-b0a2-a75ee150eba9:1-251';
INSERT INTO `inventory` (`id`, `title`, `price`, `cost`, `stock`, `min_stock`, `category`, `provider_id`, `created_at`) VALUES (1,'pollo entero',5.50,4.00,100,80,'General',1,'2026-04-23 03:26:20');
INSERT INTO `invoices` (`id`, `provider_id`, `amount`, `reference`, `date`, `created_at`, `status`, `tax_included`, `tax_amount`) VALUES (1,1,99.00,'12345678','2026-04-23','2026-04-23 02:14:45','pending',1,0.00),(3,2,5809.69,'26G10004618','2026-05-05','2026-05-06 19:42:37','paid',1,0.00),(7,3,5095.46,'104254','2025-11-17','2026-05-07 17:27:23','pending',1,0.00);
INSERT INTO `providers` (`id`, `name`, `phone`, `company`, `category`, `created_at`) VALUES (1,'Angel xavier Pons marquez','640105492','angeles S.L','Suministros','2026-04-23 02:14:31'),(2,'Coren',NULL,'Coren pollos','Producto','2026-05-01 15:38:14'),(3,'Moreno Ruiz',NULL,NULL,'Suministros','2026-05-07 14:07:22');
INSERT INTO `users` (`id`, `username`, `password`, `email`, `role`, `created_at`) VALUES (1,'arelys','$2b$12$2lIjYgNsl4latKRXFP.Acu1vsCWAzCm0ymKo6GZ8juh4Vi8V8NQZi','cbc4256c5e85771dc9262c7d65e9a768:c9825497e5aa3a99b65ba7549dcc3773','user','2026-04-22 16:59:13'),(2,'santi','$2b$10$8TVym/DkSorYuFm/6toE2uPmYlaiNwgpfruHfu0My8nFaQbWeLZLO','d20ed801b948493263bb7a63a95d378f:1a92d076765dade899eee831045f2294cb499d488768a9721aec7ebbe2c46bb1','user','2026-05-06 19:19:10');
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
