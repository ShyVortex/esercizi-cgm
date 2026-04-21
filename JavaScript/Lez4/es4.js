/*
Creare un oggetto "mesi" che contenga un id, il nome in inglese originale della funzione date,
un oggetto "translate" che contiene le traduzioni, mettendo per adesso solo { "it": "..."),
il numero di giorni del mese e le festività di quel mese e utilizzarlo per aggiornare il 
compito svolto nella giornata di ieri. Svolgere anche il controllo sull'anno bisestile 
e andare a sostituire solo il valore di quel mese quando febbraio e di 29 giorni, creando 
un secondo oggetto dal primo usando lo spread.

Esempio:
{
    id: 1,
    name: "May",
    translates: {
        it: "Maggio"
    },
    daysOfMonth: 31,
    holidays: [ 31 ]
}

Aggiungere anche Pasquetta al mese di marzo o aprile, in base a quando cade nell'anno
selezionato dall'utente.

*/

const prompt = require("prompt-sync")();

const mesi = [
    {
        id: 1,
        name: "January",
        translate: {
            it: "Gennaio"
        },
        daysOfMonth: 31,
        holidays: [1, 6],
    },
    {
        id: 2,
        name: "February",
        translate: {
            it: "Febbraio"
        },
        daysOfMonth: 28,
        holidays: [],
    },
    {
        id: 3,
        name: "March",
        translate: {
            it: "Marzo"
        },
        daysOfMonth: 31,
        holidays: [],
    },
    {
        id: 4,
        name: "April",
        translate: {
            it: "Aprile"
        },
        daysOfMonth: 30,
        holidays: [25],
    },
    {
        id: 5,
        name: "May",
        translate: {
            it: "Maggio"
        },
        daysOfMonth: 31,
        holidays: [1],
    },
    {
        id: 6,
        name: "June",
        translate: {
            it: "Giugno"
        },
        daysOfMonth: 30,
        holidays: [2],
    },
    {
        id: 7,
        name: "July",
        translate: {
            it: "Luglio"
        },
        daysOfMonth: 31,
        holidays: [],
    },
    {
        id: 8,
        name: "August",
        translate: {
            it: "Agosto"
        },
        daysOfMonth: 31,
        holidays: [15],
    },
    {
        id: 9,
        name: "September",
        translate: {
            it: "Settembre"
        },
        daysOfMonth: 30,
        holidays: [],
    },
    {
        id: 10,
        name: "October",
        translate: {
            it: "Ottobre"
        },
        daysOfMonth: 31,
        holidays: [],
    },
    {
        id: 11,
        name: "November",
        translate: {
            it: "Novembre"
        },
        daysOfMonth: 30,
        holidays: [1],
    },
    {
        id: 12,
        name: "December",
        translate: {
            it: "Dicembre"
        },
        daysOfMonth: 31,
        holidays: [8, 25, 26],
    }
];

function isBisestile(anno) {
    return (anno % 4 === 0 && anno % 100 !== 0) || anno % 400 === 0;
}

function validaData(anno, mese, giorno) {
    // Controlli preliminari su valori negativi o fuori scala base
    if (anno < 0 || mese < 1 || mese > 12 || giorno < 1) {
        return false;
    }

    const mesi30Giorni = [4, 6, 9, 11];
    let giorniMassimi;

    if (mese === 2) {
        giorniMassimi = bisestile(anno) ? 29 : 28;
    } else if (mesi30Giorni.includes(mese)) {
        giorniMassimi = 30;
    } else {
        giorniMassimi = 31;
    }

    return giorno <= giorniMassimi;
}

function calcolaPasquetta(anno) {
    const a = anno % 19;
    const b = Math.floor(anno / 100);
    const c = anno % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    const pasqua = new Date(anno, month - 1, day);
    const pasquetta = new Date(pasqua);
    pasquetta.setDate(pasqua.getDate() + 1);

    return pasquetta;
}

function isFestivo(data, meseNum) {
    const festivi = [
        "1 Gennaio",
        "6 Gennaio",
        "25 Aprile",
        "1 Maggio",
        "2 Giugno",
        "15 Agosto",
        "1 Novembre",
        "8 Dicembre",
        "25 Dicembre",
        "26 Dicembre"
    ];

    const dataSplit = data.split(" ");
    const giornoSettimana = dataSplit[0];
    const giorno = dataSplit[1];
    const mese = dataSplit[2];
    const anno = dataSplit[3];

    const giornoMese = `${giorno} ${mese}`;

    const pasquetta = calcolaPasquetta(Number(anno));
    const giornoPasquetta = pasquetta.getDate();
    const mesePasquetta = pasquetta.getMonth() + 1;

    if (festivi.includes(giornoMese))
        return true;
    if (Number(giorno) == giornoPasquetta && meseNum == mesePasquetta)
        return true;
    if (giornoSettimana === "Sabato" || giornoSettimana === "Domenica")
        return true;

    return false;
}

function aggiornaMesi(anno) {
    const mesiAggiornati = [...mesi];
    if (isBisestile(anno))
        mesiAggiornati[1].daysOfMonth = 29;

    const pasquetta = calcolaPasquetta(anno);

    if (pasquetta.getMonth() === 3)
        mesiAggiornati[3].holidays.push(pasquetta.getDate());
    else
        mesiAggiornati[2].holidays.push(pasquetta.getDate());

    return mesiAggiornati;
}

function dataItaliana(anno, mese, giorno) {
    if (anno === undefined || isNaN(anno))
        // Permette anche anno 0 come input
        anno = new Date().getFullYear();
    if (!mese)
        mese = new Date().getMonth() + 1;
    if (!giorno)
        giorno = new Date().getDate();

    if (!validaData(anno, mese, giorno))
        return "Data non valida";

    const dataCompleta = new Date(anno, mese - 1, giorno);

    const giorniSettimana = [
        "Domenica",
        "Lunedì",
        "Martedì",
        "Mercoledì",
        "Giovedì",
        "Venerdì",
        "Sabato"
    ];
    const giornoSettimana = giorniSettimana.at(dataCompleta.getDay());

    const mesiIta = [
        "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
        "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];
    const meseItaliano = mesiIta.at(dataCompleta.getMonth());

    const objData = {
        id: dataCompleta.getMonth() + 1,
        name: mesi.find(m => m.id === dataCompleta.getMonth() + 1).name,
        translate: {
            it: meseItaliano
        },
        daysOfMonth: dataCompleta.getDate(),
        holidays: mesi.find(m => m.id === dataCompleta.getMonth() + 1).holidays,
    }

    const strData = `${giornoSettimana} ${giorno} ${meseItaliano} ${anno}`;

    const dataTuple = [strData, objData];

    return dataTuple;
}

function formattaInput(arrayData) {
    return arrayData.map(valore => Number(valore));
}

function main() {
    const anno = prompt("Inserisci un anno: ");
    const mese = prompt("Inserisci un mese: ");
    const giorno = prompt("Inserisci un giorno: ");

    const inputUtente = [anno, mese, giorno];
    const [a, m, g] = formattaInput(inputUtente);
    aggiornaMesi(a);

    const dataIta = dataItaliana(a, m, g);

    if (isFestivo(dataIta[0], m))
        console.info("[INFO]\n" + JSON.stringify(dataIta[1], null, 2));
    else
        console.log("[LOG]\n" + JSON.stringify(dataIta[1], null, 2));
}

main();