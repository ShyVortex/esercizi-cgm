/*
Portare il progetto in JavaScript sulla gestione del ristorante in TypeScript.

Extra: Il piatto deve avere un type (“antipasto”, “primo”, “secondo”, “dessert”, “bevande”) e il cliente deve
essere una persona oppure un’azienda, nel primo caso i dati sono id, type, nome e cognome,
nel secondo sono id, type, nome (ragione sociale) e tipo di azienda (“SaS”, “Srl” o “SpA”).
Usare i discriminatori per distinguere i due tipi di cliente.
*/
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let highestId = 0;
function mostraStatoOrdine(piatto, msg, color, tempo) {
    const risultato = piatto.element.querySelector(".risultato");
    let cognome = '';
    let formaSocietaria = '';
    if (piatto.cliente.tipo === 'persona') {
        cognome = piatto.cliente.cognome;
    }
    else if (piatto.cliente.tipo === 'azienda') {
        formaSocietaria = piatto.cliente.formaSocietaria;
    }
    risultato.textContent = `L'ordine di ${piatto.cliente.nome} ${cognome}${formaSocietaria}
        per ${piatto.nome} è ${msg}${tempo ? `... (${tempo}s)` : ''}`;
    risultato.style.color = color;
}
async function completaOrdine(piatto) {
    let tempoCompletamento = Math.floor(Math.random() * 10) + 1;
    mostraStatoOrdine(piatto, 'in fase di completamento', '#FF8C00', tempoCompletamento);
    if (piatto.riuscita <= tempoCompletamento)
        piatto.riuscita = tempoCompletamento;
    else
        tempoCompletamento = piatto.riuscita;
    await sleep(tempoCompletamento * 1000);
    if (piatto.riuscita >= 10) {
        piatto.stato = "pronto";
        return piatto;
    }
    if (tempoCompletamento >= 6)
        piatto.stato = "pronto";
    else
        piatto.stato = "fallito";
    return piatto;
}
async function preparaOrdine(piatto) {
    const tempoPreparazione = Math.floor(Math.random() * 10) + 1;
    mostraStatoOrdine(piatto, 'in fase di preparazione', 'purple', tempoPreparazione);
    await sleep(tempoPreparazione * 1000);
    piatto.stato = "in preparazione";
    return completaOrdine(piatto);
}
async function inviaOrdine(piatto) {
    const tempoInvio = Math.floor(Math.random() * 5) + 1;
    mostraStatoOrdine(piatto, 'in fase di invio', '#2980b9', tempoInvio);
    await sleep(tempoInvio * 1000);
    piatto.stato = "inviato";
    return preparaOrdine(piatto);
}
async function exec(event, piatto) {
    const risultato = piatto.element.querySelector(".risultato");
    const btnRipeti = piatto.element.querySelector(".btnRipeti");
    risultato.style.fontWeight = "bold";
    risultato.style.fontSize = "20px";
    risultato.style.color = "black";
    piatto = await inviaOrdine(piatto);
    console.log(piatto);
    let cognome = '';
    let formaSocietaria = '';
    if (piatto.cliente.tipo === 'persona') {
        cognome = piatto.cliente.cognome;
    }
    else if (piatto.cliente.tipo === 'azienda') {
        formaSocietaria = piatto.cliente.formaSocietaria;
    }
    if (piatto.stato === "pronto") {
        mostraStatoOrdine(piatto, 'pronto.', 'darkgreen');
    }
    else if (piatto.stato === "fallito") {
        mostraStatoOrdine(piatto, 'fallito.', 'darkred');
        btnRipeti.hidden = false;
        btnRipeti.addEventListener("click", async () => {
            btnRipeti.hidden = true;
            if (piatto.rinvii < 4)
                piatto.riuscita++;
            piatto.rinvii++;
            return exec(event, piatto);
        }, { once: true });
    }
    return;
}
function controllaCampi(tipoCliente) {
    let checkCliente = false;
    let checkPiatto = false;
    const campoNome = document.querySelector("#nome");
    const campoCognome = document.querySelector("#cognome");
    const campoFormaSocietaria = document.querySelector("#formaSocietaria");
    const nome = campoNome.value;
    const cognome = tipoCliente === 'persona' ? campoCognome.value : undefined;
    const formaSocietaria = tipoCliente === 'azienda' ? campoFormaSocietaria.value : undefined;
    if (tipoCliente === 'persona') {
        if (!nome || !cognome)
            checkCliente = false;
        else
            checkCliente = true;
    }
    else {
        if (!nome || !formaSocietaria)
            checkCliente = false;
        else
            checkCliente = true;
    }
    const tipoPiatto = document.querySelector('#tipoPiatto');
    const selectAntipasto = document.querySelector('#selectAntipasto');
    const selectPrimo = document.querySelector('#selectPrimo');
    const selectSecondo = document.querySelector('#selectSecondo');
    const selectDessert = document.querySelector('#selectDessert');
    const selectBevanda = document.querySelector('#selectBevanda');
    switch (tipoPiatto.value) {
        case 'antipasto': {
            if (selectAntipasto.selectedIndex === 0)
                checkPiatto = false;
            else
                checkPiatto = true;
            break;
        }
        case 'primo': {
            if (selectPrimo.selectedIndex === 0)
                checkPiatto = false;
            else
                checkPiatto = true;
            break;
        }
        case 'secondo': {
            if (selectSecondo.selectedIndex === 0)
                checkPiatto = false;
            else
                checkPiatto = true;
            break;
        }
        case 'dessert': {
            if (selectDessert.selectedIndex === 0)
                checkPiatto = false;
            else
                checkPiatto = true;
            break;
        }
        case 'bevanda': {
            if (selectBevanda.selectedIndex === 0)
                checkPiatto = false;
            else
                checkPiatto = true;
            break;
        }
        default:
            checkPiatto = false;
            break;
    }
    if (checkCliente && checkPiatto) {
        return true;
    }
    return false;
}
function ottieniPiatto() {
    const tipoPiatto = document.querySelector('#tipoPiatto');
    const selectAntipasto = document.querySelector('#selectAntipasto');
    const selectPrimo = document.querySelector('#selectPrimo');
    const selectSecondo = document.querySelector('#selectSecondo');
    const selectDessert = document.querySelector('#selectDessert');
    const selectBevanda = document.querySelector('#selectBevanda');
    let idPiatto;
    let nomePiatto = '';
    switch (tipoPiatto.value) {
        case 'antipasto':
            idPiatto = selectAntipasto.querySelector(`option[value="${selectAntipasto.value}"]`);
            nomePiatto = idPiatto.textContent.toLowerCase();
            break;
        case 'primo':
            idPiatto = selectPrimo.querySelector(`option[value="${selectPrimo.value}"]`);
            nomePiatto = idPiatto.textContent.toLowerCase();
            break;
        case 'secondo':
            idPiatto = selectSecondo.querySelector(`option[value="${selectSecondo.value}"]`);
            nomePiatto = idPiatto.textContent.toLowerCase();
            break;
        case 'dessert':
            idPiatto = selectDessert.querySelector(`option[value="${selectDessert.value}"]`);
            nomePiatto = idPiatto.textContent.toLowerCase();
            break;
        case 'bevanda':
            idPiatto = selectBevanda.querySelector(`option[value="${selectBevanda.value}"]`);
            nomePiatto = idPiatto.textContent.toLowerCase();
            break;
        default:
            alert("Piatto non riconosciuto.");
            return;
    }
    return [idPiatto, nomePiatto];
}
async function main(event) {
    event.preventDefault();
    const btnPersona = document.getElementById('btnPersona');
    const btnAzienda = document.getElementById('btnAzienda');
    const campoNome = document.querySelector("#nome");
    const campoCognome = document.querySelector("#cognome");
    const campoFormaSocietaria = document.querySelector("#formaSocietaria");
    const nome = campoNome.value.trim();
    const cognome = btnPersona.classList.contains('active') ?
        campoCognome.value.trim() : undefined;
    const formaSocietaria = btnAzienda.classList.contains('active') ?
        campoFormaSocietaria.value.trim() : undefined;
    let cliente;
    if (btnPersona.classList.contains('active')) {
        cliente = {
            id: highestId,
            nome: nome,
            tipo: 'persona',
            cognome: cognome
        };
    }
    else if (btnAzienda.classList.contains('active')) {
        cliente = {
            id: highestId,
            nome: nome,
            tipo: 'azienda',
            formaSocietaria: formaSocietaria
        };
    }
    else {
        alert("Errore rilevato. Impossibile proseguire.");
        throw new Error("Tipo Cliente non riconosciuto. Impossibile proseguire.");
    }
    const tipoPiatto = document.querySelector('#tipoPiatto');
    const arrPiatto = ottieniPiatto();
    const nomePiatto = arrPiatto[1];
    if (!controllaCampi(cliente.tipo)) {
        alert("Per favore, compila tutti i campi.");
        return;
    }
    const listaOrdini = document.querySelector("#listaOrdini");
    const ordineDiv = document.createElement("div");
    ordineDiv.className = "ordine-card";
    const risultatoP = document.createElement("p");
    risultatoP.className = "risultato";
    const btnRipeti = document.createElement("button");
    btnRipeti.type = "button";
    btnRipeti.className = "btnRipeti";
    btnRipeti.textContent = "Invia di nuovo";
    btnRipeti.hidden = true;
    ordineDiv.appendChild(risultatoP);
    ordineDiv.appendChild(btnRipeti);
    // Aggiungi il nuovo ordine in cima alla lista
    listaOrdini.prepend(ordineDiv);
    let piatto = {
        tipo: tipoPiatto.value,
        nome: nomePiatto,
        cliente: cliente,
        stato: 'creato',
        riuscita: 0,
        rinvii: 0,
        element: ordineDiv
    };
    console.log(piatto);
    exec(event, piatto);
}
function reset(event) {
    event.preventDefault();
    // Reset campi cliente
    const campoNome = document.querySelector("#nome");
    campoNome.value = "";
    const btnPersona = document.querySelector('#btnPersona');
    const btnAzienda = document.querySelector('#btnAzienda');
    if (btnPersona.classList.contains('active')) {
        resetPersona();
    }
    else if (btnAzienda.classList.contains('active')) {
        resetAzienda();
    }
    // Reset campi piatto
    const tipoPiatto = document.querySelector('#tipoPiatto');
    const selectAntipasto = document.querySelector('#selectAntipasto');
    const selectPrimo = document.querySelector('#selectPrimo');
    const selectSecondo = document.querySelector('#selectSecondo');
    const selectDessert = document.querySelector('#selectDessert');
    const selectBevanda = document.querySelector('#selectBevanda');
    tipoPiatto.selectedIndex = 0;
    selectAntipasto.hidden = true;
    selectAntipasto.selectedIndex = 0;
    selectPrimo.hidden = true;
    selectPrimo.selectedIndex = 0;
    selectSecondo.hidden = true;
    selectSecondo.selectedIndex = 0;
    selectDessert.hidden = true;
    selectDessert.selectedIndex = 0;
    selectBevanda.hidden = true;
    selectBevanda.selectedIndex = 0;
    // Reset lista ordini
    const listaOrdini = document.querySelector("#listaOrdini");
    listaOrdini.childNodes.forEach(node => {
        node.remove();
    });
}
function resetPersona() {
    const labelCognome = document.querySelector("#cognomeLabel");
    const campoCognome = document.querySelector("#cognome");
    const labelFormaSocietaria = document.querySelector("#formaSocietariaLabel");
    const campoFormaSocietaria = document.querySelector("#formaSocietaria");
    labelCognome.hidden = false;
    campoCognome.value = "";
    labelFormaSocietaria.hidden = true;
    campoFormaSocietaria.selectedIndex = 0;
}
function resetAzienda() {
    const labelCognome = document.querySelector("#cognomeLabel");
    const campoCognome = document.querySelector("#cognome");
    const labelFormaSocietaria = document.querySelector("#formaSocietariaLabel");
    const campoFormaSocietaria = document.querySelector("#formaSocietaria");
    labelCognome.hidden = true;
    campoCognome.value = "";
    labelFormaSocietaria.hidden = false;
    campoFormaSocietaria.selectedIndex = 0;
}
function gestisciInvia() {
    const btnPersona = document.getElementById('btnPersona');
    const btnAzienda = document.getElementById('btnAzienda');
    const btnInvia = document.getElementById('btnInvia');
    // Controllo di sicurezza per evitare errori se i bottoni non esistono
    if (!btnInvia)
        return;
    if (btnPersona.classList.contains('active')) {
        if (!controllaCampi('persona')) {
            btnInvia.disabled = true;
        }
        else {
            btnInvia.disabled = false;
        }
    }
    else if (btnAzienda.classList.contains('active')) {
        if (!controllaCampi('azienda')) {
            btnInvia.disabled = true;
        }
        else {
            btnInvia.disabled = false;
        }
    }
}
function gestisciFormPiatto(tipoPiatto) {
    const selectAntipasto = document.querySelector('#selectAntipasto');
    const selectPrimo = document.querySelector('#selectPrimo');
    const selectSecondo = document.querySelector('#selectSecondo');
    const selectDessert = document.querySelector('#selectDessert');
    const selectBevanda = document.querySelector('#selectBevanda');
    switch (tipoPiatto) {
        case 'antipasto': {
            selectAntipasto.hidden = false;
            selectPrimo.hidden = true;
            selectSecondo.hidden = true;
            selectDessert.hidden = true;
            selectBevanda.hidden = true;
            break;
        }
        case 'primo': {
            selectAntipasto.hidden = true;
            selectPrimo.hidden = false;
            selectSecondo.hidden = true;
            selectDessert.hidden = true;
            selectBevanda.hidden = true;
            break;
        }
        case 'secondo': {
            selectAntipasto.hidden = true;
            selectPrimo.hidden = true;
            selectSecondo.hidden = false;
            selectDessert.hidden = true;
            selectBevanda.hidden = true;
            break;
        }
        case 'dessert': {
            selectAntipasto.hidden = true;
            selectPrimo.hidden = true;
            selectSecondo.hidden = true;
            selectDessert.hidden = false;
            selectBevanda.hidden = true;
            break;
        }
        case 'bevanda': {
            selectAntipasto.hidden = true;
            selectPrimo.hidden = true;
            selectSecondo.hidden = true;
            selectDessert.hidden = true;
            selectBevanda.hidden = false;
            break;
        }
        default: {
            selectAntipasto.hidden = true;
            selectPrimo.hidden = true;
            selectSecondo.hidden = true;
            selectDessert.hidden = true;
            selectBevanda.hidden = true;
            break;
        }
    }
}
function selezionaTipo(clickedBtn) {
    // Rimuove classe 'active' dai pulsanti di selezione
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    // Aggiungi classe 'active' al pulsante clickato
    clickedBtn.classList.add('active');
    const labelCognome = document.querySelector("#cognomeLabel");
    const campoCognome = document.querySelector("#cognome");
    const labelFormaSocietaria = document.querySelector("#formaSocietariaLabel");
    const campoFormaSocietaria = document.querySelector("#formaSocietaria");
    if (clickedBtn.id === 'btnPersona') {
        labelCognome.hidden = false;
        campoCognome.hidden = false;
        labelFormaSocietaria.hidden = true;
        campoFormaSocietaria.hidden = true;
    }
    else if (clickedBtn.id === 'btnAzienda') {
        labelCognome.hidden = true;
        campoCognome.hidden = true;
        labelFormaSocietaria.hidden = false;
        campoFormaSocietaria.hidden = false;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const gruppoBtnType = document.querySelector('#gruppoBtnType');
    gruppoBtnType.addEventListener('click', function (event) {
        event.preventDefault();
        const target = event.target;
        if (target.classList.contains('btn')) {
            selezionaTipo(target);
            gestisciInvia();
        }
    });
    const form = document.querySelector("#piattoForm");
    if (form) {
        gestisciInvia();
        const tipoPiatto = document.querySelector('#tipoPiatto');
        tipoPiatto.addEventListener('change', () => {
            gestisciFormPiatto(tipoPiatto.value);
        });
        // Ascolta ogni modifica all'interno del form
        form.addEventListener('input', () => {
            gestisciInvia();
        });
        // Per le <select>, a volte 'change' è più affidabile di 'input'
        form.addEventListener('change', () => {
            gestisciInvia();
        });
        form.addEventListener("submit", main);
        form.addEventListener("reset", (event) => {
            reset(event);
            // Dopo aver resettato, controlla di nuovo (il bottone tornerà disabilitato)
            // Usiamo setTimeout per dare il tempo al DOM di svuotare effettivamente i campi
            setTimeout(gestisciInvia, 0);
        });
    }
});
export {};
