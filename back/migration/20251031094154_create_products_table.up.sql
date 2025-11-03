-- Up migration
CREATE TABLE products(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    category_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO products (sku, title, price, stock, category_id) VALUES
('FUJI-XH2-1680', 'Fujifilm X-H2 + XF 16-80mm Lens Kit', 2582.81, 10, 1),
('FUJI-XT4-1855', 'Fujifilm X-T4 + XF 18-55mm F/2.8-4 R LM OIS', 2199.00, 8, 1),
('FUJI-XS20-TAMRON1770', 'Fujifilm X-S20 + Tamron 17-70mm F/2.8 Di III-A VC RXD', 1918.00, 12, 2),
('FUJI-S5600', 'Fujifilm FinePix S5600 Bridge Camera', 300.00, 5, 2),
('FUJI-ZOOM100', 'Fuji Zoom Date 100 Compact 35mm Camera', 75.00, 3, 3),
('FUJI-XA1-BODY', 'Fujifilm X-A1 Mirrorless Camera Body', 308.35, 6, 3);
