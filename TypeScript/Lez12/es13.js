/*
Partendo dal progetto del ristorante implementare le funzionalità di modifica parziale
dell'ordine non ancora completato per i campi nome del cliente e del piatto, usando i
type utility "Partial" e “Pick” per i campi del form e "Omit" per l'id dell'ordine per il
passaggio dei parametri all'utility che riceve i dati da aggiornare, resettando lo stato
come “inviato” e facendo ripartire il ciclo di vita dell'ordine, e la funzionalità di
cancellazione LOGICA, tramite campo isActive, di un ordine, che prevede anche la
compilazione di un campo di tipo testo "reason" (motivo).
Il campo id dovrà essere in sola lettura.

Per le chiamate a liste, dettaglio, creazione, modifica e cancellazione simulate un
delay di 1000-2500 millisecondi come se stesse chiamando un vero back-end.

Gestire tutto in un apposito servizio.
*/
import { OrdineService } from "./OrdineService.js";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function attendiConPausa(ms, piatto, token, msgBase, color, tempoSec) {
    const step = 500; // Controlliamo lo stato ogni mezzo secondo
    let elapsed = 0;
    let inPausa = false;
    while (elapsed < ms) {
        // Se c'è stato un riavvio o una cancellazione (token cambiato), esce subito e uccide il ciclo
        if (!piatto.isActive || esecuzioniAttive.get(piatto.id) !== token) {
            return;
        }
        // Se l'ID dell'ordine in esecuzione corrisponde al modale attualmente aperto, metti in pausa
        if (ordineSelezionatoId === piatto.id) {
            if (!inPausa) {
                mostraStatoOrdine(piatto, `${msgBase} [IN PAUSA]`, 'orange');
                inPausa = true;
            }
            await sleep(step); // Aspetta, ma non fa avanzare il timer 'elapsed'
        }
        else {
            // Se riprende dall'essere in pausa, ripristiniamo il testo originale
            if (inPausa) {
                mostraStatoOrdine(piatto, msgBase, color, tempoSec);
                inPausa = false;
            }
            await sleep(step);
            elapsed += step; // L'ordine avanza normalmente
        }
    }
}
// Variabile globale per tenere traccia dell'ordine da modificare/cancellare
let ordineSelezionatoId = null;
let ordineSelezionatoClienteTipo = null;
// Registro per tracciare qual è il ciclo "ufficiale" attualmente attivo per ogni ordine
const esecuzioniAttive = new Map();
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
    risultato.textContent = `[ID: ${piatto.id}] L'ordine di ${piatto.cliente.nome} ${cognome}${formaSocietaria}
        per ${piatto.nome} è ${msg}${tempo ? `... (${tempo}s)` : ''}`;
    risultato.style.color = color;
}
async function completaOrdine(piatto, token) {
    if (!piatto.isActive || esecuzioniAttive.get(piatto.id) !== token)
        return piatto;
    let tempoCompletamento = Math.floor(Math.random() * 10) + 1;
    if (piatto.riuscita <= tempoCompletamento)
        piatto.riuscita = tempoCompletamento;
    else
        tempoCompletamento = piatto.riuscita;
    mostraStatoOrdine(piatto, 'in fase di completamento', '#FF8C00', tempoCompletamento);
    await attendiConPausa(tempoCompletamento * 1000, piatto, token, 'in fase di completamento', '#FF8C00', tempoCompletamento);
    if (!piatto.isActive || esecuzioniAttive.get(piatto.id) !== token)
        return piatto;
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
async function preparaOrdine(piatto, token) {
    if (!piatto.isActive || esecuzioniAttive.get(piatto.id) !== token)
        return piatto;
    piatto.stato = "in preparazione";
    const tempoPreparazione = Math.floor(Math.random() * 10) + 1;
    mostraStatoOrdine(piatto, 'in fase di preparazione', 'purple', tempoPreparazione);
    await attendiConPausa(tempoPreparazione * 1000, piatto, token, 'in fase di preparazione', 'purple', tempoPreparazione);
    if (!piatto.isActive || esecuzioniAttive.get(piatto.id) !== token)
        return piatto;
    return completaOrdine(piatto, token);
}
async function inviaOrdine(piatto, token) {
    if (!piatto.isActive || esecuzioniAttive.get(piatto.id) !== token)
        return piatto;
    const tempoInvio = Math.floor(Math.random() * 5) + 1;
    mostraStatoOrdine(piatto, 'in fase di invio', '#2980b9', tempoInvio);
    await attendiConPausa(tempoInvio * 1000, piatto, token, 'in fase di invio', '#2980b9', tempoInvio);
    if (!piatto.isActive || esecuzioniAttive.get(piatto.id) !== token)
        return piatto;
    piatto.stato = "inviato";
    return preparaOrdine(piatto, token);
}
function apriModaleModifica(piatto) {
    ordineSelezionatoId = piatto.id;
    ordineSelezionatoClienteTipo = piatto.cliente.tipo;
    const modale = document.getElementById("modificaModal");
    document.getElementById("modId").value = piatto.id.toString();
    document.getElementById("modNomeCliente").value = piatto.cliente.nome;
    // Gestione visualizzazione campi specifici cliente
    const containerCognome = document.getElementById("modContainerCognome");
    const containerFormaSocietaria = document.getElementById("modContainerFormaSocietaria");
    const inputCognome = document.getElementById("modCognome");
    const selectFormaSocietaria = document.getElementById("modFormaSocietaria");
    if (piatto.cliente.tipo === 'persona') {
        containerCognome.hidden = false;
        containerFormaSocietaria.hidden = true;
        inputCognome.value = piatto.cliente.cognome;
    }
    else if (piatto.cliente.tipo === 'azienda') {
        containerCognome.hidden = true;
        containerFormaSocietaria.hidden = false;
        selectFormaSocietaria.value = piatto.cliente.formaSocietaria;
    }
    // Impostiamo la categoria attuale e aggiorniamo le tendine
    const modTipo = document.getElementById("modTipoPiatto");
    modTipo.value = piatto.tipo;
    gestisciFormPiattoModifica(piatto.tipo);
    // Cicliamo su tutti i menu a tendina per disabilitare il piatto attuale
    const selects = ['modSelectAntipasto', 'modSelectPrimo', 'modSelectSecondo', 'modSelectDessert', 'modSelectBevanda'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        select.selectedIndex = 0; // Resetta la selezione
        Array.from(select.options).forEach(opt => {
            opt.disabled = false; // Riabilita le opzioni
            opt.text = opt.text.replace(' (Attuale)', ''); // Pulisce l'etichetta
            // Se l'opzione corrisponde al piatto attuale, la blocca
            if (opt.text.toLowerCase() === piatto.nome.toLowerCase()) {
                opt.disabled = true;
                opt.text = `${opt.text} (Attuale)`;
            }
        });
    });
    modale.showModal();
}
function apriModaleCancellazione(id) {
    ordineSelezionatoId = id;
    const modale = document.getElementById("cancellaModal");
    document.getElementById("motivoCancellazione").value = "";
    modale.showModal();
}
async function exec(event, piatto, tokenCorrente) {
    /* Se la funzione parte senza token (es. nuovo ordine o utente preme Modifica),
       generiamo un nuovo token e lo settiamo come attivo nella mappa. */
    if (!tokenCorrente) {
        tokenCorrente = Date.now() + Math.random();
        esecuzioniAttive.set(piatto.id, tokenCorrente);
    }
    const risultato = piatto.element.querySelector(".risultato");
    const btnRipeti = piatto.element.querySelector(".btnRipeti");
    let btnModifica = piatto.element.querySelector(".btnModifica");
    let btnCancella = piatto.element.querySelector(".btnCancella");
    if (!btnModifica) {
        btnModifica = document.createElement("button");
        btnModifica.type = "button";
        btnModifica.className = "btnModifica";
        btnModifica.textContent = "Modifica Ordine";
        btnModifica.style.marginLeft = "10px";
        btnModifica.onclick = () => apriModaleModifica(piatto);
        piatto.element.appendChild(btnModifica);
    }
    if (!btnCancella) {
        btnCancella = document.createElement("button");
        btnCancella.type = "button";
        btnCancella.className = "btnCancella";
        btnCancella.textContent = "Cancella Ordine";
        btnCancella.style.marginLeft = "10px";
        btnCancella.style.color = "red";
        btnCancella.onclick = () => apriModaleCancellazione(piatto.id);
        piatto.element.appendChild(btnCancella);
    }
    risultato.style.fontWeight = "bold";
    risultato.style.fontSize = "20px";
    risultato.style.color = "black";
    btnModifica.hidden = false;
    btnCancella.hidden = false;
    btnRipeti.hidden = true;
    // Passiamo il token alla catena di funzioni
    piatto = await inviaOrdine(piatto, tokenCorrente);
    // Se il token del piatto non è più attivo, termina l'esecuzione
    if (esecuzioniAttive.get(piatto.id) !== tokenCorrente) {
        return;
    }
    if (!piatto.isActive) {
        mostraStatoOrdine(piatto, `cancellato (Motivo: ${piatto.reason})`, 'gray');
        btnModifica.hidden = true;
        btnCancella.hidden = true;
        return;
    }
    if (piatto.stato === "pronto") {
        mostraStatoOrdine(piatto, 'pronto.', 'darkgreen');
        btnModifica.hidden = true;
        btnCancella.hidden = true;
    }
    else if (piatto.stato === "fallito") {
        mostraStatoOrdine(piatto, 'fallito.', 'darkred');
        btnRipeti.hidden = false;
        btnRipeti.addEventListener("click", async () => {
            btnRipeti.hidden = true;
            if (piatto.rinvii < 4)
                piatto.riuscita++;
            piatto.rinvii++;
            piatto.stato = "creato";
            // Richiamiamo exec() senza token: ne genererà uno nuovo sovrascrivendo la mappa
            return exec(event, piatto);
        }, { once: true });
    }
}
function controllaCampi(tipoCliente) {
    let checkCliente = false;
    let checkPiatto = false;
    const campoNome = document.querySelector("#nome");
    const campoCognome = document.querySelector("#cognome");
    const campoFormaSocietaria = document.querySelector("#formaSocietaria");
    const nome = campoNome.value.trim();
    const cognome = campoCognome.value.trim();
    if (tipoCliente === 'persona') {
        if (nome !== '' && cognome !== '') {
            checkCliente = true;
        }
    }
    else if (tipoCliente === 'azienda') {
        if (nome !== '' && campoFormaSocietaria.selectedIndex > 0) {
            checkCliente = true;
        }
    }
    const tipoPiatto = document.querySelector('#tipoPiatto');
    const selectAntipasto = document.querySelector('#selectAntipasto');
    const selectPrimo = document.querySelector('#selectPrimo');
    const selectSecondo = document.querySelector('#selectSecondo');
    const selectDessert = document.querySelector('#selectDessert');
    const selectBevanda = document.querySelector('#selectBevanda');
    if (tipoPiatto.selectedIndex === 0) {
        checkPiatto = false;
    }
    else {
        switch (tipoPiatto.value) {
            case 'antipasto':
                checkPiatto = selectAntipasto.selectedIndex > 0;
                break;
            case 'primo':
                checkPiatto = selectPrimo.selectedIndex > 0;
                break;
            case 'secondo':
                checkPiatto = selectSecondo.selectedIndex > 0;
                break;
            case 'dessert':
                checkPiatto = selectDessert.selectedIndex > 0;
                break;
            case 'bevanda':
                checkPiatto = selectBevanda.selectedIndex > 0;
                break;
            default:
                checkPiatto = false;
                break;
        }
    }
    return checkCliente && checkPiatto;
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
            id: 0, // Ignorato perché il server assegna il vero ID
            nome: nome,
            tipo: 'persona',
            cognome: cognome
        };
    }
    else if (btnAzienda.classList.contains('active')) {
        cliente = {
            id: 0,
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
    listaOrdini.prepend(ordineDiv);
    // Preparazione dei dati da inviare al servizio (senza id e isActive)
    const nuovoPiattoBase = {
        tipo: tipoPiatto.value,
        nome: nomePiatto,
        cliente: cliente,
        stato: 'creato',
        riuscita: 0,
        rinvii: 0,
        element: ordineDiv
    };
    const btnInvia = document.getElementById("btnInvia");
    btnInvia.disabled = true;
    btnInvia.textContent = "Inviando al server...";
    try {
        // Chiamata API simulata
        const piattoCreato = await OrdineService.creaOrdine(nuovoPiattoBase);
        ordineDiv.dataset.id = piattoCreato.id.toString();
        exec(event, piattoCreato);
    }
    catch (error) {
        alert("Errore durante la creazione dell'ordine.");
    }
    finally {
        btnInvia.textContent = "Invia";
        gestisciInvia(); // Riabilita/Disabilita in base al form attuale
    }
}
function reset(event) {
    event.preventDefault();
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
    const listaOrdini = document.querySelector("#listaOrdini");
    Array.from(listaOrdini.childNodes).forEach(node => {
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
    if (!btnInvia)
        return;
    let isFormValid = false;
    if (btnPersona && btnPersona.classList.contains('active')) {
        isFormValid = controllaCampi('persona');
    }
    else if (btnAzienda && btnAzienda.classList.contains('active')) {
        isFormValid = controllaCampi('azienda');
    }
    btnInvia.disabled = !isFormValid;
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
function gestisciFormPiattoModifica(tipoPiatto) {
    const selects = ['modSelectAntipasto', 'modSelectPrimo', 'modSelectSecondo', 'modSelectDessert', 'modSelectBevanda'];
    // Nascondiamo tutto di default
    selects.forEach(id => document.getElementById(id).hidden = true);
    // Mostriamo solo le opzioni della categoria selezionata
    if (tipoPiatto === 'antipasto')
        document.getElementById('modSelectAntipasto').hidden = false;
    else if (tipoPiatto === 'primo')
        document.getElementById('modSelectPrimo').hidden = false;
    else if (tipoPiatto === 'secondo')
        document.getElementById('modSelectSecondo').hidden = false;
    else if (tipoPiatto === 'dessert')
        document.getElementById('modSelectDessert').hidden = false;
    else if (tipoPiatto === 'bevanda')
        document.getElementById('modSelectBevanda').hidden = false;
}
function selezionaTipo(clickedBtn) {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => btn.classList.remove('active'));
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
        form.addEventListener('input', gestisciInvia);
        form.addEventListener('change', gestisciInvia);
        form.addEventListener("submit", main);
        form.addEventListener("reset", (event) => {
            reset(event);
            setTimeout(gestisciInvia, 0);
        });
    }
    // === Gestione Eventi Modali ===
    const modTipoPiatto = document.getElementById("modTipoPiatto");
    if (modTipoPiatto) {
        modTipoPiatto.addEventListener('change', () => {
            gestisciFormPiattoModifica(modTipoPiatto.value);
        });
    }
    const btnSalvaModifica = document.getElementById("btnSalvaModifica");
    if (btnSalvaModifica) {
        btnSalvaModifica.addEventListener("click", async () => {
            if (!ordineSelezionatoId)
                return;
            const nuovoNomeCliente = document.getElementById("modNomeCliente").value.trim();
            const modCognome = document.getElementById("modCognome").value.trim();
            const modFormaSocietaria = document.getElementById("modFormaSocietaria").value;
            const modTipo = document.getElementById("modTipoPiatto");
            let nuovoNomePiatto = "";
            let nuovoTipoPiatto;
            // Capiamo quale menu a tendina è visibile e se è stata selezionata un'opzione valida
            if (modTipo.value) {
                let activeSelect = null;
                if (modTipo.value === 'antipasto')
                    activeSelect = document.getElementById('modSelectAntipasto');
                else if (modTipo.value === 'primo')
                    activeSelect = document.getElementById('modSelectPrimo');
                else if (modTipo.value === 'secondo')
                    activeSelect = document.getElementById('modSelectSecondo');
                else if (modTipo.value === 'dessert')
                    activeSelect = document.getElementById('modSelectDessert');
                else if (modTipo.value === 'bevanda')
                    activeSelect = document.getElementById('modSelectBevanda');
                if (activeSelect && activeSelect.selectedIndex > 0) {
                    // Prende il nome pulendolo da "(Attuale)" nel caso ci siano errori
                    nuovoNomePiatto = activeSelect.options[activeSelect.selectedIndex].text.toLowerCase().replace(' (attuale)', '');
                    nuovoTipoPiatto = modTipo.value;
                }
            }
            const modale = document.getElementById("modificaModal");
            modale.close();
            const updateData = {};
            if (nuovoNomePiatto && nuovoTipoPiatto) {
                updateData.nome = nuovoNomePiatto;
                updateData.tipo = nuovoTipoPiatto;
            }
            // Creiamo un oggetto Cliente tipizzato correttamente in base al discriminatore
            if (ordineSelezionatoClienteTipo === 'persona') {
                updateData.cliente = {
                    tipo: 'persona',
                    nome: nuovoNomeCliente,
                    cognome: modCognome,
                    id: 0 // (ignorato dal backend)
                };
            }
            else if (ordineSelezionatoClienteTipo === 'azienda') {
                updateData.cliente = {
                    tipo: 'azienda',
                    nome: nuovoNomeCliente,
                    formaSocietaria: modFormaSocietaria,
                    id: 0
                };
            }
            btnSalvaModifica.disabled = true;
            try {
                // Aspetta il database mentre il modale è ancora aperto
                const ordineAggiornato = await OrdineService.aggiornaOrdine(ordineSelezionatoId, updateData);
                // Solo alla fine chiudi il modale
                const modale = document.getElementById("modificaModal");
                modale.close();
                exec(new Event('modifica'), ordineAggiornato);
            }
            catch (error) {
                alert("Errore: " + error);
            }
            finally {
                btnSalvaModifica.disabled = false;
            }
        });
    }
    const btnConfermaCanc = document.getElementById("btnConfermaCancellazione");
    if (btnConfermaCanc) {
        btnConfermaCanc.addEventListener("click", async () => {
            if (!ordineSelezionatoId)
                return;
            const motivo = document.getElementById("motivoCancellazione").value.trim();
            if (!motivo) {
                alert("Devi inserire un motivo!");
                return;
            }
            const modale = document.getElementById("cancellaModal");
            modale.close();
            btnConfermaCanc.disabled = true;
            try {
                const ordineCancellato = await OrdineService.cancellaOrdine(ordineSelezionatoId, motivo);
                const modale = document.getElementById("cancellaModal");
                modale.close();
                // Aggiorniamo la UI forzando l'uscita dalla funzione exec attiva
                mostraStatoOrdine(ordineCancellato, `cancellato (Motivo: ${ordineCancellato.reason})`, 'gray');
                // Nascondiamo i pulsanti dal DOM per la card cancellata
                const cardCorrente = ordineCancellato.element;
                if (cardCorrente) {
                    cardCorrente.querySelector(".btnModifica").hidden = true;
                    cardCorrente.querySelector(".btnCancella").hidden = true;
                    const btnRipeti = cardCorrente.querySelector(".btnRipeti");
                    if (btnRipeti)
                        btnRipeti.hidden = true;
                }
            }
            catch (error) {
                alert("Errore durante la cancellazione: " + error);
            }
            finally {
                btnConfermaCanc.disabled = false;
            }
        });
    }
    // Ascoltiamo l'evento nativo HTML di chiusura modale per "togliere la pausa" all'ordine
    const modaleModifica = document.getElementById("modificaModal");
    if (modaleModifica) {
        modaleModifica.addEventListener("close", () => {
            ordineSelezionatoId = null;
        });
    }
    const modaleCancella = document.getElementById("cancellaModal");
    if (modaleCancella) {
        modaleCancella.addEventListener("close", () => {
            ordineSelezionatoId = null;
        });
    }
});
