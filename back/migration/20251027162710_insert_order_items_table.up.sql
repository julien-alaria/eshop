-- Up migration
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 2582.81), -- Alice bought X-H2 Kit
(2, 2, 1, 2199.00), -- Juan pending X-T4 Kit
(3, 3, 1, 1918.00), -- Emily bought X-S20 Kit
(4, 4, 1, 300.00),  -- Marco refunded FinePix S5600
(5, 5, 1, 75.00);   -- Sophie cancelled Zoom Date 100
