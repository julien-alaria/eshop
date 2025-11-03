-- Up migration
INSERT INTO orders (customer_id, status, total) VALUES
(1, 'paid', 2582.81),
(2, 'pending', 2199.00),
(3, 'paid', 1918.00),
(4, 'refunded', 300.00),
(5, 'cancelled', 75.00);


