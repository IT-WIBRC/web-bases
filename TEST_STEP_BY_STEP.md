# **Test Semaine 1 - Bases Web & HTML/CSS**

## **Durée :** 30 minutes

### **Objectif :** Vérifier la compréhension des fondamentaux

### **Partie 1 : Vrai/Faux avec explication (10 min)**

1. `<div>` et `<span>` sont interchangeables
2. `display: flex` se met sur l'élément parent
3. `px` est meilleur que `rem` pour le responsive
4. `rgb(255, 0, 0)` donne du rouge
5. Une balise `<img>` doit toujours avoir un attribut `alt`

**Pour chaque réponse, explique POURQUOI en 1 phrase.**

### **Partie 2 : Corrige ce code (10 min)**

```html
<!-- Trouve 5 erreurs -->
<DOCTYPE html>
<html>
<header>
    <h1>Mon Site
    <nav>
        <a href="#home">Accueil
        <a href="#about">À propos
    </nav>
</header>
<body>
    <div class="content">
        <p>Bienvenue sur mon site</p>
    </div>
</body>
</html>
```

### **Partie 3 : Crée une navbar (10 min)**

Crée une barre de navigation avec :

- Logo à gauche "DEVIA"
- 3 liens centrés : Accueil, Services, Contact
- Bouton "Connexion" à droite
- Utilise Flexbox

---

## **Test Semaine 2 - Responsive & Git Basics**

### **Durée :** 35 minutes

### **Partie 1 : Questions Git (10 min)**

1. Quelle commande pour voir l'état des fichiers modifiés ?
2. Comment ajouter un fichier spécifique au staging ?
3. Quelle est la différence entre `git pull` et `git fetch` ?
4. Pourquoi faire des commits petits et fréquents ?

### **Partie 2 : Media Query (10 min)**

```css
/* Crée un conteneur qui :
   - Sur desktop : largeur 800px, centré
   - Sur tablette : largeur 90%, padding 20px
   - Sur mobile : largeur 100%, padding 10px
*/
```

### **Partie 3 : Formulaire accessible (15 min)**

Crée un formulaire de contact avec :

- Champ nom (obligatoire)
- Champ email avec validation
- Zone de message
- Bouton d'envoi
- Messages d'erreur pour champs invalides

---

## **Test Semaine 3 - JavaScript Bases**

**Durée :** 40 minutes

### **Partie 1 : Types et variables (10 min)**

```javascript
// Que va afficher chaque console.log ?
let x = 10;
const y = 20;
var z = 30;

x = 15;
// y = 25; // Que se passe-t-il si on décommente ?

console.log(x + y); // 1. ?
console.log(typeof "Hello"); // 2. ?
console.log(5 == "5"); // 3. ?
console.log(5 === "5"); // 4. ?

const arr = [1, 2, 3];
arr.push(4);
console.log(arr); // 5. ?
```

### **Partie 2 : Fonctions et conditions (15 min)**

```javascript
// 1. Écris une fonction qui prend un âge et retourne "Majeur" si >=18, "Mineur" sinon

// 2. Écris une fonction qui prend un tableau de nombres et retourne leur somme

// 3. Écris une boucle qui affiche les nombres de 1 à 10
```

### **Partie 3 : DOM Basics (15 min)**

```html
<button id="myButton">Clique-moi</button>
<div id="result"></div>
```

```javascript
// Ajoute un écouteur d'événement qui :
// 1. Au clic sur le bouton, affiche "Clic !" dans la div
// 2. Compte le nombre de clics
// 3. Change la couleur du bouton après 3 clics
```

---

## **Test Semaine 4 - Tableaux & CSS Avancé**

**Durée :** 45 minutes

### **Partie 1 : Méthodes tableaux (15 min)**

```javascript
const nombres = [10, 20, 30, 40, 50];

// Utilise les méthodes de tableau pour :
// 1. Doubler chaque nombre
// 2. Filtrer les nombres > 25
// 3. Trouver le premier nombre > 35
// 4. Vérifier si tous les nombres sont pairs
// 5. Créer une chaîne "10-20-30-40-50"
```

### **Partie 2 : Position CSS (15 min)**

```html
<div class="parent">
  <div class="enfant1">Enfant 1</div>
  <div class="enfant2">Enfant 2</div>
</div>
```

```css
/* Positionne enfant2 pour qu'il soit :
   - 20px du haut du parent
   - 20px de la droite du parent
   - Par-dessus enfant1
*/
```

### **Partie 3 : Animation simple (15 min)**

Crée un bouton qui au survol :

- Change de couleur de fond
- Grandit légèrement
- Affiche une ombre
- Transition douce de 0.3s

---

## **Test Semaine 5 - Projet Pratique**

**Durée :** 60 minutes
**Projet :** Liste de tâches simple

### **Fonctionnalités obligatoires :**

1. Ajouter une tâche via input + bouton
2. Marquer une tâche comme terminée (barrée)
3. Supprimer une tâche
4. Filtrer (toutes/actives/terminées)
5. Compter les tâches restantes

### **Structure attendue :**

```html
<div class="todo-app">
  <h1>📝 Mes Tâches</h1>

  <div class="input-section">
    <input type="text" placeholder="Nouvelle tâche..." />
    <button>Ajouter</button>
  </div>

  <div class="filters">
    <button class="active">Toutes</button>
    <button>Actives</button>
    <button>Terminées</button>
  </div>

  <ul class="task-list">
    <!-- Tâches générées par JS -->
  </ul>

  <div class="stats">
    <span>3 tâches restantes</span>
  </div>
</div>
```

### **Critères d'évaluation :**

- HTML sémantique : 10 points
- CSS propre et responsive : 20 points
- JavaScript fonctionnel : 40 points
- UX/UI (feedback, états) : 20 points
- Code organisé et commenté : 10 points

**Total : 100 points**

---

## **Test Semaine 6 - Intégration Complète**

### **Durée :** 75 minutes

#### **Projet :** Galerie d'images interactive

### **Requirements :**

```javascript
// Données de départ
const images = [
    { id: 1, url: 'image1.jpg', title: 'Paysage 1', category: 'nature' },
    { id: 2, url: 'image2.jpg', title: 'Portrait 1', category: 'portrait' },
    { id: 3, url: 'image3.jpg', title: 'Paysage 2', category: 'nature' }
];

// Fonctionnalités :
1. Afficher les images en grille responsive
2. Filtrage par catégorie
3. Lightbox au clic sur une image
4. Recherche par titre
5. Ajout d'image (simulé)
6. localStorage pour sauvegarder
```

### **Architecture attendue :**

```txt
index.html
style.css
app.js
    ├── displayImages()
    ├── setupFilters()
    ├── handleSearch()
    ├── openLightbox()
    └── saveToLocalStorage()
```

### **Bonus (points supplémentaires) :**

- Drag & drop pour réorganiser
- Édition des titres
- Pagination
- Mode sombre

---

## **Système d'Évaluation Réaliste**

### **Seuils de Passage :**

- **✅ Passage** : 60%+ sur le projet de la semaine 6
- **⚠️ Risque** : 40-59% sur 2 tests consécutifs
- **❌ Échec** : <40% sur projet final

### **Checklist de Compétences :**

**À la fin de la semaine 6, l'étudiant doit pouvoir :**

1. **HTML/CSS (70%+)**
   - Créer une page responsive
   - Utiliser Flexbox/Grid
   - Styliser formulaires
   - Animer des interactions

2. **JavaScript (60%+)**
   - Manipuler le DOM
   - Gérer les événements
   - Travailler avec tableaux/objets
   - Utiliser localStorage

3. **Git (50%+)**
   - Commit régulier
   - Push sur GitHub
   - Résoudre conflits simples

4. **Problème-solving**
   - Débugger son code
   - Rechercher des solutions
   - Adapter des exemples

### **Processus de Correction :**

1. **Auto-évaluation** : L'étudiant note son propre travail
2. **Correction par les pairs** : Échange des copies
3. **Correction par vous** : Validation finale
4. **Feedback personnalisé** : Points forts/faibles
5. **Plan d'amélioration** : Exercices ciblés

### **Exemples de Feedback :**

```txt
✅ Points forts :
- Code bien structuré
- Bonne utilisation Flexbox
- Fonctionnalités implémentées

⚠️ À améliorer :
- Noms de variables plus explicites
- Gestion des erreurs manquante
- CSS trop spécifique

📚 Exercices recommandés :
- Refactoriser avec des fonctions
- Ajouter des messages d'erreur
- Pratiquer CSS BEM
```
