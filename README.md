[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/AuX6kR6R)
# Starter kit de Tonton — Back/Front

## Arborescence

- `back/` : API PHP (PDO + SQLite), CORS `*`, JSON par défaut, migrations via `tonton`.
- `front/` : petit front JS (formulaire + liste), CSS minimal, toggle light/dark (switch animé).

## Lancer le back (PHP intégré)

```bash
php -S localhost:8000 -t public
```

## Utiliser le front

Ouvrez front/index.html dans votre navigateur, ou servez-le avec un serveur statique.
Par défaut, le front appelle :

- http://localhost:8000/?route=notes.index
- http://localhost:8000/?route=notes.create
- http://localhost:8000/?route=notes.edit&id={ID}
- http://localhost:8000/?route=notes.delete&id={ID}&delete=1

Si besoin, modifiez l’URL dans front/assets/script.js (API_BASE).

## Migrations (Tonton)

Depuis back/ :

### Appliquer les migrations en attente

```
php tonton migrate
```

### Créer une migration

```
php tonton make:migration create_notes_table
```

### Rollback (1 ou N)

```bash
php tonton rollback
php tonton rollback 2
```
