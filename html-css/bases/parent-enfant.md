# Bases (Parent et enfant)

C'est le fondement même du Web ! Pour comprendre le HTML, il ne faut pas voir une page comme un texte plat, mais comme un **arbre généalogique** ou une **poupée russe**.

En bref, un **parent** est une balise qui en contient d'autres. Les balises à l'intérieur sont ses **enfants**. Cette structure définit comment les styles CSS sont hérités (comme la couleur des yeux ou des cheveux dans une famille !).

**Plan d'apprentissage :**

1. **La métaphore de la boîte :** Comprendre l'emboîtement.
2. **L'arbre généalogique :** Qui est parent, qui est enfant ?
3. **L'importance de l'indentation :** Pourquoi décaler son code.
4. **L'héritage :** Ce que l'enfant reçoit de son parent.

---

## Le fichier HTML de démonstration

Voici un fichier très visuel et commenté pour expliquer ces concepts :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Comprendre Parent et Enfant en HTML</title>
    <style>
        /* Style général pour le cours */
        body {
            font-family: 'Segoe UI', sans-serif;
            padding: 30px;
            background-color: #f5f6fa;
        }

        /* Style pour matérialiser les "boîtes" */
        .parent-box {
            border: 4px solid #2980b9; /* Bleu pour le parent */
            padding: 20px;
            background-color: #ebf5fb;
            margin-bottom: 20px;
        }

        .enfant-box {
            border: 2px solid #e67e22; /* Orange pour l'enfant */
            padding: 15px;
            background-color: white;
            margin: 10px 0;
        }

        code { background: #eee; padding: 2px 4px; border-radius: 4px; color: #c0392b; }

        .note {
            font-size: 0.9rem;
            color: #7f8c8d;
            font-style: italic;
            margin-top: 5px;
        }
    </style>
</head>
<body>

    <h1>La Hiérarchie HTML</h1>

    <div class="parent-box">
        <strong>Je suis la Balise PARENTE (div)</strong>
        <p class="note">Tout ce qui est encadré en bleu m'appartient.</p>

        <p class="enfant-box">
            Je suis un <strong>Enfant</strong> (p).
            Mon parent est la boîte bleue.
        </p>

        <ul class="enfant-box">
            <li>Je suis un <strong>Petit-Enfant</strong> (li)</li>
            <li>Mon parent est le <code>ul</code>, et mon grand-parent est le <code>div</code></li>
        </ul>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px;">
        <h2>Les règles d'or pour les étudiants :</h2>
        <ul>
            <li><strong>L'emboîtement :</strong> On ne peut pas fermer un parent avant d'avoir fermé ses enfants.
                <br><code>&lt;p&gt;&lt;b&gt;Faux&lt;/p&gt;&lt;/b&gt;</code> ❌
                <br><code>&lt;p&gt;&lt;b&gt;Juste&lt;/b&gt;&lt;/p&gt;</code> ✅
            </li>
            <li><strong>L'indentation :</strong> On décale le code vers la droite à chaque fois qu'on crée un enfant pour "voir" la hiérarchie.</li>
        </ul>
    </div>

</body>
</html>
```

---

### Pourquoi c'est important ?

Le HTML est comme une adresse postale. Pour trouver une lettre (un texte), le facteur (le navigateur) doit d'abord trouver la ville (le `<body>`), puis la rue (la `<section>`), puis la maison (la `<div>`).

**Activité pour la classe :**
Regardez ce bout de code :

```html
<section>
  <h1>Titre</h1>
  <p>Texte <span>Spécial</span></p>
</section>
```

1. Qui est le parent de la balise `<span>` ?
2. Est-ce que le `<h1>` et le `<p>` sont parents l'un de l'autre ?

*(Indice : S'ils sont au même niveau, on dit qu'ils sont "frères" ou "siblings")*
