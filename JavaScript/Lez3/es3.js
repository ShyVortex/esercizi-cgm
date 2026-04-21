const prompt = require("prompt-sync")();

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

function bisestile(anno) {
    return (anno % 4 == 0 && anno % 100 != 0) || anno % 400 == 0;
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

    const mesi = [
        "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
        "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];
    const meseItaliano = mesi.at(dataCompleta.getMonth());

    return `${giornoSettimana} ${giorno} ${meseItaliano} ${anno}`;
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

    const dataIta = dataItaliana(a, m, g);

    if (isFestivo(dataIta, m))
        console.info("[INFO] " + dataIta);
    else
        console.log("[LOG] " + dataIta);
}

main();