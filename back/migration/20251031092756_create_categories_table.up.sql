-- Up migration
CREATE TABLE categories(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

INSERT INTO categories (name) VALUES
('Camera'),
('Lens'),
('Kit');
