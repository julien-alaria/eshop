-- Up migration
CREATE TABLE orders(
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN('pending', 'paid', 'refunded', 'cancelled')),
    total REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
