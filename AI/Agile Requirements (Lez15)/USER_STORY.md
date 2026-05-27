# US-006: Paginazione Dinamica e Gestione Densità Risultati nell'Area Pubblica

## Statement
**Come** utente dell'Area Pubblica (sia in mobilità che da desktop),
**voglio** poter sfogliare i risultati dei post suddivisi in pagine numerate e decidere la quantità di contenuti da visualizzare contemporaneamente a schermo,
**affinché** la navigazione dell'applicazione risulti sempre rapida, fluida e l'interfaccia rimanga pulita senza sovraccaricare il mio dispositivo.

## Contesto / Descrizione
In conformità con gli obiettivi di UX e i vincoli architetturali del progetto (Vanilla TypeScript SPA), tutti i dati dei post vengono archiviati in memoria in un unico "Store" centralizzato a seguito della prima fase di fetch (Zero Latency approach). Per evitare il fenomeno del "DOM Thrashing" e mantenere prestazioni eccellenti nel browser, non è possibile stampare a schermo l'intero dataset simultaneamente.
Questa funzionalità implementa un sistema di paginazione dinamica tramite il componente `Pagination Controls` posizionato in calce al feed. Oltre a permettere la navigazione tra "chunk" di dati definiti da un selettore di "Page Size", la funzionalità introduce un meccanismo di *Reset Critico* reattivo: la paginazione è intimamente legata allo stato dei filtri (Ricerca testuale e Autore) e deve auto-correggersi istantaneamente a ogni mutazione di questi ultimi, prevenendo l'esposizione di pagine vuote o stati inconsistenti.

## Criteri di Accettazione (Acceptance Criteria)

### Scenario 1: Rendering e Layout dei Controlli di Navigazione
* **Dato** che l'utente visualizza l'elenco dei post nella pagina principale.
* **Quando** scorre la visualizzazione fino al fondo della lista dei risultati.
* **Allora** deve essere renderizzato un componente dedicato ("Pagination Controls") posto sotto l'ultima Card mostrata.
* **E** il componente deve esporre i seguenti quattro pulsanti di controllo: `Prima Pagina`, `Pagina Precedente`, `Pagina Successiva`, `Ultima Pagina`.
* **E** tra i pulsanti deve essere visibile un indicatore testuale dinamico che esprima in modo inequivocabile la posizione corrente rispetto al totale (es. *"Pagina 2 di 5"*).

### Scenario 2: Selezione della Grandezza della Pagina (Page Size)
* **Dato** che i controlli di paginazione sono attivi a schermo.
* **Quando** l'utente esamina il componente di paginazione.
* **Allora** deve essere presente un elemento interattivo a tendina (`<select>`) esplicitamente dedicato alla scelta dei risultati per pagina.
* **E** i valori consentiti e selezionabili in questa lista devono essere tassativamente e unicamente: `[5, 10, 15, 20, 25]`.
* **E** non appena l'utente effettua una nuova selezione, la griglia dei post si aggiorna all'istante mostrando il numero esatto di Card richiesto (se disponibili nel dataset).

### Scenario 3: Logica Visiva e Funzionale di Disabilitazione dei Pulsanti
* **Dato** che l'utente sta interagendo con la paginazione.
* **Quando** si trova esattamente alla **Pagina 1** dei risultati.
* **Allora** i pulsanti `Prima Pagina` e `Pagina Precedente` devono assumere uno stato visivamente disabilitato (es. opacità ridotta, cursore non permesso) e non devono produrre alcun effetto logico al click.
* **Quando** l'utente si trova all'**Ultima Pagina** disponibile (valore derivato matematicamente da totale post e page size).
* **Allora** i pulsanti `Pagina Successiva` e `Ultima Pagina` devono essere visivamente e logicamente disabilitati.
* **Quando** la ricerca o il totale dei post limitano l'intero dataset a una singola pagina.
* **Allora** tutti e quattro i pulsanti di navigazione devono essere posti in stato disabilitato.

### Scenario 4: "Reset Critico" in reazione alle mutazioni dello Store
* **Dato** che l'utente si trova attualmente in uno stato di navigazione avanzato (es. a Pagina 4).
* **Quando** compie una qualsiasi di queste tre azioni di alterazione dello stato:
    1.  Digita una nuova stringa nella barra di ricerca in tempo reale (FR-4).
    2.  Modifica la selezione nel `<select>` "Filtra per Autore" (FR-5).
    3.  Modifica il valore numerico nel `<select>` del "Page Size" (FR-6.4).
* **Allora** lo stato logico della paginazione memorizzato nello `Store` deve subire un override immediato ripristinandosi automaticamente a `Pagina 1`.
* **E** la UI deve rispondere a questo cambiamento ripopolando la griglia con i risultati corrispondenti alla prima pagina per i nuovi criteri applicati.

### Scenario 5: Vincoli Tecnici e Architetturali (Vanilla TS)
* **Dato** il task di sviluppo del componente `components/Pagination.ts`.
* **Quando** il componente viene istanziato, agganciato al DOM e quando viene distrutto per un re-render.
* **Allora** il suo markup deve essere generato esclusivamente tramite DOM API standard senza alcun framework (`document.createElement`, ecc.) e fortemente tipizzato (`Strict Mode` attivata).
* **E** per mitigare il *Rischio 2 (Memory Leak)* individuato nel PRD, i listener legati agli eventi `click` e `change` della paginazione devono essere gestiti tramite Event Delegation sul container padre o, in alternativa, rigorosamente rimossi in fase di *garbage collection* manuale prima di uno svuotamento del contenitore (`innerHTML = ''`).