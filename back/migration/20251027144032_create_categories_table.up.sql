-- Up migration
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT UNIQUE NOT NULL
);

INSERT INTO categories (name) VALUES 
    ("PC"),
    ("CONSOLE"),
    ("ACCESSOIRE");