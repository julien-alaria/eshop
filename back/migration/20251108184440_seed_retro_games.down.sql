-- Down migration
-- seed_retro_games.down.sql
-- -------------------------
-- Suppression de toutes les données insérées par le seed rétro
-- -------------------------

DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM product_categories;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM customers;

-- Réinitialisation des séquences SQLite
DELETE FROM sqlite_sequence WHERE name IN (
  'products',
  'categories',
  'customers',
  'orders',
  'order_items',
  'product_categories'
);

