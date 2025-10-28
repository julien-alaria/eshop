-- Down migration
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES 
(2, 1, 1, 549.99);