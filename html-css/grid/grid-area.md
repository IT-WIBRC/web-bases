# 🏗️ Le "Plan d'Architecte" (`grid-template-areas`)

Au lieu de compter les lignes et les colonnes (1, 2, 3...), on donne des **noms** aux zones de notre site (header, footer, main...). On dessine ensuite la grille avec des mots.

Regardez comme c'est parlant dans le code :

```css
.parent {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}
```

C'est presque un dessin ! On voit tout de suite que le header prend toute la largeur du haut.

---

## ⚔️ Le Duel : Flexbox vs Grid

C'est la question que tout le monde se pose. Voici une règle simple pour ne plus jamais hésiter :

| Caractéristique | **Flexbox** (Le Wagon) | **CSS Grid** (L'Échiquier) |
| :--- | :--- | :--- |
| **Dimension** | **1D** (Une ligne OU une colonne) | **2D** (Lignes ET colonnes ensemble) |
| **Usage idéal** | Petits composants (menus, boutons alignés, barres de recherche). | Structure globale de la page (Le Layout complet). |
| **Philosophie** | "Le contenu décide" (les éléments se poussent). | "Le contenant décide" (on crée des cases vides, puis on range). |

**Le conseil du prof :** Utilisez **Grid** pour le squelette de votre site (la structure générale) et **Flexbox** pour les petits détails à l'intérieur de ces zones. Ils ne sont pas ennemis, ils travaillent en équipe !

---

## Le Support de Cours : "Ma Mise en Page en 2 minutes"

Voici le fichier mis à jour. J'ai ajouté des commentaires très précis pour expliquer comment on "nomme" les éléments pour les ranger dans la grille.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>CSS Grid : Le Plan d'Architecte</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', sans-serif;
            padding: 20px;
            background-color: #f1f2f6;
        }

        /* LE CONTENEUR : On dessine le plan ici */
        .layout-global {
            display: grid;
            gap: 10px;
            height: 90vh; /* Pour bien voir sur tout l'écran */

            /* ON DESSINE LE PLAN AVEC DES MOTS */
            /* Ici, on a 2 colonnes (une de 200px et le reste en 1fr) */
            grid-template-columns: 200px 1fr;
            grid-template-rows: 80px 1fr 60px;

            grid-template-areas:
                "entete entete"
                "menu   contenu"
                "pied   pied";
        }

        /* LES ENFANTS : On leur donne leur étiquette */
        header {
            grid-area: entete;
            background-color: #0984e3;
            color: white;
            display: flex; /* FLEXBOX à l'intérieur de GRID : Le duo gagnant ! */
            align-items: center;
            justify-content: center;
        }

        nav {
            grid-area: menu;
            background-color: #74b9ff;
            padding: 20px;
        }

        main {
            grid-area: contenu;
            background-color: white;
            padding: 20px;
            border: 2px solid #dfe6e9;
        }

        footer {
            grid-area: pied;
            background-color: #2d3436;
            color: white;
            text-align: center;
            padding: 15px;
        }

        .explication {
            margin-bottom: 20px;
            padding: 15px;
            background: #ffeaa7;
            border-radius: 8px;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <div class="explication">
        🌟 Regardez le CSS : On a écrit le plan avec <code>grid-template-areas</code>. C'est magique !
    </div>

    <div class="layout-global">
        <header><h1>HEADER (Haut de page)</h1></header>

        <nav>
            <h3>MENU</h3>
            <p>On utilise Grid pour placer cette barre à gauche.</p>
        </nav>

        <main>
            <h2>ZONE PRINCIPALE</h2>
            <p>C'est ici que l'on met nos articles. Grid réserve l'espace automatiquement.</p>
        </main>

        <footer>
            Bas de page - Le footer prend toute la largeur.
        </footer>
    </div>

</body>
</html>
```

---

**Vous voyez la puissance du truc ?** Si demain vous voulez mettre le menu à droite, vous n'avez qu'à changer un seul mot dans `grid-template-areas` (inverser `menu` et `contenu`) et tout se déplace tout seul sans toucher au HTML. C'est pour ça qu'on adore Grid au début d'un projet !

**Petite question pour vérifier si vous avez bien saisi la différence entre les deux :**

Si vous devez créer une **barre de navigation en haut** de votre site avec 5 liens (Accueil, Blog, Contact...) tous alignés sur la même ligne, quel outil allez-vous choisir pour que ce soit le plus simple possible ?

1. **CSS Grid** (car c'est le plus moderne).
2. **Flexbox** (car c'est parfait pour une seule ligne d'éléments).
