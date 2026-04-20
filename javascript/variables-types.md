# 📘 Le Cours : La Mémoire du JavaScript

## 1. Comment créer un tiroir ?

Autrefois, on utilisait `var`, mais aujourd'hui, on utilise deux mots magiques plus sécurisés :

* **`let`** : Pour une valeur qui peut **changer** (ex: le score d'un jeu).
* **`const`** : Pour une valeur qui reste **fixe** (ex: ta date de naissance).

## 2. Qu'est-ce qu'on range dedans ? (Les Types)

* **String (Texte)** : Toujours entre guillemets `"Bonjour"`.
* **Number (Nombre)** : Des chiffres `42` ou `3.14`.
* **Boolean (Vrai/Faux)** : Soit `true`, soit `false`. C'est l'interrupteur.
* **Undefined** : Un tiroir vide qu'on a créé mais pas encore rempli.

---

### 💻 Le Fichier HTML : Ton Premier Laboratoire JS

Voici un fichier que tes élèves peuvent ouvrir dans leur navigateur. Pour voir le résultat, ils devront faire un **clic droit > Inspecter > Console**.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>JS Débutant : Les Variables</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; line-height: 1.6; background-color: #fff5f5; }
        .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border-left: 5px solid #f1c40f; }
        h2 { color: #f39c12; }
        code { background: #eee; padding: 2px 5px; border-radius: 4px; color: #d35400; font-weight: bold; }
        .instruction { background: #e8f4fd; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #3498db; }
    </style>
</head>
<body>

    <div class="card">
        <h1>JavaScript : La Magie des Variables 🌟</h1>
        <p>Les variables sont des <strong>boîtes nommées</strong> où l'on stocke des données.</p>

        <h2>1. Créer une variable</h2>
        <p>On utilise <code>let</code> pour ce qui change et <code>const</code> pour ce qui est constant.</p>

        <h2>2. Les Types de données</h2>
        <ul>
            <li><code>String</code> : Du texte entre " ".</li>
            <li><code>Number</code> : Des nombres.</li>
            <li><code>Boolean</code> : Vrai ou Faux (true / false).</li>
        </ul>

        <div class="instruction">
            <strong>🛠️ Exercice pour les élèves :</strong> <br>
            Faites un clic-droit sur cette page, choisissez <strong>"Inspecter"</strong>, puis cliquez sur l'onglet <strong>"Console"</strong>. Vous y verrez les messages secrets du JavaScript !
        </div>
    </div>

    <script>
        /* -------------------------------------------
           LES VARIABLES
           ------------------------------------------- */

        // On crée une constante (elle ne bougera jamais)
        const prenom = "Lucas";

        // On crée une variable (elle peut évoluer)
        let age = 10;
        age = age + 1; // C'est l'anniversaire de Lucas !

        // Un booléen (vrai ou faux)
        let aimeLeCode = true;

        /* -------------------------------------------
           AFFICHER DANS LA CONSOLE
           C'est comme envoyer un message au cerveau.
           ------------------------------------------- */

        console.log("Bonjour !");
        console.log("Nom de l'élève :", prenom);
        console.log("Âge l'année prochaine :", age);
        console.log("Type de la donnée 'prenom' :", typeof prenom);
        console.log("Type de la donnée 'age' :", typeof age);

        /* PETITE ASTUCE :
           'typeof' est un mot spécial qui permet de demander
           au JS : "C'est quoi comme type de donnée dans ce tiroir ?"
        */
    </script>
</body>
</html>
```

---

### 💡 Le petit conseil du prof

Le nom d'une variable est super important. On évite d'appeler une variable `a` ou `x`. On l'appelle `scoreJoueur` ou `nomUtilisateur`. C'est comme étiqueter les tiroirs dans sa cuisine : si on écrit "truc" sur tous les tiroirs, on ne retrouvera jamais le sel !

**Petite devinette pour la classe :**

Si je veux créer une variable pour stocker le **nom de notre planète** (la Terre), devrais-je utiliser `let` ou `const` ? 🌍

1. `let` (parce qu'on peut toujours changer d'avis).
2. `const` (parce que le nom de la planète ne va pas changer demain matin).

Qu'est-ce qu'ils en pensent ?
