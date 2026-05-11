# Contesto del Progetto: Gestione Articoli e Commenti

Questo progetto è un'applicazione web sviluppata in **TypeScript** che permette l'esplorazione e la gestione di un insieme di articoli e relativi commenti. I dati sono derivati da **JSON Placeholder** e vengono gestiti localmente tramite un file `db.json` servito da **json-server**.

## 🚀 Funzionalità Principali

### 🌐 Area Pubblica (User Side)
L'area pubblica è accessibile a tutti gli utenti e permette la sola consultazione dei contenuti:
- **Visualizzazione Articoli**: Elenco completo dei post con i relativi dettagli.
- **Filtro per Utente**: Possibilità di visualizzare solo i post scritti da un autore specifico.
- **Ricerca**: Funzionalità di ricerca testuale all'interno del titolo o del corpo degli articoli.

### 🔐 Area Amministratore (Admin Side)
L'accesso al pannello di controllo avviene tramite un **login fittizio** (username e password predefiniti). Una volta autenticati, gli amministratori possono gestire l'intero ecosistema tramite operazioni **CRUD** (Create, Read, Update, Delete):
- **Articoli**: Gestione completa dei post.
- **Commenti**: Moderazione e gestione dei commenti.
- **Utenti**: Gestione delle anagrafiche utenti.
- **Ruoli**: Amministrazione dei ruoli e dei permessi.

## 🛠️ Stack Tecnologico
- **Linguaggio**: TypeScript
- **Frontend**: HTML5, CSS3 (Vanilla)
- **Backend/API**: `json-server` che espone il file `db.json`
- **Tooling**: Vite (presunto per il dev server), TSC per la compilazione

## 📁 Struttura del Progetto (Punti Chiave)

- `index.html`: Punto di ingresso principale (redirect).
- `src/`: Directory sorgente contenente tutta la logica.
  - `api/`: Servizi per la comunicazione con le API (es. `posts.service.ts`, `resource.service.ts`).
  - `components/`: Componenti UI riutilizzabili (Pagination, Modal, Table).
  - `core/`: Core dell'applicazione (`store.ts` per lo stato, `constants.ts` per config).
  - `pages/`: Logica specifica per le viste.
    - `public/`: Template e script per la pagina pubblica.
    - `admin/`: Template e script per il pannello admin.
  - `shared/`: Risorse condivise.
    - `types/`: Definizioni delle interfacce TypeScript.
    - `utils/`: Funzioni di utilità generale (validatori, sleep).
  - `resources/db.json`: Il database locale utilizzato da `json-server`.

## ⚙️ Gestione dei Dati
I dati vengono recuperati tramite chiamate REST gestite dal layer API. Lo stato dell'applicazione è centralizzato nel modulo `core/store.ts` utilizzando un pattern di Store per garantire coerenza e facilità di manutenzione.
