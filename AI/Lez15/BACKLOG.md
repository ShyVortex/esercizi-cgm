# 📋 Epic/Feature: Paginazione Area Pubblica
**User Story di riferimento:** US-006: Paginazione Dinamica e Gestione Densità Risultati

## 📅 Pianificazione Sprint

| Sprint | Tasks | Descrizione Breve | Stato atteso |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | Task 1 + 2 | Estensione 'Store' e componente 'Pagination' | Gestito stato paginazione e creazione UI base |
| **Sprint 2** | Task 3 + 4 | Logica eventi e stati visivi (Disabled) | Implementata event delegation e navigazione reattiva nei limiti di pagina |
| **Sprint 3** | Task 5 | Integrazione View Controller (Public Area) | Rendering performante protetto da DOM Thrashing e gestione re-render |
| **Sprint 4** | Task 6 | Spike: QA e Test Accessibilità | Navigazione da tastiera validata e stress-test sul 'Reset Critico' superato |

---

## 🛠️ Dettaglio Task e Sub-Task

### 🛠️ Task 1: Estensione dello `Store` per la gestione dello stato di paginazione
**Descrizione:** Implementare la logica di business all'interno del singleton `store.ts` per supportare la paginazione e il calcolo dinamico dei dati da esporre alla UI.
**Tipo:** Backend/State Management (Client-side)

* **Sub-task 1.1:** Definire i tipi e le variabili di stato.
    * Aggiungere allo store le proprietà private `currentPage: number` (default 1) e `pageSize: number` (default 10).
    * Aggiungere la costante dei valori ammessi per il page size: `[5, 10, 15, 20, 25]`.
* **Sub-task 1.2:** Implementare i metodi Getter matematici.
    * Creare `getTotalPages()`: calcola `Math.ceil(filteredPosts.length / pageSize)`.
    * Creare `getPaginatedPosts()`: restituisce una porzione dell'array usando `Array.prototype.slice(startIndex, endIndex)`.
* **Sub-task 1.3:** Implementare i metodi Setter (Mutators).
    * Creare `nextPage()`, `prevPage()`, `firstPage()`, `lastPage()`. Assicurarsi che i setter includano controlli per non sforare i limiti (es. non andare < 1 o > totalPages).
    * Creare `setPageSize(size: number)`.
* **Sub-task 1.4: Implementare il "Reset Critico".**
    * Intercettare i metodi esistenti `setSearchQuery()` e `setAuthorFilter()` nello Store.
    * Aggiungere l'istruzione `this.currentPage = 1;` all'interno di questi metodi in modo che ogni filtro resetti sempre la paginazione.

---

### 🛠️ Task 2: Creazione della UI Base del componente `Pagination.ts`
**Descrizione:** Scrivere la factory function o la classe TypeScript che genera i nodi DOM (Vanilla) per il blocco di navigazione, senza ancora agganciare gli eventi logici complessi.
**Tipo:** Frontend/UI Component

* **Sub-task 2.1:** Generazione del container principale e dei pulsanti.
    * Creare il wrapper `<nav class="pagination-container">`.
    * Generare i 4 pulsanti HTML `<button>` (Prima, Indietro, Avanti, Ultima) con icone testuali o SVG inline.
* **Sub-task 2.2:** Generazione dell'indicatore di stato.
    * Creare uno `<span>` o `<div>` per l'indicatore "Pagina X di Y".
* **Sub-task 2.3:** Generazione del selettore `Page Size`.
    * Creare un elemento `<select>` con le `<option>` per i valori 5, 10, 15, 20, 25.
    * Impostare l'attributo `selected` sull'opzione corrispondente al valore corrente dello Store.
* **Sub-task 2.4:** Assemblaggio tramite DocumentFragment.
    * Unire tutti i sottonodi in un `DocumentFragment` prima di restituirli al controller genitore, per ottimizzare il primo rendering.

---

### 🛠️ Task 3: Implementazione della Event Delegation e Logica UI
**Descrizione:** Collegare il componente visivo creato nel Task 2 alle mutazioni dello Store (Task 1) garantendo una gestione sicura della memoria per prevenire Memory Leak.
**Tipo:** Frontend/Logic Integration

* **Sub-task 3.1:** Implementare la Event Delegation per i click.
    * Aggiungere un **singolo** event listener di tipo `click` sul container padre (`.pagination-container`).
    * Scrivere la logica di risalita dell'evento (`event.target.closest('button')`) per determinare quale tasto è stato premuto.
    * Mappare i data-attribute dei bottoni (es. `data-action="next"`) alle rispettive chiamate dei setter dello Store.
* **Sub-task 3.2:** Ascolto del selettore `<select>`.
    * Aggiungere un event listener di tipo `change` sul `<select>`.
    * Catturare `event.target.value`, parsarlo in intero e passarlo a `store.setPageSize()`.
* **Sub-task 3.3:** Gestione del Lifecycle (Cleanup).
    * Implementare un metodo `destroy()` nel componente (o logica equivalente nel controller della pagina) per fare il `removeEventListener` esplicito qualora il componente debba essere rimosso totalmente dal DOM.

---

### 🛠️ Task 4: Gestione Reattiva degli Stati Visivi (Disabled State)
**Descrizione:** Garantire che la UI comunichi chiaramente all'utente i limiti della navigazione (es. blocco dei tasti "Indietro" se si è a pagina 1).
**Tipo:** Frontend/UX

* **Sub-task 4.1:** Creare la logica di valutazione degli stati.
    * Scrivere una funzione `updateButtonStates(currentPage, totalPages)` che riceve i dati aggiornati dallo Store.
* **Sub-task 4.2:** Manipolazione attributi DOM.
    * Se `currentPage === 1`, impostare `element.setAttribute('disabled', 'true')` su "Prima" e "Indietro".
    * Se `currentPage === totalPages`, impostare l'attributo sui bottoni "Avanti" e "Ultima".
    * Rimuovere l'attributo `disabled` in modo dinamico (`removeAttribute`) quando lo stato non è più ai margini.
* **Sub-task 4.3:** Caso limite "Zero Risultati".
    * Se `totalPages === 0` (nessun post trovato dai filtri), disabilitare tutti i pulsanti e nascondere/bloccare il `<select>` della grandezza pagina.

---

### 🛠️ Task 5: Integrazione del Controller Pubblico (View Controller)
**Descrizione:** Orchestrare il controller della pagina (`pages/public/index.ts`) per reagire ai cambi di pagina e ri-disegnare la griglia dei post in modo performante.
**Tipo:** Frontend/Controller

* **Sub-task 5.1:** Ascolto degli eventi dello Store.
    * Iscriversi alle notifiche dello Store in merito al cambio di `currentPage` o `pageSize`.
* **Sub-task 5.2:** Pulizia performante del DOM.
    * Quando viene triggerato un cambio pagina, svuotare la griglia corrente: `postsContainer.innerHTML = ''`.
* **Sub-task 5.3:** Rendering mitigato contro il DOM Thrashing (Cruciale).
    * Recuperare l'array paginato con `store.getPaginatedPosts()`.
    * Iterare sull'array creando le istanze di `PostCard`.
    * Appenderle **esclusivamente** a un `DocumentFragment` temporaneo.
    * Eseguire un solo `postsContainer.appendChild(fragment)` per inserire l'intera pagina nel DOM reale con un'unica operazione di painting.

---

### 🐛 Spike / Test Task 6: Assicurazione Qualità e Test Accessibilità
**Descrizione:** Verifica della robustezza e conformità del componente ai requisiti non funzionali.
**Tipo:** QA/Testing

* **Sub-task 6.1:** Test della navigazione da tastiera.
    * Assicurarsi che tutti i pulsanti e la `<select>` siano raggiungibili col tasto `Tab`.
    * Verificare che il focus visivo (`outline`) sia chiaramente definito nel CSS (`components.css`).
* **Sub-task 6.2:** Stress Test "Reset Critico".
    * Posizionarsi a pagina 3, filtrare per un autore con un solo post e verificare che l'interfaccia non "esploda" ma torni fluidamente a Pagina 1 senza mostrare griglie vuote.