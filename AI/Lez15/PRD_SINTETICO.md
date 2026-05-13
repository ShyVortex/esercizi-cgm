# Product Requirements Document (PRD) Sintetico - Public Interface

## 1. Contesto del Progetto
Il progetto consiste nello sviluppo di un'applicazione web moderna e altamente interattiva, realizzata interamente in **TypeScript puro** (Vanilla TypeScript). L'applicazione si appoggia inizialmente alle API pubbliche di [JSONPlaceholder](https://jsonplaceholder.typicode.com/) per il recupero dei dati, ma implementa un sistema di gestione dello stato in locale per garantire persistenza e coerenza durante la sessione utente.

## 2. Obiettivo del Prodotto
L'obiettivo primario è offrire agli utenti una piattaforma fluida e performante per la consultazione di contenuti (Post) e interazioni (Commenti). L'interfaccia deve essere intuitiva, accessibile e visivamente appagante, seguendo i principi del **Material Design**.

## 3. Target Utente
- **Utenti Generici**: Persone interessate a consultare post informativi, leggere commenti e filtrare i contenuti in base ai propri interessi o autori preferiti.
- **Soggetti attenti all'accessibilità**: Utenti che necessitano di interfacce chiare, contrasti armoniosi e supporto per diverse modalità di visualizzazione (Dark/Light mode).

## 4. Requisiti Funzionali (Area Pubblica)

### 4.1. Visualizzazione Post
- L'utente deve poter visualizzare una lista di post in formato "card" o lista responsive.
- Ogni post deve mostrare titolo, un'anteprima del corpo del testo e l'autore.

### 4.2. Dettaglio Post e Commenti
- Cliccando su un post, l'utente deve poter accedere alla vista di dettaglio.
- La vista di dettaglio deve mostrare il contenuto completo del post e la sezione commenti associata.
- Ogni commento deve mostrare il nome del commentatore e il testo del messaggio.

### 4.3. Ricerca e Filtri
- **Ricerca Testuale**: Barra di ricerca globale per filtrare i post in base al titolo (`title`) o al corpo (`body`). La ricerca deve essere in tempo reale o attivabile tramite invio.
- **Filtro Autore**: Possibilità di selezionare un autore specifico per visualizzare solo i post redatti da quest'ultimo.

### 4.4. Sistema di Paginazione
- La lista dei post deve essere paginata per ottimizzare il caricamento e la leggibilità.
- Opzioni elementi per pagina: `[5, 10, 15, 20, 25]`.
- Navigazione tra le pagine (Avanti, Indietro, Prima, Ultima).
- Reset automatico alla prima pagina in caso di applicazione di nuovi filtri o ricerche.

### 4.5. Tema e Personalizzazione
- Supporto nativo per **Light Mode** (default) e **Dark Mode**.
- Toggle switch per il cambio tema persistente (opzionalmente in `localStorage`).
- Palette colori: Evitare neri puri (#000000) per ridurre l'affaticamento visivo; utilizzare tonalità di grigio profondo e contrasti morbidi.

## 5. Requisiti Non Funzionali

### 5.1. Performance e Architettura
- **Bundler**: Utilizzo di Vite per tempi di build rapidi e Hot Module Replacement.
- **Modularità**: Separazione netta tra logica di business (Servizi), gestione dello stato (Store), routing (Router) e componenti UI.
- **TypeScript Strict**: Tipizzazione forte per ridurre errori a runtime e migliorare la manutenibilità.

### 5.2. UI/UX
- **Material Design**: Utilizzo di ombreggiature, transizioni fluide e componenti standardizzati.
- **Responsiveness**: Layout fluido che si adatta a Mobile, Tablet e Desktop (approccio Mobile-First).
- **Accessibilità**: Contrasti conformi alle linee guida WCAG, utilizzo di HTML semantico.

### 5.3. Routing
- **Hash-based Routing**: Navigazione gestita tramite l'URL hash (es. `#/`, `#/post/1`) per compatibilità con hosting statici senza configurazione lato server.

## 6. Stack Tecnologico
- **Linguaggio**: TypeScript 5.x
- **Build Tool**: Vite
- **Styling**: CSS Moderno (Custom Properties per i temi)
- **API**: JSONPlaceholder (REST)
- **Persistenza**: In-memory store con sincronizzazione locale.

## 7. Architettura di File e Cartelle (Public focus)

```text
src/
├── core/               # Motore dell'app (Router, State Engine)
├── models/             # Interfacce e Tipi (Post.ts, User.ts, Comment.ts)
├── services/           # Logica di comunicazione
│   ├── api.ts          # Configurazione base fetch
│   ├── PostService.ts  # Gestione dati Post
│   ├── UserService.ts  # Gestione dati Utenti
│   ├── CommentService.ts # Gestione dati Commenti
│   └── Store.ts        # Singleton per lo stato globale dei dati
├── components/         # Componenti UI riutilizzabili
│   ├── Navbar.ts       # Barra di navigazione con ricerca e tema
│   ├── Pagination.ts   # Logica e UI della paginazione
│   └── Modal.ts        # Sistema di modali per interazioni (se necessarie)
├── pages/
│   └── public/         # Viste della parte pubblica
│       ├── Home.ts     # Lista post, filtri e ricerca
│       └── PostDetail.ts # Visualizzazione singola e commenti
├── styles/             # Design System (variabili, global, dark-mode)
└── main.ts             # Entry point e inizializzazione
```

## 8. Flussi Utente (User Flows)

1. **Accesso**: L'utente atterra sulla `Home`. L'app recupera i dati dalle API (se non presenti in memoria) e popola lo `Store`.
2. **Consultazione**: L'utente scorre i post, usa la paginazione per cambiare pagina.
3. **Ricerca**: L'utente digita nella barra di ricerca; la lista si aggiorna dinamicamente mostrando i risultati pertinenti.
4. **Filtro**: L'utente seleziona un autore dal dropdown; l'app mostra solo i post di quell'autore.
5. **Dettaglio**: L'utente clicca su un post; il Router intercetta il cambio hash, carica `PostDetail` e visualizza i contenuti completi con i relativi commenti.
6. **Switch Tema**: L'utente preme il toggle Dark Mode; le variabili CSS cambiano istantaneamente l'aspetto del sito.

## 9. Milestone e Priorità

| Fase | Descrizione | Priorità |
| :--- | :--- | :--- |
| **M1** | Architettura Core (Router, Store) e Setup Vite | Alta |
| **M2** | Servizi API e sincronizzazione dati in memoria locale | Alta |
| **M3** | Layout Base (Navbar, Footer) e Supporto Dark Mode | Media |
| **M4** | Implementazione Home (Lista Post, Cards) | Alta |
| **M5** | Logica di Ricerca, Filtro Autore e Paginazione | Alta |
| **M6** | Pagina Dettaglio Post e Caricamento Commenti | Alta |
| **M7** | Rifiniture UX/UI (Animazioni, Feedback caricamento) | Bassa |

## 10. Punti Critici e Rischi

1. **Consistenza dei Dati**: Poiché i dati sono gestiti in memoria locale (Store), un refresh completo della pagina riporterà i dati allo stato iniziale dell'API (perdendo eventuali modifiche effettuate durante la sessione, a meno di implementare persistenza in `localStorage`).
2. **Performance con Grossi Dataset**: Sebbene JSONPlaceholder fornisca pochi dati, l'architettura deve essere pronta a gestire centinaia di record senza rallentare il DOM.
3. **Routing Hash**: La gestione dell'hash richiede attenzione per evitare collisioni e garantire che il tasto "Indietro" del browser funzioni correttamente.
4. **Accessibilità in Dark Mode**: Mantenere un contrasto leggibile tra testo e sfondi scuri senza affaticare gli occhi richiede test rigorosi sui colori scelti.
