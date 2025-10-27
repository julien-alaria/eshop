-- Up migration
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (sku, title, price, stock) VALUES ("123456789123", "produit1", 150, 5);