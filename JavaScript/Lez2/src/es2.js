function bisestile(anno) {
    return (anno % 4 == 0 && anno % 100 != 0) || anno % 400 == 0;
}

function validaData(anno, mese, giorno) {
    // Controlli preliminari su valori negativi o fuori scala base
    if (anno < 0 || mese < 1 || mese > 12 || giorno < 1) {
        return false;
    }

    let giorniMassimi;

    switch (mese) {
        case 2:
            giorniMassimi = bisestile(anno) ? 29 : 28;
            break;
        case 4:
        case 6:
        case 9:
        case 11:
            giorniMassimi = 30;
            break;
        default:
            giorniMassimi = 31;
            break;
    }

    return giorno <= giorniMassimi;
}

function dataItaliana(anno, mese, giorno) {
    if (anno === undefined || isNaN(anno))
        anno = 2026;
    if (!mese)
        mese = 4;
    if (!giorno)
        giorno = 15;

    if (!validaData(anno, mese, giorno))
        return "Data non valida";

    let meseItaliano = "";

    switch (mese) {
        case 1:
            meseItaliano = "Gennaio";
            break;
        case 2:
            meseItaliano = "Febbraio";
            break;
        case 3:
            meseItaliano = "Marzo";
            break;
        case 4:
            meseItaliano = "Aprile";
            break;
        case 5:
            meseItaliano = "Maggio";
            break;
        case 6:
            meseItaliano = "Giugno";
            break;
        case 7:
            meseItaliano = "Luglio";
            break;
        case 8:
            meseItaliano = "Agosto";
            break;
        case 9:
            meseItaliano = "Settembre";
            break;
        case 10:
            meseItaliano = "Ottobre";
            break;
        case 11:
            meseItaliano = "Novembre";
            break;
        case 12:
            meseItaliano = "Dicembre";
            break;
        default:
            return "Mese non valido";
    }

    const data = `${giorno} ${meseItaliano} ${anno}`;

    return data;
}

function main() {
    const prompt = require('prompt-sync')();

    const anno = 2024;
    const mese = 10;
    const giorno = 5;

    const dataIta = dataItaliana(anno, mese, giorno);
    console.log(dataIta);
}

main();