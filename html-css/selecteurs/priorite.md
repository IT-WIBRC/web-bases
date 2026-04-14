# Priorites

L'attribut `style="..."` écrit directement dans la balise HTML (ce qu'on appelle le **style inline**) est le "roi" de la montagne. Il écrase tout ce qui est écrit dans le fichier CSS.

Pour vos étudiants, c'est une notion vitale appelée la **Spécificité**. On peut l'imaginer comme un système de points :

| Sélecteur | Points | Description |
| :--- | :--- | :--- |
| **Style Inline** | 1000 | Directement dans la balise. |
| **ID (`#`)** | 100 | Une pièce unique. |
| **Classe (`.`) / Attribut (`[]`)** | 10 | Un groupe. |
| **Balise (`p`, `div`)** | 1 | Un type général. |
| **Universel (`*`)** | 0 | Tout le monde. |

---

## Étape Suivante : Les Sélecteurs de Combinaison (Les Liens de Parenté)

Pour terminer ce grand cours sur les sélecteurs, il faut expliquer comment cibler un élément en fonction de ses voisins ou de ses parents. C'est ce qui permet d'éviter de mettre des classes partout.

Ajoutons cette section "Relations Familiales" à votre fichier HTML :

```html
<style>
    /* 1. ESPACE : Le descendant (Enfants, petits-enfants...) */
    /* Cible TOUS les <span> qui sont n'importe où dans une <div> */
    div span { color: #8e44ad; font-weight: bold; }

    /* 2. CHEVRON (>) : L'enfant direct uniquement */
    /* Cible les <span> qui sont DIRECTEMENT sous la <div>, pas plus loin */
    div > span { border: 1px solid #8e44ad; padding: 2px; }

    /* 3. PLUS (+) : Le voisin direct (Petit frère) */
    /* Cible le premier <p> qui arrive juste après un <h2> */
    h2 + p { margin-top: 0; color: #34495e; font-style: italic; }

    /* 4. TILDE (~) : Tous les voisins suivants */
    /* Cible tous les <p> qui suivent un <h2>, même s'il y a d'autres trucs entre eux */
    h2 ~ p { border-left: 2px solid #bdc3c7; padding-left: 10px; }
</style>

<div class="card">
    <h2>4. Les Sélecteurs de Relation</h2>
    <div class="explication-box">
        <p><strong>Le Descendant (Espace) :</strong> Très utile pour dire "Tous les liens dans mon menu".</p>
        <p><strong>L'Enfant Direct (>) :</strong> Pour dire "Uniquement les éléments de premier niveau".</p>
    </div>

    <div class="demo-container">
        <div>
            <span>Je suis un enfant direct (Encadré + Violet)</span>
            <p>
                <span>Je suis un petit-enfant (Violet uniquement)</span>
            </p>
        </div>
    </div>
</div>
```

**Conseil pour étudiants :** Utiliser l'espace (`descendant`) 90% du temps, utiliser le chevron (`>`) dès que vous voulez garder un contrôle strict sur la structure, surtout dans les menus complexes.

