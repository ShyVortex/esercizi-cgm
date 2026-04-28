"use strict";
const defText = "Scegli un'operazione...";
function mostraRisultato(msg, color) {
    const campoRisultato = document.querySelector("#risultato");
    campoRisultato.textContent = msg;
    campoRisultato.style.fontWeight = "bold";
    campoRisultato.style.fontSize = "20px";
    campoRisultato.style.color = color;
    return;
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
        mostraRisultato("Impossibile dividere per zero", 'red');
        throw new Error("Impossibile dividere per zero");
    }
    return numA / numB;
}
function main(event) {
    event.preventDefault();
    const pNumInput = document.querySelector("#pNum");
    const sNumInput = document.querySelector("#sNum");
    const operazioneSelect = document.querySelector("#operazione");
    const campoRisultato = document.querySelector("#risultato");
    const pNum = parseFloat(pNumInput.value);
    const sNum = parseFloat(sNumInput.value);
    const operazione = operazioneSelect.value;
    if (isNaN(pNum) || isNaN(sNum) || operazione === defText)
        mostraRisultato("Tutti i campi sono obbligatori", 'red');
    campoRisultato.textContent = "";
    let risultato = 0;
    switch (operazione) {
        case 'addizione':
            risultato = somma(pNum, sNum);
            break;
        case 'sottrazione':
            risultato = differenza(pNum, sNum);
            break;
        case 'moltiplicazione':
            risultato = moltiplicazione(pNum, sNum);
            break;
        case 'divisione':
            risultato = divisione(pNum, sNum);
            break;
        default:
            alert("Impossibile eseguire l'operazione");
            break;
    }
    mostraRisultato(risultato.toString(), 'darkgreen');
}
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#calcForm");
    if (form) {
        form.addEventListener("submit", (event) => {
            main(event);
        });
        form.addEventListener("reset", (event) => {
            event.preventDefault();
            const pNumInput = document.querySelector("#pNum");
            const sNumInput = document.querySelector("#sNum");
            const operazioneSelect = document.querySelector("#operazione");
            const campoRisultato = document.querySelector("#risultato");
            pNumInput.value = "";
            sNumInput.value = "";
            operazioneSelect.selectedIndex = 0;
            campoRisultato.textContent = "";
        });
    }
});
