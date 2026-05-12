# Documentazione Progetto (DOCS)

## Architettura e Design
Il progetto utilizza un'architettura modulare in puro TypeScript:
- `src/core/`: logica base, router (Hash routing basato su stringhe come `/#/admin`), state management.
- `src/services/`: interazioni con le API (JSONPlaceholder) e persistenza in memoria. Al caricamento iniziale, i dati vengono recuperati dall'API e salvati in variabili/store in locale. Tutte le successive operazioni di lettura/scrittura (anche dell'area Admin) avvengono su questo store in memoria per garantire consistenza dei dati tra le aree (Admin/Public).
- `src/components/`: componenti UI riutilizzabili (es. Navbar, Modal).
- `src/pages/`: logica e vista per le singole pagine (Public, Admin). Include il sistema di gestione Cestino nell'area Admin.
- `src/models/`: definizioni dei tipi e interfacce TypeScript. Ogni modello include una proprietà `isDeleted` per il supporto alla cancellazione logica.
- `src/styles/`: file CSS per la stilizzazione. Implementa un design system ispirato al Material Design con supporto a Light/Dark mode e stili dedicati per i Modali.

## Gestione dello Stato e Paginazione
L'applicazione utilizza un `Store` singleton che gestisce:
- I dati caricati in memoria (Post, Utenti, Commenti).
- Lo stato della paginazione per l'area pubblica.
- Lo stato della paginazione indipendente per ogni sezione dell'area admin (Post, Utenti, Commenti, Cestino).
Il sistema supporta il cambio dinamico del numero di elementi per pagina (`[5, 10, 15, 20, 25]`) e resetta la navigazione alla prima pagina ogni volta che vengono applicati filtri di ricerca per garantire la coerenza dei risultati.

## Endpoints iniziali (JSONPlaceholder)
- `/posts`: per recuperare i post al primo caricamento.
- `/users`: per recuperare gli autori.
- `/comments` o `/posts/:id/comments`: per i commenti relativi ai post.

## Area Admin e Autenticazione
L'accesso all'area amministrativa (`/#/admin`) è protetto da un sistema di autenticazione fittizio. 
- **Credenziali:** `admin` / `admin`.
- **Persistenza:** Lo stato di autenticazione viene mantenuto durante la sessione tramite `sessionStorage`.
- **Funzionalità:** Una volta autenticato, l'amministratore può gestire le entità del sistema tramite il pannello dashboard. È presente un pulsante di Logout nella barra laterale per terminare la sessione. Nella sezione Commenti è stato aggiunto un filtro per **PostID** per facilitare la ricerca dei commenti relativi a post specifici. Tutti i form all'interno dei modali includono ora una **validazione client-side** che evidenzia i campi mancanti e impedisce l'invio se non correttamente compilati.

*Questa documentazione verrà espansa man mano che il progetto si evolve.*
