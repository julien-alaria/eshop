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

📦 Gestion des Commandes
Description

Ce projet est une application web de gestion des commandes. Il permet de :

Visualiser la liste des commandes

Ajouter une nouvelle commande (sélection client/produit, quantité, statut)

Supprimer une commande

Rechercher une commande

Pagination automatique

Thème clair / sombre

Le projet utilise HTML, JavaScript (module ES6) et consomme une API REST pour gérer les données de commandes, clients et produits.

📂 Structure du projet
/project-root
│
├─ index.html                 # Page principale pour gérer les commandes
├─ style.css                  # Styles de l'application
├─ orders.html                # Page spécifique pour la gestion des commandes
├─ script_orders.js           # Script JS pour orders.html
├─ scripts-base.js            # Contient la constante API_BASE
└─ README.md                  # Ce fichier

⚙️ Fonctionnalités
1. Liste des commandes

Affiche toutes les commandes depuis l’API.

Pagination configurable (ordersPerPage dans script_orders.js).

Mise en cache pour accélérer la recherche et le rendu.

2. Ajout de commande

Formulaire permettant de sélectionner le client et le produit.

Calcul automatique du total en fonction de la quantité et du prix unitaire.

Envoi des données à l’API pour création.

3. Suppression de commande

Bouton “Supprimer” pour chaque commande.

Confirmation avant suppression.

Rafraîchissement automatique de la liste.

4. Recherche

Recherche instantanée par :

ID de commande

ID client

Statut

Total

5. Thème clair / sombre

Bouton “🌓 Thème” pour basculer entre clair et sombre.

Thème sauvegardé dans localStorage.

🔧 Installation

Cloner le projet :

git clone <url-du-projet>


Ouvrir le projet dans un serveur local (ex: VSCode Live Server)

Les modules ES6 nécessitent un serveur local ou distant pour fonctionner correctement.

Assurer que le fichier scripts-base.js contient l’URL de votre API :

export const API_BASE = "https://votre-api.com";


Ouvrir orders.html dans le navigateur pour accéder à l’interface.

🖥️ Utilisation

Ajouter une commande

Sélectionner un client

Sélectionner un produit

Indiquer la quantité

Sélectionner le statut

Cliquer sur "Ajouter Commande"

Rechercher une commande

Taper dans la barre de recherche.

La liste se filtre automatiquement.

Supprimer une commande

Cliquer sur le bouton “Supprimer” à côté de la commande.

Confirmer la suppression.

Changer le thème

Cliquer sur le bouton “🌓 Thème” pour passer du clair au sombre.

📌 Dépendances

Navigateur moderne supportant ES6 Modules

API REST compatible avec les routes suivantes :

/orders.list → Liste des commandes

/orders.create → Création d’une commande

/orders.delete → Suppression d’une commande

/product.index → Liste des produits

/customer.index → Liste des clients

🛠️ Personnalisation

ordersPerPage dans script_orders.js pour changer le nombre de commandes affichées par page.

Styles personnalisables dans style.css.

Messages et alertes modifiables dans la fonction toast().

📈 Améliorations possibles

Édition inline des commandes

Filtrage par date ou montant

Ajout de graphiques pour visualiser les ventes

Support multi-utilisateurs avec authentification
