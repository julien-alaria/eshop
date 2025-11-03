-- Up migration
CREATE TABLE customers(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO customers (email, name) VALUES
('alice.martin@example.fr', 'Alice Martin'),
('juan.gomez@example.es', 'Juan Gómez'),
('emily.chen@example.com', 'Emily Chen'),
('marco.rossi@example.it', 'Marco Rossi'),
('sophie.dubois@example.fr', 'Sophie Dubois');