# CONTEXT

## Scopo dell'applicazione
Creare un'applicazione Web responsive in puro TypeScript (senza framework UI) che interagisce con l'API di JSONPlaceholder.

## Funzionalità
1. **Area Pubblica**:
   - Visualizzazione dei post.
   - Visualizzazione dei commenti e del relativo autore per ogni post.
   - Ricerca per titolo (title) o corpo (body).
   - Filtro per utente (author).
2. **Area Privata (Admin)**:
   - Pannello CMS per gestire posts, utenti e commenti.
   - Operazioni CRUD (Create, Read, Update, Delete) per queste entità.

## Vincoli Tecnici
- TypeScript puro (Niente React, Angular, Vue, ecc.).
- Setup tramite Vite come bundler.
- Routing basato su Hash (es. `/#/admin`).
- Responsive design.
- [x] Responsive layout with Material Design
- [x] Modular architecture (Router, Services, Store)
- [x] Dark Mode support
- [x] **Authentication:** Login requirement for admin area (admin/admin)
- [x] **Comment filtering:** Added filter by PostID in admin dashboard
- [x] **Modal validation:** Added client-side validation for required fields with error feedback
- UI/UX: Stile basato sul Material Design. Supporto a Light/Dark mode con toggle per l'utente (Default: Light).
- Accessibilità e Comfort Visivo: Utilizzare palette di colori armoniose ed evitare neri troppo profondi (#000000) nella Dark Mode per non affaticare la vista. Le card e gli elementi UI devono essere ben distinguibili tramite contrasti morbidi o bordi sottili.
- Gestione Operazioni CRUD: Tutte le operazioni di creazione e modifica devono avvenire tramite interfacce modali user-friendly.
- Sistema di Cancellazione: Implementare una cancellazione logica (Soft Delete). Gli elementi eliminati finiscono in un "Cestino" da cui possono essere ripristinati o eliminati definitivamente (Hard Delete).
- Struttura del progetto pulita e modulare, seguendo le best practices moderne (es. separazione tra UI, servizi, state management).
- Utilizzo dell'API pubblica JSONPlaceholder (`https://jsonplaceholder.typicode.com/`) come fonte dati iniziale. I dati verranno poi mantenuti e modificati in memoria locale per far riflettere le operazioni di CRUD fatte dall'Admin anche nell'Area Pubblica.
- **Sistema di Paginazione**: Implementare la paginazione sia nell'area pubblica che in quella admin. Le opzioni per gli elementi per pagina devono essere [5, 10, 15, 20, 25]. Nel pannello admin, ogni sezione (Post, Utenti, Commenti, Cestino) deve avere uno stato di paginazione indipendente.
