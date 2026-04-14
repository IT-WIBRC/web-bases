# Bases sur les *Grille*

C'est parti ! Après avoir maîtrisé les boîtes et les rangées avec Flexbox, on s'attaque au "boss final" du design : **CSS Grid**.

Si Flexbox est une ligne (un train avec des wagons), **CSS Grid**, c'est une feuille de calcul ou un échiquier. C'est magique parce que vous pouvez contrôler les lignes **et** les colonnes en même temps. Imaginez dessiner une grille de morpion ou une mise en page de journal en deux secondes !

Voici le plan pour dompter cette grille :

**Plan d'apprentissage :**

1. **Le quadrillage :** Créer des colonnes et des lignes.
2. **L'unité `fr` :** La "part du gâteau" magique.
3. **Le `gap` :** Créer de l'espace sans effort.
4. **Le placement :** Faire voyager les éléments dans la grille.

---

## Le Manuel "Spécial Grille" (Expliqué avec douceur)

Mes champions, regardez ce code. C'est comme si vous aviez une armoire avec des étagères et que vous décidiez exactement où ranger chaque vêtement. C'est très satisfaisant !

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Maîtriser CSS Grid sans stress</title>
    <style>
        /* 1. ON PRÉPARE LE TERRAIN */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', sans-serif;
            padding: 40px;
            background-color: #f8f9fa;
        }

        /* 2. LE CHEF D'ORCHESTRE (Le Conteneur Grid) */
        .grille-magique {
            display: grid; /* On active la grille ici ! */

            /* On crée 3 colonnes.
               1fr veut dire "une part de l'espace libre".
               Ici, on a 3 parts égales. */
            grid-template-columns: 1fr 1fr 1fr;

            /* On crée 2 lignes de 150 pixels de haut */
            grid-template-rows: 150px 150px;

            /* L'ESPACE ENTRE LES CASES (Trop facile !) */
            gap: 20px;

            background-color: #e9ecef;
            padding: 20px;
            border-radius: 10px;
        }

        /* 3. LES PETITS SOLDATS (Les Items) */
        .item {
            background-color: #4dabf7; /* Bleu ciel */
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.5rem;
            border-radius: 8px;
            border: 2px solid #339af0;
        }

        /* UN ITEM SPÉCIAL QUI PREND DE LA PLACE */
        .geant {
            background-color: #ff8787; /* Rouge doux */
            /* On lui dit de commencer à la colonne 1 et de finir à la 3 */
            grid-column: 1 / 3;
        }

        .explication {
            background: white;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 10px;
            border-left: 5px solid #4dabf7;
        }
    </style>
</head>
<body>

    <div class="explication">
        <h1>Bienvenue dans le monde de Grid ! 🏗️</h1>
        <p>Imaginez que vous dessinez un tableau. Vous décidez du nombre de colonnes et Grid s'occupe de tout ranger tout seul.</p>
    </div>

    <div class="grille-magique">
        <div class="item geant">1 (Je prends 2 places)</div>
        <div class="item">2</div>
        <div class="item">3</div>
        <div class="item">4</div>
        <div class="item">5</div>
    </div>

    <div class="explication" style="margin-top: 30px; border-color: #ff8787;">
        <p><strong>Note pour vous :</strong> L'unité <code>fr</code> est votre meilleure amie. Elle calcule toute seule la largeur pour que ça rentre parfaitement dans l'écran, sans jamais déborder.</p>
    </div>

</body>
</html>
```

---

### Pourquoi vous allez adorer Grid

Vous n'avez plus besoin de calculer des pourcentages compliqués (`width: 33.3333%`). Si vous voulez 4 colonnes, vous écrivez juste `grid-template-columns: 1fr 1fr 1fr 1fr;` et c'est fini. C'est pas merveilleux ?

**Petite question pour voir si vous suivez toujours (je compte sur vous !) :**

Si j'écris `grid-template-columns: 2fr 1fr;`, à votre avis :

1. Les deux colonnes seront **égales**.
2. La première colonne sera **deux fois plus large** que la deuxième.
3. La première colonne fera **2 pixels** de large.

Dites-moi ce que vous en pensez, on n'est pas pressés !
