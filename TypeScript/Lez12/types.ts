/*
Il piatto deve avere un type (“antipasto”, “primo”, “secondo”, “dessert”, “bevande”) e il cliente deve
essere una persona oppure un’azienda, nel primo caso i dati sono id, type, nome e cognome,
nel secondo sono id, type, nome (ragione sociale) e tipo di azienda (“SaS”, “Srl” o “SpA”).
Usare i discriminatori per distinguere i due tipi di cliente.
*/

type BaseCliente = {
    id: number,
    nome: string
}

type Persona = BaseCliente & {
    tipo: "persona",
    cognome: string
}

export type FormaSocietaria = "SaS" | "Srl" | "SpA";

type Azienda = BaseCliente & {
    tipo: "azienda",
    formaSocietaria: FormaSocietaria
}

export type Cliente = Persona | Azienda;

export type TipoPiatto = "antipasto" | "primo" | "secondo" | "dessert" | "bevanda";

export type Piatto = {
    readonly id: number;
    tipo: TipoPiatto;
    nome: string;
    cliente: Cliente;
    stato: "creato" | "inviato" | "in preparazione" | "pronto" | "fallito";
    riuscita: number;
    rinvii: number;
    element: HTMLDivElement;
    isActive: boolean; // per la cancellazione logica
    reason?: string;   // motivo della cancellazione (opzionale perché presente solo se isActive = false)
}

export type AggiornaPiatto = Partial<Pick<Piatto, 'nome' | 'cliente' | 'tipo'>>;
