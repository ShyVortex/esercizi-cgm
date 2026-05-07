import { Item, ResourceFields, ResponseJson, State, User, Post, Comment, Role } from "../types.js";
import { isComment, isPost, isRole, isUser } from "../validator.js";

// Stato globale
let state: State = {
    resource: 'posts',
    page: 1,
    per_page: 5,
    search: '',
    isBin: false,
    isAuthenticated: false
};
let allUsers: Record<string, string> = {};
let userId: number | undefined;

let isLocal: boolean = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const BASE_URL: string = isLocal ? "http://localhost:3000" : "/api";

// Elementi DOM
const loginSection = document.getElementById('loginSection') as HTMLElement;
const dashboardSection = document.getElementById('dashboardSection') as HTMLElement;
const tableBody = document.getElementById('tableBody') as HTMLElement;
const tableHead = document.getElementById('tableHead') as HTMLElement;
const tableState = document.getElementById('tableState') as HTMLElement;
const pageSizeSection = document.getElementById('pageSizeSection') as HTMLElement;
const pageSizeSelect = document.getElementById('pageSize') as HTMLSelectElement;
const userFilterSection = document.getElementById('userFilterSection') as HTMLElement;
const userFilter = document.getElementById('userFilter') as HTMLSelectElement;

// Sezione elementi CRUD
let currentEditId: string | null = null; // Memorizza l'ID se stiamo modificando, altrimenti null se stiamo creando
const crudModal = document.getElementById('crudModal') as HTMLElement;
const crudForm = document.getElementById('crudForm') as HTMLFormElement;
const formFields = document.getElementById('formFields') as HTMLElement;
const modalTitle = document.getElementById('modalTitle') as HTMLElement;
const searchInput = document.getElementById('adminSearch') as HTMLInputElement;
const btnSearch = document.getElementById('btnSearch') as HTMLButtonElement;

// Elementi paginazione
let totalPages: number = 0;
const paginationControls = document.getElementById('paginationControls') as HTMLElement;
const btnFirstPage = document.getElementById('btnFirstPage') as HTMLButtonElement;
const btnPrevTen = document.getElementById('btnPrevTen') as HTMLButtonElement;
const btnPrev = document.getElementById('btnPrev') as HTMLButtonElement;
const currentPageInput = document.getElementById('currentPage') as HTMLInputElement;
const ofTotLab = document.getElementById('ofTotLab') as HTMLLabelElement;
const btnNext = document.getElementById('btnNext') as HTMLButtonElement;
const btnNextTen = document.getElementById('btnNextTen') as HTMLButtonElement;
const btnLastPage = document.getElementById('btnLastPage') as HTMLButtonElement;

// Mappa dei campi richiesti per ogni risorsa
const resourceFields: ResourceFields = {
    posts: ['title', 'body', 'userId'],
    users: [
        'name', 'username', 'email', 'phone', 'website',
        'address.city', 'address.street', 'address.suite',
        'address.zipcode', 'company.name', 'company.catchPhrase',
        'company.bs'
    ],
    comments: ['name', 'email', 'body', 'postId'],
    roles: ['name']
};

// 1. Gestione Autenticazione
(document.getElementById('loginForm') as HTMLFormElement).addEventListener('submit', (e: Event) => {
    e.preventDefault();
    const user: string = (document.getElementById('username') as HTMLInputElement).value;
    const pass: string = (document.getElementById('password') as HTMLInputElement).value;
    const btn = document.getElementById('btnLogin') as HTMLButtonElement;
    const error = document.getElementById('loginError') as HTMLParagraphElement;

    // Simulazione autenticazione
    if (user === 'admin' && pass === 'admin') {
        state.isAuthenticated = true;
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        fetchData();
    } else {
        error.classList.remove('hidden');
    }
});

// 2. Recupero Dati (Read)
async function fetchData(): Promise<void> {
    showLoading(true);

    // --- 1. GESTIONE UI FILTRO UTENTI ---
    if (state.resource !== 'posts') {
        userFilterSection.classList.add('hidden');
    } else {
        userFilterSection.classList.remove('hidden');
        if (userFilter.options.length <= 1) {
            try {
                const usersRes: Response = await fetch(`${BASE_URL}/users`);
                const usersData: ResponseJson = await usersRes.json();
                const usersList: User[] = (usersData.data || usersData) as User[];
                usersList.forEach(u => {
                    allUsers[u.id] = u.name;
                    const opt = document.createElement('option') as HTMLOptionElement;
                    opt.value = u.id;
                    opt.textContent = u.name;
                    userFilter.appendChild(opt);
                });
            } catch (e) { console.error("Errore caricamento utenti", e); }
        }
    }

    // --- 2. COSTRUZIONE DELLA QUERY AL SERVER ---
    const query: string = (document.getElementById('adminSearch') as HTMLInputElement).value.trim().toLowerCase();

    // Partiamo dall'URL base con il filtro del cestino
    let url: string = `${BASE_URL}/${state.resource}?isActive=${!state.isBin}`;

    // Passiamo il filtro per utente al server
    if (userId && state.resource === 'posts') {
        url += `&userId=${userId}`;
    }

    // SE NON C'È RICERCA, chiediamo al server di fare la paginazione al posto nostro
    if (!query) {
        // Gestione automatica della differenza tra locale (v1) e Vercel (v0.17)
        if (isLocal) {
            url += `&_page=${state.page}&_per_page=${state.per_page}`;
        } else {
            url += `&_page=${state.page}&_limit=${state.per_page}`;
        }
    }

    // --- 3. ESECUZIONE E RENDERING ---
    try {
        const response: Response = await fetch(url);
        const responseObj: ResponseJson = await response.json();

        // Estrazione dati per compatibilità con entrambe le versioni di json-server
        let data: Item[] = responseObj.data || responseObj;

        if (!query) {
            // Se non c'è ricerca, calcoliamo le pagine usando i dati restituiti dal server
            const headers: Headers = response.headers;
            const totalCount: number = Math.ceil(Number(headers.get('X-Total-Count')) / state.per_page) || 1;
            totalPages = responseObj.pages || totalCount;
        } else {
            // --- 4. FILTRO "OR" LATO JAVASCRIPT ---
            // Se c'è una query, json-server ci ha inviato tutti gli elementi: li filtriamo noi
            data = data.filter(item => {
                if (state.resource === 'posts' && isPost(item)) {
                    // Cerca nel titolo OPPURE nel body
                    const inTitle = item.title && item.title.toLowerCase().includes(query);
                    const inBody = item.body && item.body.toLowerCase().includes(query);
                    return inTitle || inBody;
                } else if (state.resource === 'comments' && isComment(item)) {
                    // Cerca nel body OPPURE nell'email
                    const inBody = item.body && item.body.toLowerCase().includes(query);
                    const inEmail = item.email && item.email.toLowerCase().includes(query);
                    return inBody || inEmail;
                } else if (isUser(item) || isRole(item)) {
                    // Per utenti e ruoli cerca nel nome
                    return item.name && item.name.toLowerCase().includes(query);
                }
            });

            // Calcoliamo le pagine totali in base a quanti risultati ha trovato il nostro filtro
            totalPages = Math.ceil(data.length / state.per_page) || 1;

            // Tagliamo l'array per inviare alla tabella solo i risultati della pagina corrente
            const startIndex: number = (state.page - 1) * state.per_page;
            data = data.slice(startIndex, startIndex + state.per_page);
        }

        renderTable(data);
        renderPagination();

    } catch (err) {
        showError("Errore nel caricamento dei dati.");
        console.error(err);
    } finally {
        showLoading(false);
    }
}

// 3. Rendering Dinamico della Tabella
function renderTable(data: Item[]): void {
    tableBody.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
        tableState.innerHTML = "Nessun risultato trovato.";
        tableState.classList.remove('hidden');
        return;
    }

    tableState.classList.add('hidden');

    // --- Formattiamo gli oggetti annidati ---
    const formattedData: Item[] = data.map(item => {
        // Creiamo una copia dell'elemento per non mutare direttamente i dati originali
        const formattedItem = { ...item };

        // Se esiste address ed è un oggetto, lo trasformiamo in stringa
        if (isUser(formattedItem)) {
            if (formattedItem.address && typeof formattedItem.address === 'object') {
                formattedItem.address = `${formattedItem.address.city}, ${formattedItem.address.street}, ${formattedItem.address.suite}`;
            }
            // Se esiste company ed è un oggetto, lo trasformiamo in stringa
            if (formattedItem.company && typeof formattedItem.company === 'object') {
                formattedItem.company = formattedItem.company.name;
            }
        }

        return formattedItem;
    });

    // Ora usiamo "formattedData" al posto di "data" per generare le colonne
    const keys: string[] = Object.keys(formattedData[0]).filter(k => k !== 'isActive');
    tableHead.innerHTML = keys.map(k => `<th class="p-4 border-b uppercase text-xs text-gray-400 font-bold">${k}</th>`).join('') + '<th class="p-4 border-b text-right">Azioni</th>';

    // Usiamo "formattedData" anche qui per generare le righe
    tableBody.innerHTML = formattedData.map(item => `
        <tr class="hover:bg-gray-50 border-b last:border-0">
            ${keys.map(k => `<td class="p-4 text-sm text-gray-600">${(item as Record<string, any>)[k]}</td>`).join('')}
            <td class="p-4 text-right space-x-2">
                ${state.isBin
            ? `<button onclick="physicalDelete('${item.id}')" class="text-red-500 font-bold">Cancella</button>
               <button onclick="restoreItem('${item.id}')" class="text-blue-500 font-bold">Ripristina</button>`
            : `<button onclick="editItem('${item.id}')" class="text-yellow-600">Modifica</button>
                       <button onclick="logicalDelete('${item.id}')" class="text-red-500">Elimina</button>`
        }
            </td>
        </tr>
    `).join('');
}

// 4. Operazioni CRUD (Delete Logico e Ripristino)
async function logicalDelete(id: string): Promise<void> {
    if (!confirm("Spostare nel cestino?")) return;

    try {
        await fetch(`${BASE_URL}/${state.resource}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: false })
        });
        alert("Elemento rimosso.");
        fetchData();
    } catch (err) { alert("Errore durante l'eliminazione."); }
}

async function physicalDelete(id: string): Promise<void> {
    if (!confirm("Sei sicuro di voler eliminare definitivamente questo elemento?" + "\n"
        + "Non sarà possibile tornare indietro."))
        return;

    try {
        await fetch(`${BASE_URL}/${state.resource}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        alert("Elemento rimosso definitivamente.");
        fetchData();
    } catch (err) { alert("Errore durante l'eliminazione."); }
}

async function restoreItem(id: string): Promise<void> {
    try {
        await fetch(`${BASE_URL}/${state.resource}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: true })
        });
        alert("Elemento ripristinato.");
        fetchData();
    } catch (err) { alert("Errore durante il ripristino."); }
}

function getNestedValue(obj: Item, path: string): string {
    // "Naviga" nell'oggetto seguendo i punti. Se non trova nulla, restituisce stringa vuota.
    return path.split('.').reduce((acc: any, part: string) => acc && acc[part], obj) || '';
}

function openCreateModal(): void {
    currentEditId = null;
    modalTitle.innerText = `Nuovo ${state.resource.slice(0, -1)}`; // Es: "Nuovo post"

    const fields: string[] = resourceFields[state.resource as keyof ResourceFields] || ['name'];

    formFields.innerHTML = fields.map(field => {
        let inputElement: string = '';

        if (field === 'userId') {
            // 1. Costruiamo le opzioni leggendo dall'oggetto allUsers
            let options: string = '<option value="">Seleziona un utente...</option>';
            for (const id in allUsers) {
                options += `<option value="${id}">${allUsers[id]}</option>`;
            }

            // 2. Creiamo la select
            inputElement = `<select name="${field}" class="mt-1 block w-full border p-2 rounded shadow-sm outline-none focus:ring-2 focus:ring-blue-500" required>${options}</select>`;
        } else {
            // Comportamento standard per tutti gli altri campi
            inputElement = `<input type="text" name="${field}" class="mt-1 block w-full border p-2 rounded shadow-sm outline-none focus:ring-2 focus:ring-blue-500" required>`;
        }

        const labelText: string = field === 'userId' ? 'User' : field.replace(/\./g, ' ');

        return `
            <div>
                <label class="block text-sm font-medium text-gray-700 capitalize">
                    ${labelText}
                </label>
                ${inputElement}
            </div>
        `;
    }).join('');

    crudModal.classList.remove('hidden');
}

async function editItem(id: string): Promise<void> {
    currentEditId = id;
    modalTitle.innerText = `Modifica ${state.resource.slice(0, -1)}`;

    try {
        // Recupera i dati specifici di questo elemento
        const response: Response = await fetch(`${BASE_URL}/${state.resource}/${id}`);
        const item: Item = await response.json();

        const fields: string[] = resourceFields[state.resource as keyof ResourceFields] || ['name'];

        formFields.innerHTML = fields.map(field => {
            const value: string = getNestedValue(item, field);
            let inputElement: string = '';

            if (field === 'userId') {
                // 1. Costruiamo le opzioni selezionando automaticamente l'autore attuale
                let options: string = '<option value="">Seleziona un utente...</option>';
                for (const uId in allUsers) {
                    // Usiamo == (invece di ===) perché uId è una stringa (chiave dell'oggetto) e value potrebbe essere un numero intero
                    const isSelected: string = (uId == value) ? 'selected' : '';
                    options += `<option value="${uId}" ${isSelected}>${allUsers[uId]}</option>`;
                }

                // 2. Creiamo la select
                inputElement = `<select name="${field}" class="mt-1 block w-full border p-2 rounded shadow-sm outline-none focus:ring-2 focus:ring-blue-500" required>${options}</select>`;
            } else {
                // Comportamento standard per gli input di testo pre-compilati
                inputElement = `<input type="text" name="${field}" value="${value}" class="mt-1 block w-full border p-2 rounded shadow-sm outline-none focus:ring-2 focus:ring-blue-500" required>`;
            }

            const labelText: string = field === 'userId' ? 'User' : field.replace(/\./g, ' ');

            return `
                <div>
                    <label class="block text-sm font-medium text-gray-700 capitalize">
                        ${labelText}
                    </label>
                    ${inputElement}
                </div>
            `;
        }).join('');

        crudModal.classList.remove('hidden');
    } catch (err) {
        alert("Errore nel recupero dei dati per la modifica.");
    }
}

// Chiude il modale e resetta il form
function closeModal(): void {
    crudModal.classList.add('hidden');
    crudForm.reset();
}

// Intercetta il salvataggio del form (Create o Update)
crudForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Definisce i dati inseriti negli input
    const formData: FormData = new FormData(crudForm);
    const dataObj: Record<string, any> = {};

    // Invece di Object.fromEntries che li raccoglierebbe in automatico, costruiamo noi l'oggetto
    // Questo serve a risolvere il problema dell'impossibilità di modifica degli oggetti parametrici
    for (let [key, value] of formData.entries()) {
        const parts: string[] = key.split('.'); // Es: ["address", "city"] o ["name"]

        if (parts.length === 1) {
            // Campo normale (es. "name" o "title")
            dataObj[key] = value;
        } else {
            // Campo annidato (es. "address.city")
            const parent = parts[0]; // "address"
            const child = parts[1];  // "city"

            // Se l'oggetto genitore non esiste ancora, lo creiamo
            if (!dataObj[parent]) dataObj[parent] = {};

            dataObj[parent][child] = value;
        }
    }

    // Convertiamo in numero i campi che originariamente erano numeri
    if (dataObj.postId) {
        dataObj.postId = parseInt(dataObj.postId, 10);
    }
    if (dataObj.userId) {
        dataObj.userId = parseInt(dataObj.userId, 10);
    }

    // Se stiamo creando un nuovo record, aggiungiamo il flag isActive = true di default
    if (!currentEditId) {
        dataObj.isActive = true;
    }

    // Controllo errori campi lato JS
    for (const key in dataObj) {
        const value: string = dataObj[key];

        if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
            console.error(`Errore di validazione sul campo: ${key}`);

            // Usiamo alert per far apparire l'errore SOPRA il modale
            alert(`Attenzione: non hai compilato il campo "${key.replace(/\./g, ' ')}". Riprova.`);

            return;
        }
    }

    // Se c'è un ID facciamo PATCH (modifica), altrimenti POST (crea)
    const method: string = currentEditId ? 'PATCH' : 'POST';
    const url: string = currentEditId ? `${BASE_URL}/${state.resource}/${currentEditId}` : `${BASE_URL}/${state.resource}`;

    try {
        // Disabilitiamo il pulsante salva durante il caricamento (per evitare doppi click)
        const submitBtn = crudForm.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitBtn.disabled = true;
        submitBtn.innerText = 'Salvataggio...';

        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataObj)
        });

        closeModal();
        fetchData(); // Ricarica la tabella per mostrare le modifiche

        // Ripristina il pulsante
        submitBtn.disabled = false;
        submitBtn.innerText = 'Salva';

    } catch (err) {
        alert("Errore durante il salvataggio.");
    }
});

// 5. Utility UI
function changeSection(res: string): void {
    state.resource = res;
    state.page = 1;
    state.isBin = false;
    (document.getElementById('sectionTitle') as HTMLElement).innerText = res;
    (document.getElementById('btnBin') as HTMLButtonElement).innerText = "Cestino";
    fetchData();
}

function toggleBin(): void {
    state.isBin = !state.isBin;
    state.page = 1;
    (document.getElementById('sectionTitle') as HTMLElement).innerText = state.isBin ? `Cestino ${state.resource}` : state.resource;
    (document.getElementById('btnBin') as HTMLButtonElement).innerText = state.isBin ? "Torna alla Lista" : "Cestino";
    fetchData();
}

function showLoading(isLoading: boolean): void {
    const btn = document.getElementById('btnSearch') as HTMLButtonElement;
    btn.disabled = isLoading;
    if (isLoading) {
        tableBody.innerHTML = '<tr><td colspan="10" class="p-10 text-center"><div class="loader inline-block rounded-full border-4 border-t-4 h-8 w-8"></div></td></tr>';
    }
}

function showError(message: string): void {
    // Svuotiamo il corpo della tabella (rimuove il loader o vecchi dati)
    tableBody.innerHTML = '';

    // Inseriamo il messaggio di errore nel contenitore di stato
    tableState.innerHTML = `
        <div class="text-red-500">
            <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="font-bold text-lg">${message}</p>
            <p class="text-sm mt-2 text-gray-500">Assicurati che json-server sia in esecuzione sulla porta 3000.</p>
        </div>
    `;

    // Rendiamo visibile il blocco di stato
    tableState.classList.remove('hidden');
}

function renderPagination(): void {
    // Aggiorniamo i testi e gli input
    currentPageInput.value = state.page.toString();
    ofTotLab.textContent = `di ${totalPages}`;
    btnLastPage.textContent = totalPages.toString();

    const toggleButton = (btn: HTMLButtonElement, isDisabled: boolean) => {
        btn.disabled = isDisabled;
        if (isDisabled) {
            btn.classList.add('opacity-40', 'cursor-not-allowed', 'bg-gray-100');
            btn.classList.remove('hover:bg-gray-200');
        } else {
            btn.classList.remove('opacity-40', 'cursor-not-allowed', 'bg-gray-100');
            btn.classList.add('hover:bg-gray-200');
        }
    };

    // Logica di abilitazione/disabilitazione
    toggleButton(btnFirstPage, state.page === 1);
    toggleButton(btnPrev, state.page === 1);
    toggleButton(btnPrevTen, state.page <= 10);

    toggleButton(btnNext, state.page === totalPages);
    toggleButton(btnNextTen, state.page > totalPages - 10);
    toggleButton(btnLastPage, state.page === totalPages);
}

// Event Listeners per filtri e paginazione
userFilter.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLSelectElement;
    userId = target.value ? parseInt(target.value, 10) : undefined;

    triggerAdminSearch();
});

btnFirstPage.addEventListener('click', () => { state.page = 1; fetchData(); });

btnPrev.addEventListener('click', () => { if (state.page > 1) { state.page--; fetchData(); } });

btnPrevTen.addEventListener('click', () => { state.page = Math.max(1, state.page - 10); fetchData(); });

btnNext.addEventListener('click', () => { state.page++; fetchData(); });

btnNextTen.addEventListener('click', () => { state.page = Math.min(totalPages, state.page + 10); fetchData(); });

btnLastPage.addEventListener('click', () => { state.page = totalPages; fetchData(); });

pageSizeSelect.addEventListener('change', (e: Event) => {
    state.per_page = parseInt((e.target as HTMLSelectElement).value);
    state.page = 1;
    fetchData();
});

function logout(): void {
    window.location.reload();
}

// Funzione helper per lanciare la ricerca
function triggerAdminSearch(): void {
    state.page = 1;
    fetchData();
}

// Click sul pulsante "Cerca"
btnSearch.addEventListener('click', triggerAdminSearch);

// Pressione del tasto "Invio" dentro l'input di ricerca
searchInput.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        triggerAdminSearch();
    }
});

// Esportazione delle funzioni usate nell'HTML (inline handlers)
(window as any).changeSection = changeSection;
(window as any).toggleBin = toggleBin;
(window as any).logout = logout;
(window as any).openCreateModal = openCreateModal;
(window as any).fetchData = fetchData;
(window as any).physicalDelete = physicalDelete;
(window as any).restoreItem = restoreItem;
(window as any).editItem = editItem;
(window as any).logicalDelete = logicalDelete;
(window as any).closeModal = closeModal;