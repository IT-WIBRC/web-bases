# 📝 Exercice : Le Maître des Styles

L'objectif est de transformer trois boîtes banales en éléments stylisés en utilisant uniquement les bons sélecteurs (Balise, Classe et ID).

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Exercice : Sélecteurs de Base</title>
    <style>
        /* === ZONE DE TRAVAIL : ÉCRIVEZ VOTRE CSS ICI === */

        /* 1. Ciblez toutes les div pour leur donner le style commun */
        /* Style : padding 20px, margin 10px, border-radius, background, police... */


        /* 2. Ciblez les deux premiers h3 (via une classe) */


        /* 3. Ciblez le dernier h3 (via un ID) pour qu'il soit unique */


        /* ============================================== */
    </style>
</head>
<body>

    <h1>Consignes de l'exercice :</h1>
    <ol>
        <li>Toutes les <strong>div</strong> doivent avoir : un fond gris clair, une police "Arial", une couleur de texte sombre et un peu d'espace interne (padding).</li>
        <li>Les <strong>h1, h2 et h3</strong> doivent tous être centrés.</li>
        <li>Les <strong>h3 des deux premières div</strong> doivent être en <span style="color: blue;">Bleu</span> (utilisez une classe).</li>
        <li>Le <strong>h3 de la troisième div</strong> doit être en <span style="color: red;">Rouge</span> et en gras (utilisez un ID).</li>
    </ol>

    <hr>

    <div class="boite">
        <h1>Titre Principal</h1>
        <h3 class="important">Petit sous-titre 1</h3>
    </div>

    <div class="boite">
        <h2>Titre Secondaire</h2>
        <h3 class="important">Petit sous-titre 2</h3>
    </div>

    <div class="boite">
        <h3>Petit sous-titre Spécial</h3>
    </div>

</body>
</html>
```

---

## 💡 Aide pour le professeur (Corrigé à expliquer)

Si vos élèves bloquent, montrez-leur que le secret réside dans le **poids** des sélecteurs :

1. **Le Sélecteur de Balise (`div`)** : C'est la base. Il donne le style général à tout le monde.
2. **La Classe (`.important`)** : Elle permet de regrouper les deux premiers sans toucher au troisième.
3. **L'ID (`#special`)** : C'est le "super-pouvoir". Même si on avait mis une classe sur le 3ème, l'ID gagnerait car il est plus précis.

**Petit défi supplémentaire pour les plus rapides :**
*"Comment feriez-vous pour que, lorsque l'on passe la souris sur une div, son fond devienne jaune ?"* (Réponse attendue : le sélecteur `:hover`).

Est-ce que cet exercice te semble adapté au niveau actuel de tes élèves ?
