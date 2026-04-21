function helloworld() {
    console.log("Hello World");
}

function somma(a, b) {
    return Number(a) + Number(b);
}

function differenza(a, b) {
    return Number(a) - Number(b);
}

function moltiplicazione(a, b) {
    return Number(a) * Number(b);
}

function divisione(a, b) {
    let numA = Number(a);
    let numB = Number(b);

    if (numB === 0) {
        return "Impossibile dividere per zero";
    }
    return numA / numB;
}

function main() {
    helloworld();

    // Debug della calcolatrice con console log
    console.log("--- Debug Calcolatrice ---");
    console.log("Somma (10 + 5):", somma(10, 5));
    console.log("Differenza (10 - 5):", differenza(10, 5));
    console.log("Moltiplicazione (10 * 5):", moltiplicazione(10, 5));
    console.log("Divisione (10 / 5):", divisione(10, 5));
    console.log("Divisione per zero:", divisione(10, 0));
}

main();