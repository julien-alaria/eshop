-- Up migration
-- seed_retro_games.up.sql

DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM product_categories;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM customers;

DELETE FROM sqlite_sequence WHERE name IN ('products','categories','customers','orders','order_items','product_categories');

-- Catégories
INSERT INTO categories (name) VALUES
('RPG'),
('Action'),
('Plateforme'),
('Puzzle'),
('Shoot’em up');

-- Produits
INSERT INTO products (sku, title, price, stock) VALUES
('NES-RPG-001', 'Dragon Quest I', 29.99, 10),
('NES-RPG-002', 'Final Fantasy I', 34.99, 8),
('NES-ACT-001', 'Ninja Gaiden', 24.99, 15),
('NES-PLT-001', 'Super Mario Bros', 19.99, 20),
('NES-PLT-002', 'Mega Man 2', 22.50, 12),
('SNES-RPG-001', 'Chrono Trigger', 49.99, 5),
('SNES-ACT-001', 'Contra III', 29.99, 7),
('SNES-PUZ-001', 'Tetris Attack', 14.99, 10),
('SNES-SH-001', 'Gradius III', 27.50, 6);

-- Associations produits/catégories
INSERT INTO product_categories (product_id, category_id) VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 3),
(5, 3),
(6, 1),
(7, 2),
(8, 4),
(9, 5);

-- Clients
INSERT INTO customers (email, name) VALUES
('akira@example.com', 'Akira Yamada'),
('sakura@example.com', 'Sakura Tanaka'),
('kenji@example.com', 'Kenji Nakamura');

-- Commandes
INSERT INTO orders (customer_id, status, total) VALUES
(1, 'paid', 54.98),
(2, 'pending', 22.50),
(3, 'cancelled', 29.99);

-- Détails de commande
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 29.99),
(1, 4, 1, 24.99),
(2, 5, 1, 22.50),
(3, 3, 1, 29.99);
