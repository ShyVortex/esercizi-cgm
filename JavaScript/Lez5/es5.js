/*
Partendo dall’esercizio della giornata precedente sostituire le chiamate manuali alla
funzione per ricevere la data in italiano con un’interfaccia grafica in cui l’utente
compila in un form i campi anno, mese e anno e riceve in un apposito campo sottostante
in risposta la data richiesta in italiano oppure un errore.

Aggiungere la validazione dei dati ricevuti dal form con annessi eventuali errori.
In caso di errore il testo deve essere rosso e in grassetto, mentre in caso di risposta
corretta deve essere in verde scuro. Tutti i campi devono essere obbligatori e di default
ci deve essere la data odierna del giorno in cui è stata aperta la pagina.

Ricordatevi di prevenire il comportamento di default dei form nei browser per evitare
risultati inaspettati come il ricaricamento della pagina.
*/

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
    if (anno < 0)
        throw new Error("L'anno non può essere negativo");
    if (mese < 1 || mese > 12)
        throw new Error("Il mese deve essere compreso tra 1 e 12");
    if (giorno < 1)
        throw new Error("Il giorno non può essere negativo");

    const mesi30Giorni = [4, 6, 9, 11];
    let giorniMassimi;

    if (mese === 2) {
        giorniMassimi = bisestile(anno) ? 29 : 28;
    } else if (mesi30Giorni.includes(mese)) {
        giorniMassimi = 30;
    } else {
        giorniMassimi = 31;
    }

    if (giorno > giorniMassimi)
        throw new Error("Il giorno per questa data non può essere maggiore di " + giorniMassimi);

    return true;
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

    if (giornoMese.includes("25 Dicembre"))
        return "Natale";
    if (giornoMese.includes("1 Gennaio"))
        return "Capodanno";
    if (giornoMese.includes("6 Gennaio"))
        return "Epifania";
    if (festivi.includes(giornoMese))
        return "Festivo";
    if (meseNum == mesePasquetta && Number(giorno) == giornoPasquetta - 1)
        return "Pasqua";
    if (Number(giorno) == giornoPasquetta && meseNum == mesePasquetta)
        return "Pasquetta";
    if (giornoSettimana === "Sabato" || giornoSettimana === "Domenica")
        return "Weekend";

    return "";
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
    try {
        validaData(anno, mese, giorno);

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

    } catch (error) {
        document.querySelector("#risultato").textContent = error.message;
        document.querySelector("#risultato").style.fontWeight = "bold";
        document.querySelector("#risultato").style.fontSize = "20px";
        document.querySelector("#risultato").style.color = "red";
        return;
    }
}

function formattaInput(arrayData) {
    return arrayData.map(valore => Number(valore));
}

function main(event) {
    event.preventDefault();

    const anno = document.querySelector("#anno").value;
    const mese = document.querySelector("#mese").value;
    const giorno = document.querySelector("#giorno").value;

    if (anno === "" || mese === "" || giorno === "") {
        document.querySelector("#risultato").textContent = "Tutti i campi sono obbligatori";
        document.querySelector("#risultato").style.fontWeight = "bold";
        document.querySelector("#risultato").style.fontSize = "20px";
        document.querySelector("#risultato").style.color = "red";
        return;
    }

    const inputUtente = [anno, mese, giorno];
    const [a, m, g] = formattaInput(inputUtente);
    aggiornaMesi(a);

    const dataIta = dataItaliana(a, m, g);
    const festivoType = isFestivo(dataIta[0], m)

    if (festivoType === "") {
        document.querySelector("#risultato").textContent = dataIta[0] + " non è un giorno festivo";
        document.querySelector("#risultato").style.fontWeight = "bold";
        document.querySelector("#risultato").style.fontSize = "20px";
        document.querySelector("#risultato").style.color = "darkgreen";
    }
    else {
        switch (festivoType) {
            case "Natale":
                document.querySelector("#risultato").textContent = dataIta[0] + " è Natale";
                break;
            case "Capodanno":
                document.querySelector("#risultato").textContent = dataIta[0] + " è Capodanno";
                break;
            case "Epifania":
                document.querySelector("#risultato").textContent = dataIta[0] + " è Epifania";
                break;
            case "Festivo":
                document.querySelector("#risultato").textContent = dataIta[0] + " è un giorno festivo";
                break;
            case "Pasqua":
                document.querySelector("#risultato").textContent = dataIta[0] + " è Pasqua";
                break;
            case "Pasquetta":
                document.querySelector("#risultato").textContent = dataIta[0] + " è Pasquetta";
                break;
            case "Weekend":
                document.querySelector("#risultato").textContent = dataIta[0] + " è un giorno del weekend";
                break;
        }
        document.querySelector("#risultato").style.fontWeight = "bold";
        document.querySelector("#risultato").style.fontSize = "20px";
        document.querySelector("#risultato").style.color = "darkgreen";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#dataForm");
    if (form) {
        form.addEventListener("submit", main);
        form.addEventListener("reset", (event) => {
            event.preventDefault();

            document.querySelector("#anno").value = new Date().getFullYear();
            document.querySelector("#mese").value = new Date().getMonth() + 1;
            document.querySelector("#giorno").value = new Date().getDate();
            document.querySelector("#risultato").textContent = "";
        });
    }

    document.querySelector("#anno").value = new Date().getFullYear();
    document.querySelector("#mese").value = new Date().getMonth() + 1;
    document.querySelector("#giorno").value = new Date().getDate();
});