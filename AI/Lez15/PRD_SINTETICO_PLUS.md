# Product Requirements Document (PRD) Sintetico - Area Pubblica

## 1. Contesto del Progetto
Applicazione Web frontend SPA sviluppata **esclusivamente in Vanilla TypeScript**, senza framework UI. I dati (Post, Utenti, Commenti) sono forniti dall'API REST **JSONPlaceholder** e gestiti tramite uno Store in memoria locale per garantire filtraggio, ricerca e paginazione con latenza zero (Zero Latency). L'architettura richiede pattern robusti (es. MVC) per disaccoppiare logica di business e manipolazione del DOM.

## 2. Obiettivi Principali
1. **UX d'Eccellenza:** Interfaccia fulminea e priva di attriti.
2. **Material Design:** Implementato da zero in puro CSS (elevazione, tipografia, spaziature).
3. **Autonomia Architetturale:** Gestione nativa di routing, stato e DOM.
4. **Resilienza:** Sfruttamento della Strict Mode di TypeScript per azzerare bug a runtime.
5. **Responsive:** Layout fluido (CSS Grid/Flexbox) cross-device.

## 3. Pubblico di Riferimento
- **Lettore Casuale (Mobile):** Necessita di caricamento rapido, target tattili ampi e Dark Mode.
- **Ricercatore (Desktop):** Utilizzo intensivo di filtri e barra di ricerca.
- **Utente Attento all'Accessibilità:** Richiede contrasti accurati e chiara navigabilità.

## 4. Requisiti Funzionali (FR)
- **4.1 Bootstrap:** Fetch asincrono parallelo iniziale (posts, users, comments) con Skeleton Loader e salvataggio nello Store centralizzato.
- **4.2 Feed Principale:** Rendering a griglia/lista di `PostCard` contenenti titolo, snippet di testo e nome autore.
- **4.3 Commenti:** Sezione espandibile fluidamente in ogni post per visualizzare i relativi commenti (toggle).
- **4.4 Ricerca Live:** Barra testuale *case-insensitive* su titolo/body con meccanismo di **Debounce** (es. 300ms).
- **4.5 Filtro Autore:** Menu a tendina `<select>` combinabile con la ricerca testuale in **logica AND**.
- **4.6 Paginazione:** - Controlli (Prima, Precedente, Successiva, Ultima) e selettore "Grandezza Pagina".
  - **Reset Critico:** Ritorno automatico a Pagina 1 ad ogni cambio di filtro, ricerca o size.
- **4.7 Tema Visivo:** Toggle Light/Dark mode istantaneo basato su variabili CSS, senza reload della pagina.

## 5. Requisiti Non Funzionali (NFR)
- **Vincoli:** Strict mode di TypeScript; manipolazione nativa con DOM API; divieto assoluto di framework UI esterni.
- **Design:** CSS scritto a mano (variabili in `:root`, niente nero puro nella dark mode, ombre a livelli per l'elevazione).
- **Accessibilità:** Stati di focus visibili da tastiera e tag semantici HTML5.
- **Routing:** Router nativo basato sull'evento `window.hashchange`.
- **Stato:** Store Singleton per i dati; flusso unidirezionale; ricostruzione efficiente del DOM allo scattare delle mutazioni.

## 6. Stack Tecnologico
- **TypeScript:** Tipizzazione statica rigida.
- **Vanilla DOM API:** Performance e leggerezza.
- **Vite:** Bundler ultra-veloce e Dev Server.
- **JSONPlaceholder:** API Mock.

## 7. Architettura del Progetto
La struttura `src/` disaccoppia nettamente le responsabilità:
- `core/`: Router e Store globale.
- `services/`: Chiamate API (Fetch).
- `models/`: Interfacce TypeScript (Post, Comment, User).
- `components/`: Factory per la generazione di DOM element (Navbar, PostCard, Pagination).
- `pages/`: Controller di pagina (`index.ts`) e viste (template HTML).
- `styles/`: CSS modulare (`_variables.css`, `layout.css`, ecc.).

## 8. Flussi Utente Analitici
1. **Lettura Base:** Routing -> Fetch API -> Popolamento Store -> Render Post -> Click per espandere i commenti.
2. **Ricerca/Filtri:** Input utente -> Debounce -> Aggiornamento stato Store -> **Reset Pagina 1** -> Rigenerazione DOM frammentata (solo dei risultati).
3. **Cambio Tema:** Click bottone -> Toggle classe `dark-theme` sul body -> Ricalcolo istantaneo variabili CSS.

## 9. Milestone
- **M1-M2:** Setup (Vite/TS), router base e popolamento dati asincrono.
- **M3:** Layout CSS, Material Design e rendering statico delle Card.
- **M4-M5:** Implementazione logica di Ricerca, Filtri combinati e Paginazione avanzata.
- **M6-M7:** UX Polish (Commenti fluidi, Dark Mode definitiva), controlli Responsive e QA.

## 10. Gestione del Rischio (Rischi e Mitigazioni)
- **DOM Thrashing:** Mitigato dall'uso obbligatorio di `DocumentFragment` prima di appendere nodi al DOM reale.
- **Memory Leak:** Mitigato applicando la **Event Delegation** (un solo listener sul container padre anziché sulle singole card).
- **Desync Stato:** Mitigato da un flusso unidirezionale (Unidirectional Data Flow) gestito rigorosamente dallo Store.
- **Accessibilità Dark Mode:** Mitigato escludendo l'uso del nero assoluto (`#000000`) a favore di grigi scuri e testando i contrasti con variabili CSS controllate.