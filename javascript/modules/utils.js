function even(arrayOfNumber) {
  return arrayOfNumber.filter((number) => number % 2 === 0);
}

export function sum(arrayOfNumber) {
  return arrayOfNumber.reduce((prev, current) => prev + current, 0);
}

function capitalize(word) {
  const tableauDeMots = word.split(" ");
  const tableauDeMotAvecPremiereLettreMajuscule = tableauDeMots.map(
    (w) => w.charAt(0).toUpperCase() + w.slice(1),
  );

  return tableauDeMotAvecPremiereLettreMajuscule.join(" ");
}

function orderAsc(arrayOfNumber) {
  return arrayOfNumber.toSorted();
}

const MIN_VALUE = 1;

export { even, orderAsc, capitalize, MIN_VALUE };
