import { Piatto, AggiornaPiatto } from "./types.js";

// Simula il ritardo di rete casuale (1000 - 2500 ms)
const delay = () => new Promise(resolve =>
    setTimeout(resolve, Math.floor(Math.random() * 1500) + 1000)
);

let dbSimulato: Piatto[] = [];
let currentId: number = 1;

// Esportiamo un semplice oggetto che contiene le funzioni necessarie.
export const OrdineService = {
    async creaOrdine(nuovoPiatto: Omit<Piatto, 'id' | 'isActive'>): Promise<Piatto> {
        await delay();
        const ordine: Piatto = {
            ...nuovoPiatto,
            id: currentId++, // Usa la variabile e poi la incrementa
            isActive: true
        };
        dbSimulato.push(ordine);
        return ordine;
    },

    async getOrdiniAttivi(): Promise<Piatto[]> {
        await delay();
        return dbSimulato.filter(o => o.isActive === true);
    },

    // Update Parziale
    async aggiornaOrdine(id: number, datiAggiornati: AggiornaPiatto): Promise<Piatto> {
        await delay();

        const indice = dbSimulato.findIndex(o => o.id === id);
        if (indice === -1) throw new Error("Ordine non trovato");

        const ordineEsistente = dbSimulato[indice];

        // L'ordine può essere modificato solo se non è completato/pronto
        if (ordineEsistente.stato === "pronto") {
            throw new Error("Impossibile modificare un ordine già pronto.");
        }

        // Non creiamo un nuovo oggetto, ma modifichiamo direttamente le proprietà
        if (datiAggiornati.nome) {
            ordineEsistente.nome = datiAggiornati.nome;
        }
        if (datiAggiornati.cliente) {
            // Aggiorna sempre il nome (comune a entrambi)
            if (datiAggiornati.cliente.nome) {
                ordineEsistente.cliente.nome = datiAggiornati.cliente.nome;
            }

            // Usa il discriminatore per aggiornare i campi specifici
            if (ordineEsistente.cliente.tipo === 'persona' && datiAggiornati.cliente.tipo === 'persona') {
                // Se c'è un nuovo cognome, lo aggiorna
                if (datiAggiornati.cliente.cognome !== undefined) {
                    ordineEsistente.cliente.cognome = datiAggiornati.cliente.cognome;
                }
            } else if (ordineEsistente.cliente.tipo === 'azienda' && datiAggiornati.cliente.tipo === 'azienda') {
                // Se c'è una nuova forma societaria, la aggiorna
                if (datiAggiornati.cliente.formaSocietaria !== undefined) {
                    ordineEsistente.cliente.formaSocietaria = datiAggiornati.cliente.formaSocietaria;
                }
            }
        }

        /* Resettiamo lo stato direttamente sull'oggetto originale
           In questo modo, le funzioni asincrone in pausa si accorgeranno del cambiamento. */
        ordineEsistente.stato = "inviato";
        ordineEsistente.riuscita = 0;
        ordineEsistente.rinvii = 0;

        return ordineEsistente;
    },

    async cancellaOrdine(id: number, reason: string): Promise<Piatto> {
        await delay();

        const indice = dbSimulato.findIndex(o => o.id === id);
        if (indice === -1) throw new Error("Ordine non trovato");

        dbSimulato[indice].isActive = false;
        dbSimulato[indice].reason = reason;

        return dbSimulato[indice];
    }
};