# Product Requirements Document (PRD) - Area Pubblica

## 1. Contesto del Progetto
Il presente documento descrive le specifiche e i requisiti per la realizzazione di un'applicazione Web frontend reattiva, moderna e completamente responsive. La particolarità e la sfida principale di questo progetto risiedono nella sua natura tecnologica: l'intera applicazione deve essere sviluppata **esclusivamente in TypeScript puro (Vanilla TS)**, evitando deliberatamente l'impiego di librerie o framework UI di terze parti per la manipolazione del DOM e la gestione dello stato (come React, Vue.js, Angular o Svelte). 

L'applicazione funge da **interfaccia pubblica** per la visualizzazione di contenuti testuali generati da utenti. In una prima fase di inizializzazione, i dati vengono recuperati da un'infrastruttura di backend simulata tramite l'API REST pubblica **JSONPlaceholder**. Successivamente al caricamento iniziale, i dati (Post, Utenti e Commenti) vengono archiviati e gestiti in una struttura di memoria locale ottimizzata. Questo approccio permette all'applicazione di eseguire operazioni di filtraggio, ricerca e impaginazione in tempo reale senza dover continuamente interrogare il server esterno, garantendo una fluidità d'uso e tempi di risposta istantanei (Zero Latency) per l'utente finale.

L'adozione di TypeScript nativo impone una rigorosa architettura software. Sarà necessario implementare da zero pattern di progettazione robusti, come il Model-View-Controller (MVC) o architetture basate su Servizi e Store centralizzati, per garantire che la logica di business rimanga disaccoppiata dalla complessa gestione del rendering del DOM.

## 2. Obiettivi Principali
L'applicazione persegue molteplici obiettivi, sia dal punto di vista dell'esperienza utente sia da quello dell'ingegneria del software:

1. **Eccellenza nell'Esperienza Utente (UX):** fornire un'interfaccia estremamente intuitiva, in cui l'esplorazione dei post sia priva di attriti. La navigazione deve risultare fulminea, i cambi di stato (come l'applicazione di filtri) non devono presentare ritardi percettibili e l'impatto visivo deve essere pulito e professionale.
2. **Design Coerente e Moderno:** adottare fedelmente i principi del **Material Design**, implementandoli da zero attraverso CSS puro. Questo significa gestire in autonomia concetti come l'elevazione (ombre tramite `box-shadow`), la tipografia chiara e leggibile, gli spazi vuoti (whitespace) bilanciati e le transizioni fluide.
3. **Autonomia Architetturale:** dimostrare che è possibile costruire un'applicazione Single Page Application (SPA) complessa, dotata di routing, state management e reattività UI, senza dipendere dall'ecosistema dei framework moderni.
4. **Resilienza e Scalabilità del Codice:** sfruttare il sistema di tipizzazione forte (Strict Mode) di TypeScript per eliminare un'intera classe di bug a tempo di compilazione, definendo interfacce rigorose per i modelli dati e le firme dei metodi.
5. **Fruibilità Cross-Device:** garantire una fruizione perfetta su qualsiasi schermo, dal piccolo smartphone al monitor ultrawide, implementando un design fluido basato su griglie CSS (CSS Grid) e Flexbox.

## 3. Pubblico di Riferimento
Il prodotto è concepito per un'utenza generalista del web. Considerando la natura di "lettura e consultazione" dell'Area Pubblica, i profili utente principali sono:

- **Lettore Casuale (Mobile First):** utente che accede all'applicazione principalmente da smartphone durante i momenti di pausa. Ha bisogno di un caricamento iniziale rapido, testi grandi e ben leggibili, target tattili (bottoni, link) di dimensioni adeguate e una navigazione intuitiva. La Dark Mode per lui è fondamentale per il risparmio energetico e per la lettura in ambienti poco illuminati.
- **Ricercatore di Informazioni (Desktop):** utente che cerca contenuti specifici. Utilizza intensivamente la barra di ricerca testuale e i filtri per autore. Per questo utente, la reattività del sistema di ricerca e la precisione dell'impaginazione sono essenziali.
- **Utente Attento all'Accessibilità:** utente che potrebbe soffrire di affaticamento visivo o avere lievi deficit. Per questo motivo, l'applicazione impone vincoli stringenti sui contrasti colore (evitando il nero puro nella dark mode) e assicura che gli elementi interattivi siano chiaramente distinguibili dallo sfondo.

## 4. Requisiti Funzionali
L'elenco dei requisiti funzionali descrive minuziosamente cosa l'applicazione deve permettere di fare all'utente finale nell'Area Pubblica.

### 4.1. Caricamento Iniziale e Bootstrap dei Dati (Hydration)
- **FR-1.1:** al primo accesso all'applicazione (su root `/#/` o URL equivalente lato client), il sistema deve innescare un processo di fetch asincrono.
- **FR-1.2:** l'applicazione deve chiamare parallelamente o sequenzialmente gli endpoint di JSONPlaceholder: `/posts`, `/users` e `/comments`.
- **FR-1.3:** durante questa fase, l'interfaccia deve presentare un feedback visivo (es. Skeleton Loader o Spinner) per informare l'utente del caricamento in corso.
- **FR-1.4:** in caso di fallimento delle chiamate di rete, il sistema deve gestire l'errore elegantemente, mostrando un messaggio user-friendly e offrendo un pulsante per ritentare l'operazione.
- **FR-1.5:** una volta scaricati, tutti i dati devono essere normalizzati e salvati nello `Store` singleton in memoria. Le relazioni (ad esempio, associare un Utente al suo ID all'interno di un Post) devono essere risolte per ottimizzare le successive fasi di rendering.

### 4.2. Feed Principale
- **FR-2.1:** l'applicazione deve renderizzare una griglia o lista verticale di "Card" (PostCard), ciascuna rappresentante un singolo Post.
- **FR-2.2:** ogni PostCard deve esporre chiaramente: il **titolo** del post, uno **snippet del testo** (eventualmente troncato se troppo lungo con l'aggiunta di ellissi `...`), e il **nome dell'autore** chiaramente associato.
- **FR-2.3:** se un post dovesse presentare dati mancanti o corrotti, l'applicazione deve mostrare dei placeholder di fallback (es. "Autore sconosciuto" o "Titolo non disponibile").

### 4.3. Dettagli Post e Commenti
- **FR-3.1:** ogni PostCard deve offrire un'interazione esplicita (es. bottone "Mostra Commenti", "Espandi" o icona freccia) per rivelare i commenti associati a quello specifico post.
- **FR-3.2:** l'espansione dei commenti deve avvenire tramite un'animazione fluida (es. un dropdown a fisarmonica o un'area collassabile all'interno della card stessa).
- **FR-3.3:** la sezione commenti espansa deve elencare tutti i commenti, mostrando per ciascuno: **Nome/Email dell'autore del commento** e il **Corpo del commento**.
- **FR-3.4:** deve essere presente la possibilità di richiudere la sezione dei commenti tramite la stessa interazione utilizzata per aprirla (Toggle).

### 4.4. Ricerca Real-Time
- **FR-4.1:** l'interfaccia deve includere una barra di input testuale ben visibile, posizionata tipicamente nella parte superiore della vista principale o sotto la Navbar.
- **FR-4.2:** la ricerca deve essere "live": l'utente digita il testo e la lista dei post sottostante si aggiorna automaticamente a ogni tasto premuto (preferibilmente con l'implementazione di un meccanismo di *Debounce*, es. 300ms, per ottimizzare le performance in caso di digitazione estremamente rapida).
- **FR-4.3:** l'algoritmo di ricerca deve controllare la presenza della stringa digitata in modo *case-insensitive* (ignorando maiuscole/minuscole) sia nel campo `title` sia nel campo `body` di ogni singolo post nello Store.
- **FR-4.4:** se la ricerca non produce alcun risultato, la UI deve renderizzare uno stato "Empty" chiaro ed esplicativo (es. "Nessun post trovato per questa ricerca").

### 4.5. Filtraggio per Autore
- **FR-5.1:** accanto o in prossimità della barra di ricerca, deve esserci un elemento `<select>` (Menu a tendina) etichettato "Filtra per Autore".
- **FR-5.2:** il menu a tendina deve essere popolato dinamicamente analizzando la lista degli utenti recuperata da `/users`. La prima opzione deve essere una voce neutra come "Tutti gli autori" (valore predefinito).
- **FR-5.3:** alla selezione di un autore specifico, la lista dei post mostrata a schermo deve essere immediatamente limitata ai soli post la cui proprietà `userId` corrisponde a quella dell'autore selezionato.
- **FR-5.4:** i filtri (Ricerca testuale e Filtro per Autore) devono poter lavorare in **combinazione logica AND**. Ad esempio: cercare la parola "dolor" E filtrare per l'autore "Leanne Graham". L'interfaccia mostrerà solo i post di Leanne che contengono "dolor".

### 4.6. Paginazione Dinamica
- **FR-6.1:** i risultati (l'elenco dei post, post-filtraggio) non devono essere mostrati tutti in una volta, per preservare le performance del browser. Devono essere suddivisi in pagine logiche.
- **FR-6.2:** a fondo pagina, sotto l'elenco dei post, deve comparire un componente "Pagination Controls".
- **FR-6.3:** i controlli di paginazione devono includere bottoni per: "Pagina Precedente", "Pagina Successiva", "Prima Pagina" e "Ultima Pagina", oltre alla visualizzazione della pagina corrente rispetto al totale (es. "Pagina 2 di 5").
- **FR-6.4:** l'utente deve avere a disposizione un selettore (es. un altro `<select>`) per decidere la "Grandezza della Pagina" (Page Size), ovvero quanti post vedere simultaneamente a schermo. I valori ammessi e predefiniti sono strettamente: `[5, 10, 15, 20, 25]`.
- **FR-6.5:** **Reset Critico:** ogni singola volta che l'utente modifica la barra di ricerca, cambia l'autore selezionato o modifica la "Grandezza della Pagina", lo stato della paginazione deve *immediatamente e automaticamente* resettarsi alla Pagina 1. Questa regola previene stati inconsistenti (ad esempio, trovarsi a pagina 4 quando l'applicazione di un nuovo filtro riduce il totale dei risultati a sole 2 pagine).
- **FR-6.6:** i pulsanti "Precedente/Prima" devono essere disabilitati visivamente e logicamente se l'utente si trova a Pagina 1. Similmente per "Successiva/Ultima" se si trova all'ultima pagina disponibile.

### 4.7. Switch del Tema Visivo
- **FR-7.1:** la Navbar principale deve includere un pulsante interattivo ben visibile (preferibilmente con un'iconografia esplicativa, es. sole per la light mode, luna per la Dark Mode) per invertire il tema di sistema.
- **FR-7.2:** il tema predefinito al primo accesso deve essere la Light Mode.
- **FR-7.3:** il click sul toggle deve commutare istantaneamente il set di colori di tutta l'applicazione (sfondi, testi, bordi, ombre) basandosi sull'aggiornamento di variabili CSS (CSS Custom Properties). Il cambio non deve comportare in alcun modo il ricaricamento della pagina o la perdita dello stato di scroll o di navigazione.
- **FR-7.4 (Opzionale):** salvare la preferenza dell'utente nel `localStorage` o `sessionStorage` in modo che un ricaricamento manuale della pagina (F5) mantenga l'impostazione visiva scelta.

## 5. Requisiti Non Funzionali (NFR)

### 5.1. Vincoli Tecnologici
- L'applicazione **DEVE** essere scritta in TypeScript Vanilla. Il file `tsconfig.json` deve prevedere l'opzione `"strict": true` abilitata. Non sono ammessi errori di tipo `any` impliciti.
- L'uso di librerie esterne per la gestione del DOM (jQuery, React, ReactDOM, Lodash) è tassativamente vietato. Tutte le manipolazioni (creazione, aggiornamento e rimozione di elementi HTML) devono avvenire nativamente tramite l'API DOM standard del browser (`document.createElement`, `Element.innerHTML`, `Element.appendChild`, `Element.classList`, ecc.).

### 5.2. Regole di Design System
- **Architettura CSS:** il CSS deve essere scritto "a mano" senza pre-processori complessi (SASS/LESS sono opzionali ma si consiglia Vanilla CSS moderno) e senza framework CSS come Tailwind o Bootstrap.
- **Variabili CSS:** l'intero color scheme deve poggiare su variabili dichiarate nel blocco `:root`. Per esempio: `--primary-color`, `--surface-color`, `--text-main`, `--text-muted`. Al cambio tema, una classe globale (es. `body.dark-theme`) deve rassegnare questi valori.
- **Tipografia:** scegliere font stack moderni e leggibili senza grazie (sans-serif), come Roboto (standard Material), Inter o Segoe UI. Definire una gerarchia chiara (H1, H2, testine, paragrafi).
- **Elevazione (Elevation):** nel Material Design la profondità e l'importanza gerarchica si comunicano tramite le ombre. Implementare un sistema a livelli (es. `.elevation-1`, `.elevation-2`) mappati su `box-shadow` CSS precise per definire card e modali.
- **Transizioni:** tutti gli elementi interattivi (pulsanti hover, card hover, toggle del tema, apertura commenti) devono avere transizioni morbide e naturali (`transition: all 0.2s ease-in-out`).

### 5.3. Accessibilità
- **Contrasto Colori:** soprattutto nella modalità Dark, il colore di sfondo principale non deve **mai** essere il nero assoluto `#000000`, in quanto provoca un elevato affaticamento visivo noto come "effetto alonatura" o "smearing" sugli schermi OLED. Utilizzare tonalità di grigio molto scuro (es. `#121212`, `#1e1e1e` o un dark blue/slate come `#0f172a`).
- I testi principali su sfondi scuri non devono essere bianco puro `#ffffff`, ma leggermente smorzati (es. `#e0e0e0` o `rgba(255,255,255, 0.87)`) per la stessa ragione di comfort visivo.
- Tutti i form, input di ricerca, bottoni e selettori (`<select>`) devono possedere stati visivi espliciti per il focus da tastiera (es. `outline` evidente) per supportare la navigazione via tab.
- Uso semanticamente corretto dell'HTML (uso di `<header>`, `<main>`, `<nav>`, `<article>` per i post, `<aside>`).

### 5.4. Hash Routing
- L'applicazione essendo una SPA necessita di un proprio Router implementato in Vanilla JS/TS.
- Questo router si baserà sull'ascolto dell'evento `hashchange` sull'oggetto `window`.
- L'URL della pagina cambierà unicamente nella porzione dell'ancora. Esempi: `mio-sito.com/#/` (Area Pubblica). La logica del router analizzerà la stringa dopo il `#` per innescare la logica di montaggio della pagina corretta.

### 5.5. Gestione dello Stato
- Tutta l'intelligenza applicativa e la sorgente di verità dei dati risiedono nel `Store` singleton (Pattern Observer o un semplice Store con meccanismi di callback).
- La view (Area Pubblica) deve iscriversi (o comunque rispondere in modo reattivo) alle mutazioni di questo Store.
- Quando i dati nello store cambiano (ad esempio l'utente applica un filtro), la View responsabile del feed dei post deve svuotare l'attuale contenitore HTML dei post (`innerHTML = ''`) e ricreare in sequenza e renderizzare i nuovi nodi DOM corrispondenti alla vista aggiornata. Questo processo di pulizia e ricreazione deve essere il più ottimizzato possibile, creando document fragment prima dell'inserimento nel DOM per limitare i "reflow" della pagina.

## 6. Stack Tecnologico
Perché queste tecnologie?

1. **TypeScript (Linguaggio Base):** l'uso di tipizzazione statica garantisce che le interfacce per la struttura dati dei Post, dei Commenti e degli User fornita da JSONPlaceholder corrisponda sempre a quanto il frontend si aspetta di elaborare. I modelli espliciti prevengono errori di "undefined is not an object" in runtime.
2. **Vanilla HTML/CSS/DOM API:** favorisce la comprensione profonda dei meccanismi base del browser e garantisce un output estremamente leggero. Nessuna dipendenza complessa in produzione significa nessun framework overhead e performance di esecuzione grezze molto veloci (Vanilla è imbattibile per piccoli scarti del DOM).
3. **Vite (Bundler e Dev Server):** scelto per la sua eccezionale velocità in ambiente di sviluppo (Hot Module Replacement istantaneo basato sui moduli ES nativi). Vite compilerà e raggrupperà l'applicazione TypeScript e i file CSS per l'ambiente di produzione in asset ottimizzati e minificati.
4. **JSONPlaceholder (API Mock):** standard del settore per simulare un backend con risorse relazionali (Posts che appartengono a User e che hanno Comments associati) senza dover allestire un vero server database per questo progetto.

## 7. Architettura del Progetto
Di seguito la mappatura esaustiva della struttura delle directory necessarie per supportare questa architettura disaccoppiata (limitata al solo focus dell'Area Pubblica):

```text
src/
├── core/
│   ├── router.ts           # Definisce la classe Router. Si registra sull'evento window.hashchange.
│   │                       # Associa le rotte testuali alle funzioni di "montaggio" della vista.
│   └── store.ts            # Implementa lo State Management globale. Un singleton class o object 
│                           # contenente array di dati raw (posts, users), lo stato attuale 
│                           # (currentSearch, currentAuthorId) e lo stato della paginazione
│                           # (currentPage, itemsPerPage). Deve esporre i metodi pubblici per 
│                           # filtrare i dati che la UI andrà a interrogare.
│
├── services/
│   └── api.ts              # Contiene chiamate `fetch()` isolate verso JSONPlaceholder. 
│                           # Classe o modulo puramente asincrono che espone funzioni come 
│                           # fetchAllData(). Nessuna logica di UI è permessa qui.
│
├── models/                 # Il "Contratto" dell'applicazione. Solo TypeScript type o interface.
│   ├── Post.ts             # `interface Post { id: number, userId: number, title: string, body: string, isDeleted?: boolean }`
│   ├── Comment.ts          # `interface Comment { id: number, postId: number, name: string, email: string, body: string }`
│   └── User.ts             # `interface User { id: number, name: string, username: string, email: string }`
│
├── components/             # Fabbriche (Factories) o Classi per generare porzioni riutilizzabili di DOM.
│   ├── Navbar.ts           # Genera l'intestazione, il branding e la logica del bottone Toggle Theme.
│   ├── PostCard.ts         # Genera il blocco HTML di un post. Logica interna per l'ascolto 
│   │                       # del click per aprire la sezione Commenti sottostante.
│   ├── Pagination.ts       # Riceve i parametri (totale pagine, pagina attuale, size) e genera
│   │                       # bottoni disabilitati/abilitati. Lancia eventi o callback quando utente interagisce.
│   └── SearchFilter.ts     # Genera `<input type="text">` e `<select>`. Gestisce l'evento  
|                           # "input" con debounce.
│
├── pages/
│   └── public/
│       ├── index.ts        # Controller della Pagina Pubblica. Inizializza tutto, chiede allo store 
│       │                   # i dati correnti, e orchestra i componenti per "appendere" la roba a schermo.
│       └── view.ts         # Contiene la "scatola vuota" HTML (template literals). Es. `<div id="public-layout">
│                           # <div id="filters-container"></div> <div id="posts-grid"></div> 
|
│                           # Il controller (index.ts) inietta i componenti dinamici qui
|                           # dentro.
│
├── styles/                 # Foglio di stile granulare per facile manutenzione.
│   ├── _variables.css      # Definizione delle CSS Custom Properties (:root e body.dark-theme)
│   ├── _reset.css          # Reset di margini, padding e box-sizing
│   ├── layout.css          # Regole Grid/Flexbox generali per la struttura della pagina
│   ├── components.css      # Regole Material Design (Shadows, Card hover states, Inputs focus, buttons)
│   └── main.css            # Punto di ingresso che importa (tramite @import) tutti i file precedenti.
│
└── main.ts                 # Entry point assoluto di Vite. Istanzia il Router e inizializza lo Store.
```

## 8. Flussi Utente Analitici

### Flusso 1: Navigazione base e Lettura
1. **Avvio:** l'utente accede all'URL base (es. localhost:5173/#/).
2. **Setup:** il file `main.ts` intercetta la rotta vuota e la redirige internamente alla logica `pages/public/index.ts`.
3. **Caricamento:** la UI renderizza un header con uno skeleton e un messaggio "Caricamento in corso...". Il modulo `api.ts` invoca le API remote.
4. **Popolamento Dati:** ricevuti i dati, lo `store.ts` memorizza Post, Utenti e Commenti all'interno di array centrali privati.
5. **Render Iniziale:** il controller pubblico estrae la "Pagina 1" dallo Store, invoca le factory dei componenti (`SearchFilter`, multipli `PostCard`, e `Pagination`) e le appende all'interno del nodo `#app` o container principale.
6. **Interazione (Espandi):** l'utente fa scroll, individua un post interessante e clicca su "Mostra 4 Commenti".
7. **Aggiornamento Locale DOM:** l'evento click, delegato o ascoltato sulla specifica PostCard, cambia una classe CSS che espande in altezza il contenitore dei commenti precedentemente nascosto (`display: none` o `height: 0`), mostrando l'elenco testuale recuperato dallo store per quell'`id` di post.

### Flusso 2: Ricerca, Filtri ed Eventuale Reset
1. L'utente si trova a "Pagina 3" leggendo vari post.
2. L'utente decide di cercare post su un argomento. Si posiziona sulla barra di ricerca e digita la parola "Optio".
3. L'evento `input` o `keyup` sulla barra (gestito in `SearchFilter.ts`) fa scattare un timeout (Debounce). Se l'utente smette di digitare per 300 millisecondi, viene invocato un metodo `store.setSearchQuery("Optio")`.
4. Lo `store.ts` riceve l'input:
   - Aggiorna il suo stato interno `currentSearchQuery = "Optio"`.
   - **Cruciale:** imposta la variabile interna `currentPage = 1`.
   - Ricalcola un array derivato, noto come `filteredPosts`, iterando su tutti i post in memoria e filtrando solo quelli contenenti la stringa.
   - Comunica (tramite callback o re-render manuale) al controller pubblico che i dati sono mutati.
5. Il controller pubblico distrugge i vecchi nodi DOM dentro la griglia post. Richiede allo store i post (ora che il filtro è applicato, lo store restituirà solo uno *slice* dell'array `filteredPosts` corrispondente ai primi 10 elementi di "optio").
6. Il controller re-inietta le nuove `PostCard` limitate al risultato.
7. La componente `Pagination.ts` viene re-renderizzata per riflettere il nuovo totale di pagine (che sarà crollato a 1 o 2) e indicando l'utente posizionato su "Pagina 1".

### Flusso 3: Temi Visivi
1. L'utente (magari in una stanza buia) prova fastidio dal riverbero bianco dello schermo.
2. Identifica in alto a destra nella Navbar un'icona (es. switch luna/sole).
3. L'evento `click` esegue una funzione molto semplice: `document.body.classList.toggle('dark-theme')`.
4. Istantaneamente, tutte le regole CSS applicate all'interno di `.dark-theme { --background: #121212; --text-main: #e0e0e0; ... }` sovrascrivono la `:root` base. L'intera interfaccia pubblica assume un colore grigio scuro e accogliente, i bordi diventano leggermente più visibili per distacco di contrasto, senza che il flusso logico del codice debba ricaricare componenti o chiamare API.

## 9. Milestone e Priorità
Ogni Milestone rappresenta un incremento di valore funzionante dell'applicazione.

**Milestone 1: Skeleton, Core Logic e Infrastruttura (Criticità Estrema)**
*Deliverables:* 
- Configurazione Vite e `tsconfig.json` super restrittivo.
- Creazione cartelle e file dummy (struttura vuota).
- Dichiarazione delle interfacce (`Post.ts`, `User.ts`, ecc.).
- Stesura del `router.ts` basilare capace di ascoltare l'hash e stampare un console.log della pagina corrente.
- Creazione della scatola nera dello `store.ts`.

**Milestone 2: Integrazione Dati Asincrona e Model Population (Criticità Estrema)**
*Deliverables:*
- Creazione della logica in `api.ts` con i blocchi `try...catch` asincroni per le fetch.
- Collegamento dell'inizializzazione del router alla chiamata dati.
- Riempimento delle variabili globali nello Store. Mappatura degli utenti sui post per ottimizzare la visualizzazione del nome autore.

**Milestone 3: Lo Scheletro Visivo e Material Design in CSS (Priorità Alta)**
*Deliverables:*
- Configurazione variabili colore in `index.css`.
- Costruzione del layout generale della pagina tramite CSS Grid.
- Costruzione del framework Navbar (con il pulsante toggle tema statico).
- Realizzazione delle logiche "Vanilla DOM" per le `PostCard` (Titolo e corpo limitato) e ciclo iterativo manuale per stamparle tutte a schermo (senza ancora paginazione).

**Milestone 4: L'Anima Interattiva: Filtri e Ricerca (Priorità Alta)**
*Deliverables:*
- Creazione barra di ricerca e select popolata iterativamente con gli Utenti.
- Logica di Debounce e passaggio dei dati allo Store.
- Algoritmo di filtro nello Store (`array.filter`, `string.includes`).
- Logica di distruzione controllata (`innerHTML = ''`) e rigenerazione DOM efficiente all'applicazione dei filtri.

**Milestone 5: Paginazione Avanzata (Priorità Alta)**
*Deliverables:*
- Logica matematica nello store (`slice(startIndex, endIndex)`, calcolo `Math.ceil(total / limit)`).
- Creazione dei bottoni di navigazione in basso e selettore limit (`[5, 10, ... ]`).
- Regola aurea implementata e testata intensivamente: la pagina torna forzatamente alla 1 a ogni cambio filtro.

**Milestone 6: UX Polish, Commenti e Tema Scuro Funzionante (Priorità Media - Rifinitura)**
*Deliverables:*
- Attivazione della classe `dark-theme` tramite toggle navbar. Affinamento dei colori in base alle direttive di "evitare il nero 100%".
- Funzionalità "Mostra/Nascondi Commenti" implementata in modo performante sotto ogni PostCard, evitando query DOM dispendiose ripetute.
- Gestione di transizioni fluide e stati Hover "Material" per le card (ombre morbide all'appoggio del mouse).

**Milestone 7: Quality Assurance (QA) e Responsive Check (Priorità Normale)**
*Deliverables:*
- Test manuali simulando schermi da 320px (iPhone SE) fino a 1920px per garantire l'adattabilità della griglia.
- Simulazione di errori di rete (throttling su DevTools) per testare le funzioni "skeleton loader" e fallback degli errori in Area Pubblica.

## 10. Gestione del Rischio: Punti Critici e Mitigazioni
Sviluppare senza framework espone l'architettura a rischi fisiologici e colli di bottiglia che nei moderni stack sono mascherati. Di seguito l'elenco dei rischi con relativa prevenzione.

- **RISCHIO 1: DOM Thrashing e Rallentamenti del Browser**
  - *Problema:* Una ricerca istantanea che causa lo svuotamento continuo e la rigenerazione riga per riga di dozzine di nodi HTML può causare layout thrashing, portando l'applicazione a sembrare "scattosa".
  - *Mitigazione:* Implementare obbligatoriamente un `DocumentFragment` (`document.createDocumentFragment()`). Quando si genera una nuova pagina di post, tutti gli elementi Node figli vengono appesi nel frammento in memoria e, solo al termine del ciclo, l'intero frammento viene agganciato al DOM reale in un'unica operazione di painting.

- **RISCHIO 2: Memory Leak da Event Listeners Orfani**
  - *Problema:* Quando i post vengono filtrati o l'utente cambia pagina, i vecchi nodi HTML dei post vengono scartati e rimossi, ma se contengono event listener (es. il pulsante per mostrare i commenti) agganciati direttamente all'elemento interno senza delegazione, questi rimarranno allocati in memoria dal Garbage Collector.
  - *Mitigazione:* Utilizzare in maniera preponderante il pattern della **Event Delegation**. Piuttosto che agganciare 20 listener ai 20 pulsanti dei commenti, agganciare un singolo Listener al container padre (`#posts-grid`). Quando scatta il click, analizzare in risalita l'`event.target` per determinare quale card ha emesso l'interazione.

- **RISCHIO 3: Desincronizzazione dello Stato tra UI e Store**
  - *Problema:* Siccome non si sfrutta il two-way data binding, il valore del menu a tendina o l'input testuale potrebbe differire da ciò che lo store "crede" che sia, soprattutto se non si gestisce la direzione univoca dei dati (Unidirectional Data Flow).
  - *Mitigazione:* Istituire che il flusso sia a singola via. La UI raccoglie un evento dell'utente e lo notifica allo Store. È solo ed esclusivamente lo Store che, alterando il suo stato interno, innesca una reazione "a cascata" che porta al refresh controllato dei componenti UI coinvolti, leggendo i dati sorgente.

- **RISCHIO 4: Leggibilità Inappropriata per Dark Mode Accessibile**
  - *Problema:* Sovrapposizione fallimentare delle regole CSS tra stili chiari ed elementi specifici (es. select box, testi secondari), portando a scritte scure su sfondi scuri che eludono le linee guida di accessibilità.
  - *Mitigazione:* Approccio disciplinato alla costruzione del file `_variables.css`. Mai hard-codare codici colore esadecimali all'interno dei componenti (es. `color: #333`). Utilizzare unicamente referenze astratte `color: var(--text-main)`, garantendo che queste variabili siano meticolosamente aggiornate nello scope globale `.dark-theme`. L'utilizzo degli strumenti "Lighthouse" e "Color Contrast" nei browser DevTools sarà fondamentale.
