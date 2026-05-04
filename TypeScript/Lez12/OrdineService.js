// Simula il ritardo di rete casuale (1000 - 2500 ms)
const delay = () => new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1500) + 1000));
// === STATO PRIVATO DEL SERVIZIO ===
// Queste variabili "vivono" solo in questo file. 
// Non avendo la parola chiave 'export', sono protette (simili al 'private' delle classi).
let dbSimulato = [];
let currentId = 1;
// === OGGETTO SERVIZIO ESPORTATO ===
// Esportiamo un semplice oggetto ("object literal") che contiene le funzioni necessarie.
export const OrdineService = {
    // CREATE
    async creaOrdine(nuovoPiatto) {
        await delay();
        const ordine = {
            ...nuovoPiatto,
            id: currentId++, // Usa la variabile globale del modulo e poi la incrementa
            isActive: true // Attivo di default
        };
        dbSimulato.push(ordine);
        return ordine;
    },
    // READ (Lista)
    async getOrdiniAttivi() {
        await delay();
        // Ritorna solo gli ordini non cancellati logicamente
        return dbSimulato.filter(o => o.isActive === true);
    },
    // UPDATE PARZIALE (Usando l'utility type)
    async aggiornaOrdine(id, datiAggiornati) {
        await delay();
        const indice = dbSimulato.findIndex(o => o.id === id);
        if (indice === -1)
            throw new Error("Ordine non trovato");
        const ordineEsistente = dbSimulato[indice];
        // L'ordine può essere modificato solo se non è completato/pronto
        if (ordineEsistente.stato === "pronto") {
            throw new Error("Impossibile modificare un ordine già pronto.");
        }
        // CRITICO: Non creiamo un nuovo oggetto, ma modifichiamo direttamente le proprietà 
        // dell'oggetto esistente in memoria (Mutazione).
        if (datiAggiornati.nome) {
            ordineEsistente.nome = datiAggiornati.nome;
        }
        // --- NUOVO BLOCCO AGGIORNAMENTO CLIENTE ---
        if (datiAggiornati.cliente) {
            // 1. Aggiorna sempre il nome (comune a entrambi)
            if (datiAggiornati.cliente.nome) {
                ordineEsistente.cliente.nome = datiAggiornati.cliente.nome;
            }
            // 2. Aggiorna in modo sicuro i campi specifici usando il discriminatore
            if (ordineEsistente.cliente.tipo === 'persona' && datiAggiornati.cliente.tipo === 'persona') {
                // Se c'è un nuovo cognome, lo aggiorna
                if (datiAggiornati.cliente.cognome !== undefined) {
                    ordineEsistente.cliente.cognome = datiAggiornati.cliente.cognome;
                }
            }
            else if (ordineEsistente.cliente.tipo === 'azienda' && datiAggiornati.cliente.tipo === 'azienda') {
                // Se c'è una nuova forma societaria, la aggiorna
                if (datiAggiornati.cliente.formaSocietaria !== undefined) {
                    ordineEsistente.cliente.formaSocietaria = datiAggiornati.cliente.formaSocietaria;
                }
            }
        }
        // --- FINE NUOVO BLOCCO ---
        // Resettiamo lo stato direttamente sull'oggetto originale!
        // In questo modo, le funzioni asincrone in pausa si accorgeranno del cambiamento.
        ordineEsistente.stato = "inviato";
        ordineEsistente.riuscita = 0;
        ordineEsistente.rinvii = 0;
        return ordineEsistente;
    },
    // DELETE LOGICA
    async cancellaOrdine(id, reason) {
        await delay();
        const indice = dbSimulato.findIndex(o => o.id === id);
        if (indice === -1)
            throw new Error("Ordine non trovato");
        // Imposta isActive a false e salva il motivo
        dbSimulato[indice].isActive = false;
        dbSimulato[indice].reason = reason;
        return dbSimulato[indice];
    }
};
