/*
Generare una pagina di gestione degli ordini di un ristorante.
Su un interfaccia in cui è possibile scegliere tra più piatti tramite select e un
campo input di tipo testo con il nome del cliente la richiesta viene inviata ad una
funzione asincrona che sceglie un numero casuale tra 1 e 5 per il tempo in cui l’ordine
è in stato “inviato”, al termine di questo tempo viene generato un altro numero casuale
da 1 a 10 in cui lo stato è in preparazione. Al suo termine viene causato un terzo
numero casuale da 1 oppure 10 dove se il numero è almeno 6 l’ordine è pronto, in caso
contrario è fallito e l’utente può reinviarlo, rifacendo partire la procedura.

Per ogni rinvio la possibilità di riuscita aumenta di uno fino ad un massimo di 4 volte
quando sarà 10/10 (successo garantito).

Si ha questo esempio:
[
  {
     "piatto": "pasta al sugo",
      "cliente": "Mario Rossi",
      "stato": "inviato",
      "rinvii": 0,
  },
  ...
]
*/

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function completaOrdine(ordine) {
    let tempoCompletamento = Math.floor(Math.random() * 10) + 1;
    document.querySelector("#risultato").textContent = `L'ordine di ${ordine.cliente} per ${ordine.piatto}
    è in fase di completamento... (${tempoCompletamento}s)`;
    document.querySelector("#risultato").style.color = "#FF8C00";

    if (ordine.riuscita <= tempoCompletamento)
        ordine.riuscita = tempoCompletamento;
    else
        tempoCompletamento = ordine.riuscita;

    await sleep(tempoCompletamento * 1000);

    if (ordine.riuscita >= 10) {
        ordine.stato = "Pronto";
        return ordine;
    }

    if (tempoCompletamento >= 6)
        ordine.stato = "Pronto";
    else
        ordine.stato = "Fallito";

    return ordine;
}

async function preparaOrdine(ordine) {
    const tempoPreparazione = Math.floor(Math.random() * 10) + 1;
    document.querySelector("#risultato").textContent = `L'ordine di ${ordine.cliente} per ${ordine.piatto}
    è in fase di preparazione... (${tempoPreparazione}s)`;
    document.querySelector("#risultato").style.color = "purple";

    await sleep(tempoPreparazione * 1000);
    ordine.stato = "In preparazione";
    return completaOrdine(ordine);
}

async function inviaOrdine(ordine) {
    const tempoInvio = Math.floor(Math.random() * 5) + 1;
    document.querySelector("#risultato").textContent = `L'ordine di ${ordine.cliente} per ${ordine.piatto}
    è in fase di invio... (${tempoInvio}s)`;
    document.querySelector("#risultato").style.color = "#2980b9";

    await sleep(tempoInvio * 1000);
    ordine.stato = "Inviato";

    return preparaOrdine(ordine);
}

async function exec(event, ordine) {
    document.querySelector("#risultato").style.fontWeight = "bold";
    document.querySelector("#risultato").style.fontSize = "20px";
    document.querySelector("#risultato").style.color = "black";

    ordine = await inviaOrdine(ordine);
    console.log(ordine);

    if (ordine.stato === "Pronto") {
        document.querySelector("#risultato").textContent = `L'ordine di ${ordine.cliente}
        per ${ordine.piatto} è pronto.`;
        document.querySelector("#risultato").style.color = "darkgreen";
    }
    else if (ordine.stato === "Fallito") {
        document.querySelector("#risultato").textContent = `L'ordine di ${ordine.cliente}
        per ${ordine.piatto} è fallito.` + '\nRiprovare?';
        document.querySelector("#risultato").style.color = "darkred";
        document.querySelector("#btnRipeti").hidden = false;
        document.querySelector("#btnRipeti").addEventListener("click", async () => {
            document.querySelector("#btnRipeti").hidden = true;
            if (ordine.rinvii < 4)
                ordine.riuscita++;
            ordine.rinvii++;
            return exec(event, ordine);
        });
    }

    return;
}

async function main(event) {
    event.preventDefault();

    const nome = document.querySelector("#nome").value;
    const cognome = document.querySelector("#cognome").value;
    const piatto = document.querySelector("#piatto").value;
    const risultato = document.querySelector("#risultato");

    if (!nome || !cognome || !piatto) {
        risultato.textContent = "Per favore, compila tutti i campi.";
        return;
    }

    const cliente = `${nome} ${cognome}`;

    let ordine = {
        piatto,
        cliente,
        stato: "Creato",
        riuscita: 0,
        rinvii: 0,
    };
    console.log(ordine);

    exec(event, ordine);
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#piattoForm");
    if (form) {
        form.addEventListener("submit", main);
        form.addEventListener("reset", (event) => {
            event.preventDefault();

            document.querySelector("#nome").value = "";
            document.querySelector("#cognome").value = "";
            document.querySelector("#piatto").value = "";
            document.querySelector("#risultato").textContent = "";
            if (imgEl)
                imgEl.hidden = true;
        });
    }
});

// Seleziona un piatto e mostra l'immagine corrispondente
let imgEl = '';
document.addEventListener("change", (event) => {
    if (event.target.id === "piatto") {
        if (imgEl)
            imgEl.hidden = true;
        const targetId = event.target.value;
        console.log(targetId);
        if (targetId) {
            imgEl = document.querySelector(`#${targetId}`);
            if (imgEl) {
                imgEl.hidden = false;
            }
        }
    }
});