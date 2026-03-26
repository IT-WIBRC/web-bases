/*
       * La portee definit l'accessibilite et la visibilite d'une variable(variable et constante) dans le code. Cela depend de la maniere dont elle est declaree (var, let, const).

      * Jl existe trois types de porte en JS:

        * Globale: La variable est accessible n'importe ou dans le fichier. Elle est decclare een dehors de n'importe quel fonction ou block
        * Function: La variable est accessible uniquement dans la fonction ou elle est declaree. La variable est declare dans une fonction. Concerne les variables declaree avec (let, const, var)
        * Block: La variable est accessible uniquement dans le bock ou elle est declaree: La variable est decalre dans un block `{}`, comme dans un bloc de condition, de boucle (for, while, ...). Ceci concerne uniquement les variables declarees avec les mots clefs (let, const). Si tu declares avec le mot clef `var`, la variable ne sera pas limite a ce block du tout mais a la fonction si le block est dans une fonction et sinon, elle sera globale
        *
        *
        *

        * **** La chaine de portee ****

        * Lorsque tu utilises une variable dans le code, Js essais de d'acceder a la variable la portee locale ou elle est utilisee; Si il ne la trouve pas il monte dans la portee parente jusqu'a arrive a celle globale dans le cas ou elle n'est pas trouve au prealable. Si trouve dans une portee, Js arrete de chercher et recupere son contenu. Si la variable n'est pas trouve meme dans la portee globale, il va declencher un execption (erreur de type: `ReferenceError`)

        * Ce comportement est du a la *portee lexicale*, qui signifie que la portee d'une fonction ou d'un block n'est pas definit par ou est ce qu'il/elle est appelle mais par ou il/elle est declare(e). Ceci s'applique meme dans des modules car les variabels decalre dans chaque module n'est accessible que dans celui-ci et meme si tu exportes un fonction de ce module vers l'exterieur, elle aura toujours access aux variables declarees oui elle a ete declaree. Ce qui donne naissance au *closure* en Js permettant de donne un impression de securite a nos variables et de memoire a nos fonctions meme a travers plusieurs appels meme dans different fichier.
       */

// Portee Globale
let nom = "WIBRC";
const prenom = "IBRC";

//  Portee Block (limited to the block)
console.log("Variable declare avec le mot clef `var`: ", varTest); // Ne declenchera pas d'erreur mais affichera `undefined`
//console.log(var1); // Declenchera une `ReferenceError` dans la console si decommente
{
  let var1,
    var2 = 7;
  const const1 = 4;
  console.log(
    "Nom complet: ",
    nom + " " + prenom,
    "\n\nvariable block (`let` et `const`): ",
    var1,
    var2,
    const1,
  ); // Access aux variables globales et locales

  var varTest = 6;
}

// Portee de Fonction
function addition(a, b) {
  const somme = a + b;
  let decision = "";
  if (somme >= 10) {
    decision = "Passable le travial";
  } else {
    decision = "Mal travaille";
  }
  var nom = "WIBRC";
  // Toutes ses variables sont accessible uniquement dnas cette fonction
  console.log("Somme: ", somme);
  console.log("Prenom global: ", prenom);
  console.log("Decision: ", decision);
  console.log("Nom avec `var`: ", nom);
}
addition(4, 5);

// Exemples avancees
// Avec var (Problematique)
for (var index = 0; index < 3; index++) {
  setTimeout(() => {
    console.log("Valuer courante: ", index);
  }, 100);
}
/*
 * Resultat
   - Valuer courante: 3
   - Valuer courante: 3
   - Valuer courante: 3

   Le var est gobal et est modifie a chaque fois. Et comme la function `setTimeout` est asynchrone, elle s'executera seulement une fois le code synchrone (la boucle for) termine. Et a la fin, nous aurons juste `index = 3`:

   A chaque iteration, nous utiliserons toujours la meme variable et ne creerons pas un nouveau block. La bloucle etant deja terminee car synchrone, index sera deja a 3. Donc, chaque `setTimeout` s'execura avec le meme index deja a `3`
 */

// Avec let (conseille)
for (let index = 0; index < 3; index++) {
  setTimeout(() => {
    console.log("Valuer courante: ", index);
  });
}
/*
 * Resultat
   - Valuer courante: 0
   - Valuer courante: 1
   - Valuer courante: 2

   Etant donnee que `let` est block scope, chaque iteration creera un nouveau block avec sa variable:

   ` iteration 1 avec index = 0;
   {
     let index = 0;
     setTimeout(() => {
        console.log("Valuer courante: ", index);
    });
   }

   ` iteration 2 avec index = 1;
   {
     let index = 1;
     setTimeout(() => {
        console.log("Valuer courante: ", index);
    });
   }

   ` iteration 3 avec index = 2;
   {
     let index = 2;
     setTimeout(() => {
        console.log("Valuer courante: ", index);
    });
   }
 */

//    Module
import { multiplicationPar } from "./utils.js";
multiplicationPar(4, 5);
