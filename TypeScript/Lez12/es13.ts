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

import { Cliente, FormaSocietaria, TipoPiatto, Piatto, AggiornaPiatto } from "./types.js";
import { OrdineService } from "./OrdineService.js";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Variabile globale per tenere traccia dell'ordine da modificare/cancellare
let ordineSelezionatoId: number | null = null;
let ordineSelezionatoClienteTipo: 'persona' | 'azienda' | null = null;

// Registro per tracciare qual è il ciclo "ufficiale" attualmente attivo per ogni ordine
const esecuzioniAttive = new Map<number, number>();

function mostraStatoOrdine(piatto: Piatto, msg: string, color: string, tempo?: number): void {
    const risultato = piatto.element.querySelector(".risultato") as HTMLParagraphElement;

    let cognome: string | undefined = '';
    let formaSocietaria: string | undefined = '';
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

async function completaOrdine(piatto: Piatto, token: number): Promise<Piatto> {
    // Controllo sicurezza immediato
    if (!piatto.isActive || esecuzioniAttive.get(piatto.id) !== token) return piatto;

    let tempoCompletamento: number = Math.floor(Math.random() * 10) + 1;

    mostraStatoOrdine(piatto, 'in fase di completamento', '#FF8C00', tempoCompletamento);

    if (piatto.riuscita <= tempoCompletamento)
        piatto.riuscita = tempoCompletamento;
    else
        tempoCompletamento = piatto.riuscita;

    await sleep(tempoCompletamento * 1000);

    // Doppio controllo post-risveglio dal delay
    if (!piatto.isActive || esecuzioniAttive.get(piatto.id) !== token) return piatto;

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

async function preparaOrdine(piatto: Piatto, token: number): Promise<Piatto> {
    if (!piatto.isActive || esecuzioniAttive.get(piatto.id) !== token) return piatto;

    piatto.stato = "in preparazione";

    const tempoPreparazione: number = Math.floor(Math.random() * 10) + 1;
    mostraStatoOrdine(piatto, 'in fase di preparazione', 'purple', tempoPreparazione);

    await sleep(tempoPreparazione * 1000);

    // Controllo post-risveglio
    if (!piatto.isActive || esecuzioniAttive.get(piatto.id) !== token) return piatto;

    return completaOrdine(piatto, token);
}

async function inviaOrdine(piatto: Piatto, token: number): Promise<Piatto> {
    if (!piatto.isActive || esecuzioniAttive.get(piatto.id) !== token) return piatto;

    const tempoInvio: number = Math.floor(Math.random() * 5) + 1;
    mostraStatoOrdine(piatto, 'in fase di invio', '#2980b9', tempoInvio);

    await sleep(tempoInvio * 1000);

    // Controllo post-risveglio
    if (!piatto.isActive || esecuzioniAttive.get(piatto.id) !== token) return piatto;

    piatto.stato = "inviato";
    return preparaOrdine(piatto, token);
}

function apriModaleModifica(piatto: Piatto) {
    ordineSelezionatoId = piatto.id;
    ordineSelezionatoClienteTipo = piatto.cliente.tipo;

    const modale = document.getElementById("modificaModal") as HTMLDialogElement;
    (document.getElementById("modId") as HTMLInputElement).value = piatto.id.toString();
    (document.getElementById("modNomeCliente") as HTMLInputElement).value = piatto.cliente.nome;

    // Gestione visualizzazione campi specifici cliente
    const containerCognome = document.getElementById("modContainerCognome") as HTMLDivElement;
    const containerFormaSocietaria = document.getElementById("modContainerFormaSocietaria") as HTMLDivElement;
    const inputCognome = document.getElementById("modCognome") as HTMLInputElement;
    const selectFormaSocietaria = document.getElementById("modFormaSocietaria") as HTMLSelectElement;

    if (piatto.cliente.tipo === 'persona') {
        containerCognome.hidden = false;
        containerFormaSocietaria.hidden = true;
        inputCognome.value = piatto.cliente.cognome;
    } else if (piatto.cliente.tipo === 'azienda') {
        containerCognome.hidden = true;
        containerFormaSocietaria.hidden = false;
        selectFormaSocietaria.value = piatto.cliente.formaSocietaria;
    }

    // Impostiamo la categoria attuale e aggiorniamo le tendine
    const modTipo = document.getElementById("modTipoPiatto") as HTMLSelectElement;
    modTipo.value = piatto.tipo;
    gestisciFormPiattoModifica(piatto.tipo);

    // Cicliamo su tutti i menu a tendina per disabilitare il piatto attuale
    const selects = ['modSelectAntipasto', 'modSelectPrimo', 'modSelectSecondo', 'modSelectDessert', 'modSelectBevanda'];
    selects.forEach(id => {
        const select = document.getElementById(id) as HTMLSelectElement;
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

function apriModaleCancellazione(id: number) {
    ordineSelezionatoId = id;
    const modale = document.getElementById("cancellaModal") as HTMLDialogElement;
    (document.getElementById("motivoCancellazione") as HTMLInputElement).value = "";
    modale.showModal();
}

async function exec(event: Event, piatto: Piatto, tokenCorrente?: number): Promise<void> {
    /* Se la funzione parte senza token (es. nuovo ordine o utente preme Modifica), 
       generiamo un nuovo token e lo settiamo come attivo nella mappa. */
    if (!tokenCorrente) {
        tokenCorrente = Date.now() + Math.random();
        esecuzioniAttive.set(piatto.id, tokenCorrente);
    }

    const risultato = piatto.element.querySelector(".risultato") as HTMLParagraphElement;
    const btnRipeti = piatto.element.querySelector(".btnRipeti") as HTMLButtonElement;

    let btnModifica = piatto.element.querySelector(".btnModifica") as HTMLButtonElement;
    let btnCancella = piatto.element.querySelector(".btnCancella") as HTMLButtonElement;

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

function controllaCampi(tipoCliente: string): boolean {
    let checkCliente: boolean = false;
    let checkPiatto: boolean = false;

    const campoNome = document.querySelector("#nome") as HTMLInputElement;
    const campoCognome = document.querySelector("#cognome") as HTMLInputElement;
    const campoFormaSocietaria = document.querySelector("#formaSocietaria") as HTMLSelectElement;

    const nome: string = campoNome.value.trim();
    const cognome: string = campoCognome.value.trim();

    if (tipoCliente === 'persona') {
        if (nome !== '' && cognome !== '') {
            checkCliente = true;
        }
    } else if (tipoCliente === 'azienda') {
        if (nome !== '' && campoFormaSocietaria.selectedIndex > 0) {
            checkCliente = true;
        }
    }

    const tipoPiatto = document.querySelector('#tipoPiatto') as HTMLSelectElement;
    const selectAntipasto = document.querySelector('#selectAntipasto') as HTMLSelectElement;
    const selectPrimo = document.querySelector('#selectPrimo') as HTMLSelectElement;
    const selectSecondo = document.querySelector('#selectSecondo') as HTMLSelectElement;
    const selectDessert = document.querySelector('#selectDessert') as HTMLSelectElement;
    const selectBevanda = document.querySelector('#selectBevanda') as HTMLSelectElement;

    if (tipoPiatto.selectedIndex === 0) {
        checkPiatto = false;
    } else {
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

function ottieniPiatto(): any {
    const tipoPiatto = document.querySelector('#tipoPiatto') as HTMLSelectElement;
    const selectAntipasto = document.querySelector('#selectAntipasto') as HTMLSelectElement;
    const selectPrimo = document.querySelector('#selectPrimo') as HTMLSelectElement;
    const selectSecondo = document.querySelector('#selectSecondo') as HTMLSelectElement;
    const selectDessert = document.querySelector('#selectDessert') as HTMLSelectElement;
    const selectBevanda = document.querySelector('#selectBevanda') as HTMLSelectElement;

    let idPiatto: Element;
    let nomePiatto: string = '';

    switch (tipoPiatto.value) {
        case 'antipasto':
            idPiatto = selectAntipasto.querySelector(`option[value="${selectAntipasto.value}"]`) as Element;
            nomePiatto = idPiatto.textContent!.toLowerCase();
            break;
        case 'primo':
            idPiatto = selectPrimo.querySelector(`option[value="${selectPrimo.value}"]`) as Element;
            nomePiatto = idPiatto.textContent!.toLowerCase();
            break;
        case 'secondo':
            idPiatto = selectSecondo.querySelector(`option[value="${selectSecondo.value}"]`) as Element;
            nomePiatto = idPiatto.textContent!.toLowerCase();
            break;
        case 'dessert':
            idPiatto = selectDessert.querySelector(`option[value="${selectDessert.value}"]`) as Element;
            nomePiatto = idPiatto.textContent!.toLowerCase();
            break;
        case 'bevanda':
            idPiatto = selectBevanda.querySelector(`option[value="${selectBevanda.value}"]`) as Element;
            nomePiatto = idPiatto.textContent!.toLowerCase();
            break;
        default:
            alert("Piatto non riconosciuto.");
            return;
    }

    return [idPiatto, nomePiatto];
}

async function main(event: Event): Promise<void> {
    event.preventDefault();

    const btnPersona = document.getElementById('btnPersona') as HTMLButtonElement;
    const btnAzienda = document.getElementById('btnAzienda') as HTMLButtonElement;

    const campoNome = document.querySelector("#nome") as HTMLInputElement;
    const campoCognome = document.querySelector("#cognome") as HTMLInputElement;
    const campoFormaSocietaria = document.querySelector("#formaSocietaria") as HTMLInputElement;

    const nome: string = campoNome.value.trim();
    const cognome: string | undefined = btnPersona.classList.contains('active') ?
        campoCognome.value.trim() : undefined;
    const formaSocietaria: string | undefined = btnAzienda.classList.contains('active') ?
        campoFormaSocietaria.value.trim() : undefined;

    let cliente: Cliente;

    if (btnPersona.classList.contains('active')) {
        cliente = {
            id: 0, // Ignorato perché il server assegna il vero ID
            nome: nome,
            tipo: 'persona',
            cognome: cognome as string
        }
    } else if (btnAzienda.classList.contains('active')) {
        cliente = {
            id: 0,
            nome: nome,
            tipo: 'azienda',
            formaSocietaria: formaSocietaria as FormaSocietaria
        }
    } else {
        alert("Errore rilevato. Impossibile proseguire.")
        throw new Error("Tipo Cliente non riconosciuto. Impossibile proseguire.");
    }

    const tipoPiatto = document.querySelector('#tipoPiatto') as HTMLSelectElement;
    const arrPiatto = ottieniPiatto();
    const nomePiatto = arrPiatto[1] as string;

    if (!controllaCampi(cliente.tipo)) {
        alert("Per favore, compila tutti i campi.");
        return;
    }

    const listaOrdini = document.querySelector("#listaOrdini") as Element;
    const ordineDiv = document.createElement("div") as HTMLDivElement;
    ordineDiv.className = "ordine-card";

    const risultatoP = document.createElement("p") as HTMLParagraphElement;
    risultatoP.className = "risultato";

    const btnRipeti = document.createElement("button") as HTMLButtonElement;
    btnRipeti.type = "button";
    btnRipeti.className = "btnRipeti";
    btnRipeti.textContent = "Invia di nuovo";
    btnRipeti.hidden = true;

    ordineDiv.appendChild(risultatoP);
    ordineDiv.appendChild(btnRipeti);
    listaOrdini.prepend(ordineDiv);

    // Preparazione dei dati da inviare al servizio (senza id e isActive)
    const nuovoPiattoBase = {
        tipo: tipoPiatto.value as TipoPiatto,
        nome: nomePiatto,
        cliente: cliente,
        stato: 'creato' as const,
        riuscita: 0,
        rinvii: 0,
        element: ordineDiv
    };

    const btnInvia = document.getElementById("btnInvia") as HTMLButtonElement;
    btnInvia.disabled = true;
    btnInvia.textContent = "Inviando al server...";

    try {
        // Chiamata API simulata
        const piattoCreato = await OrdineService.creaOrdine(nuovoPiattoBase);
        ordineDiv.dataset.id = piattoCreato.id.toString();

        exec(event, piattoCreato);
    } catch (error) {
        alert("Errore durante la creazione dell'ordine.");
    } finally {
        btnInvia.textContent = "Invia";
        gestisciInvia(); // Riabilita/Disabilita in base al form attuale
    }
}

function reset(event: Event): void {
    event.preventDefault();

    const campoNome = document.querySelector("#nome") as HTMLInputElement;
    campoNome.value = "";

    const btnPersona = document.querySelector('#btnPersona') as HTMLButtonElement;
    const btnAzienda = document.querySelector('#btnAzienda') as HTMLButtonElement;

    if (btnPersona.classList.contains('active')) {
        resetPersona();
    } else if (btnAzienda.classList.contains('active')) {
        resetAzienda();
    }

    const tipoPiatto = document.querySelector('#tipoPiatto') as HTMLSelectElement;
    const selectAntipasto = document.querySelector('#selectAntipasto') as HTMLSelectElement;
    const selectPrimo = document.querySelector('#selectPrimo') as HTMLSelectElement;
    const selectSecondo = document.querySelector('#selectSecondo') as HTMLSelectElement;
    const selectDessert = document.querySelector('#selectDessert') as HTMLSelectElement;
    const selectBevanda = document.querySelector('#selectBevanda') as HTMLSelectElement;

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

    const listaOrdini = document.querySelector("#listaOrdini") as Element;
    Array.from(listaOrdini.childNodes).forEach(node => {
        (node as ChildNode).remove();
    });
}

function resetPersona(): void {
    const labelCognome = document.querySelector("#cognomeLabel") as HTMLLabelElement;
    const campoCognome = document.querySelector("#cognome") as HTMLInputElement;
    const labelFormaSocietaria = document.querySelector("#formaSocietariaLabel") as HTMLLabelElement;
    const campoFormaSocietaria = document.querySelector("#formaSocietaria") as HTMLSelectElement;

    labelCognome.hidden = false;
    campoCognome.value = "";
    labelFormaSocietaria.hidden = true;
    campoFormaSocietaria.selectedIndex = 0;
}

function resetAzienda(): void {
    const labelCognome = document.querySelector("#cognomeLabel") as HTMLLabelElement;
    const campoCognome = document.querySelector("#cognome") as HTMLInputElement;
    const labelFormaSocietaria = document.querySelector("#formaSocietariaLabel") as HTMLLabelElement;
    const campoFormaSocietaria = document.querySelector("#formaSocietaria") as HTMLSelectElement;

    labelCognome.hidden = true;
    campoCognome.value = "";
    labelFormaSocietaria.hidden = false;
    campoFormaSocietaria.selectedIndex = 0;
}

function gestisciInvia(): void {
    const btnPersona = document.getElementById('btnPersona') as HTMLButtonElement;
    const btnAzienda = document.getElementById('btnAzienda') as HTMLButtonElement;
    const btnInvia = document.getElementById('btnInvia') as HTMLButtonElement;

    if (!btnInvia) return;

    let isFormValid: boolean = false;

    if (btnPersona && btnPersona.classList.contains('active')) {
        isFormValid = controllaCampi('persona');
    } else if (btnAzienda && btnAzienda.classList.contains('active')) {
        isFormValid = controllaCampi('azienda');
    }

    btnInvia.disabled = !isFormValid;
}

function gestisciFormPiatto(tipoPiatto: string): void {
    const selectAntipasto = document.querySelector('#selectAntipasto') as HTMLSelectElement;
    const selectPrimo = document.querySelector('#selectPrimo') as HTMLSelectElement;
    const selectSecondo = document.querySelector('#selectSecondo') as HTMLSelectElement;
    const selectDessert = document.querySelector('#selectDessert') as HTMLSelectElement;
    const selectBevanda = document.querySelector('#selectBevanda') as HTMLSelectElement;

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

function gestisciFormPiattoModifica(tipoPiatto: string): void {
    const selects = ['modSelectAntipasto', 'modSelectPrimo', 'modSelectSecondo', 'modSelectDessert', 'modSelectBevanda'];

    // Nascondiamo tutto di default
    selects.forEach(id => (document.getElementById(id) as HTMLSelectElement).hidden = true);

    // Mostriamo solo le opzioni della categoria selezionata
    if (tipoPiatto === 'antipasto') (document.getElementById('modSelectAntipasto') as HTMLSelectElement).hidden = false;
    else if (tipoPiatto === 'primo') (document.getElementById('modSelectPrimo') as HTMLSelectElement).hidden = false;
    else if (tipoPiatto === 'secondo') (document.getElementById('modSelectSecondo') as HTMLSelectElement).hidden = false;
    else if (tipoPiatto === 'dessert') (document.getElementById('modSelectDessert') as HTMLSelectElement).hidden = false;
    else if (tipoPiatto === 'bevanda') (document.getElementById('modSelectBevanda') as HTMLSelectElement).hidden = false;
}

function selezionaTipo(clickedBtn: HTMLButtonElement): void {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    clickedBtn.classList.add('active');

    const labelCognome = document.querySelector("#cognomeLabel") as HTMLLabelElement;
    const campoCognome = document.querySelector("#cognome") as HTMLInputElement;
    const labelFormaSocietaria = document.querySelector("#formaSocietariaLabel") as HTMLLabelElement;
    const campoFormaSocietaria = document.querySelector("#formaSocietaria") as HTMLInputElement;

    if (clickedBtn.id === 'btnPersona') {
        labelCognome.hidden = false;
        campoCognome.hidden = false;
        labelFormaSocietaria.hidden = true;
        campoFormaSocietaria.hidden = true;

    } else if (clickedBtn.id === 'btnAzienda') {
        labelCognome.hidden = true;
        campoCognome.hidden = true;
        labelFormaSocietaria.hidden = false;
        campoFormaSocietaria.hidden = false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const gruppoBtnType = document.querySelector('#gruppoBtnType') as HTMLDivElement;
    gruppoBtnType.addEventListener('click', function (event: Event) {
        event.preventDefault();

        const target = event.target as HTMLButtonElement;
        if (target.classList.contains('btn')) {
            selezionaTipo(target);
            gestisciInvia();
        }
    });

    const form = document.querySelector("#piattoForm");
    if (form) {
        gestisciInvia();

        const tipoPiatto = document.querySelector('#tipoPiatto') as HTMLSelectElement;
        tipoPiatto.addEventListener('change', () => {
            gestisciFormPiatto(tipoPiatto.value)
        });

        form.addEventListener('input', gestisciInvia);
        form.addEventListener('change', gestisciInvia);

        form.addEventListener("submit", main);
        form.addEventListener("reset", (event: Event) => {
            reset(event);
            setTimeout(gestisciInvia, 0);
        });
    }

    // === Gestione Eventi Modali ===
    const modTipoPiatto = document.getElementById("modTipoPiatto") as HTMLSelectElement;
    if (modTipoPiatto) {
        modTipoPiatto.addEventListener('change', () => {
            gestisciFormPiattoModifica(modTipoPiatto.value);
        });
    }

    const btnSalvaModifica = document.getElementById("btnSalvaModifica") as HTMLButtonElement;
    if (btnSalvaModifica) {
        btnSalvaModifica.addEventListener("click", async () => {
            if (!ordineSelezionatoId) return;

            const nuovoNomeCliente = (document.getElementById("modNomeCliente") as HTMLInputElement).value.trim();
            const modCognome = (document.getElementById("modCognome") as HTMLInputElement).value.trim();
            const modFormaSocietaria = (document.getElementById("modFormaSocietaria") as HTMLSelectElement).value as FormaSocietaria;
            const modTipo = document.getElementById("modTipoPiatto") as HTMLSelectElement;

            let nuovoNomePiatto = "";
            let nuovoTipoPiatto: TipoPiatto | undefined;

            // Capiamo quale menu a tendina è visibile e se è stata selezionata un'opzione valida
            if (modTipo.value) {
                let activeSelect: HTMLSelectElement | null = null;
                if (modTipo.value === 'antipasto') activeSelect = document.getElementById('modSelectAntipasto') as HTMLSelectElement;
                else if (modTipo.value === 'primo') activeSelect = document.getElementById('modSelectPrimo') as HTMLSelectElement;
                else if (modTipo.value === 'secondo') activeSelect = document.getElementById('modSelectSecondo') as HTMLSelectElement;
                else if (modTipo.value === 'dessert') activeSelect = document.getElementById('modSelectDessert') as HTMLSelectElement;
                else if (modTipo.value === 'bevanda') activeSelect = document.getElementById('modSelectBevanda') as HTMLSelectElement;

                if (activeSelect && activeSelect.selectedIndex > 0) {
                    // Prende il nome pulendolo da "(Attuale)" nel caso ci siano errori
                    nuovoNomePiatto = activeSelect.options[activeSelect.selectedIndex].text.toLowerCase().replace(' (attuale)', '');
                    nuovoTipoPiatto = modTipo.value as TipoPiatto;
                }
            }

            const modale = document.getElementById("modificaModal") as HTMLDialogElement;
            modale.close();

            const updateData: AggiornaPiatto = {};
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
                } as Cliente;
            } else if (ordineSelezionatoClienteTipo === 'azienda') {
                updateData.cliente = {
                    tipo: 'azienda',
                    nome: nuovoNomeCliente,
                    formaSocietaria: modFormaSocietaria,
                    id: 0
                } as Cliente;
            }

            btnSalvaModifica.disabled = true;

            try {
                const ordineAggiornato = await OrdineService.aggiornaOrdine(ordineSelezionatoId, updateData);
                exec(new Event('modifica'), ordineAggiornato);
            } catch (error) {
                alert("Errore: " + error);
            } finally {
                btnSalvaModifica.disabled = false;
            }
        });
    }

    const btnConfermaCanc = document.getElementById("btnConfermaCancellazione") as HTMLButtonElement;
    if (btnConfermaCanc) {
        btnConfermaCanc.addEventListener("click", async () => {
            if (!ordineSelezionatoId) return;

            const motivo = (document.getElementById("motivoCancellazione") as HTMLInputElement).value.trim();
            if (!motivo) {
                alert("Devi inserire un motivo!");
                return;
            }

            const modale = document.getElementById("cancellaModal") as HTMLDialogElement;
            modale.close();
            btnConfermaCanc.disabled = true;

            try {
                const ordineCancellato = await OrdineService.cancellaOrdine(ordineSelezionatoId, motivo);

                // Aggiorniamo la UI forzando l'uscita dalla funzione exec attiva
                mostraStatoOrdine(ordineCancellato, `cancellato (Motivo: ${ordineCancellato.reason})`, 'gray');

                // Nascondiamo i pulsanti dal DOM per la card cancellata
                const cardCorrente = document.querySelector(`[data-id="${ordineSelezionatoId}"]`);
                if (cardCorrente) {
                    (cardCorrente.querySelector(".btnModifica") as HTMLButtonElement).hidden = true;
                    (cardCorrente.querySelector(".btnCancella") as HTMLButtonElement).hidden = true;
                    const btnRipeti = cardCorrente.querySelector(".btnRipeti") as HTMLButtonElement;
                    if (btnRipeti) btnRipeti.hidden = true;
                }

            } catch (error) {
                alert("Errore durante la cancellazione: " + error);
            } finally {
                btnConfermaCanc.disabled = false;
            }
        });
    }
});