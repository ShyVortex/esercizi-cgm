// Stato globale
let state = {
    resource: 'posts',
    page: 1,
    per_page: 5,
    search: '',
    isBin: false,
    isAuthenticated: false
};
let allUsers = {};
let userId;

let isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const BASE_URL = isLocal ? "http://localhost:3000" : "/api";

// Elementi DOM
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const tableBody = document.getElementById('tableBody');
const tableHead = document.getElementById('tableHead');
const tableState = document.getElementById('tableState');
const pageSizeSection = document.getElementById('pageSizeSection');
const pageSizeSelect = document.getElementById('pageSize');
const userFilterSection = document.getElementById('userFilterSection');
const userFilter = document.getElementById('userFilter');

// Sezione elementi CRUD
let currentEditId = null; // Memorizza l'ID se stiamo modificando, altrimenti null se stiamo creando
const crudModal = document.getElementById('crudModal');
const crudForm = document.getElementById('crudForm');
const formFields = document.getElementById('formFields');
const modalTitle = document.getElementById('modalTitle');
const searchInput = document.getElementById('adminSearch');
const btnSearch = document.getElementById('btnSearch');

// Elementi paginazione
let totalPages = 0;
const paginationControls = document.getElementById('paginationControls');
const btnFirstPage = document.getElementById('btnFirstPage');
const btnPrevTen = document.getElementById('btnPrevTen');
const btnPrev = document.getElementById('btnPrev');
const currentPageInput = document.getElementById('currentPage');
const ofTotLab = document.getElementById('ofTotLab');
const btnNext = document.getElementById('btnNext');
const btnNextTen = document.getElementById('btnNextTen');
const btnLastPage = document.getElementById('btnLastPage');

// Mappa dei campi richiesti per ogni risorsa
const resourceFields = {
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
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const btn = document.getElementById('btnLogin');
    const error = document.getElementById('loginError');

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
async function fetchData() {
    showLoading(true);

    // --- 1. GESTIONE UI FILTRO UTENTI ---
    if (state.resource !== 'posts') {
        userFilterSection.classList.add('hidden');
    } else {
        userFilterSection.classList.remove('hidden');
        if (userFilter.options.length <= 1) {
            try {
                const usersRes = await fetch(`${BASE_URL}/users`);
                const usersData = await usersRes.json();
                const usersList = usersData.data || usersData;
                usersList.forEach(u => {
                    allUsers[u.id] = u.name;
                    const opt = document.createElement('option');
                    opt.value = u.id;
                    opt.textContent = u.name;
                    userFilter.appendChild(opt);
                });
            } catch (e) { console.error("Errore caricamento utenti", e); }
        }
    }

    // --- 2. COSTRUZIONE DELLA QUERY AL SERVER ---
    const query = document.getElementById('adminSearch').value.trim().toLowerCase();

    // Partiamo dall'URL base con il filtro del cestino
    let url = `${BASE_URL}/${state.resource}?isActive=${!state.isBin}`;

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
        const response = await fetch(url);
        const responseObj = await response.json();

        // Estrazione dati per compatibilità con entrambe le versioni di json-server
        let data = responseObj.data || responseObj;

        if (!query) {
            // Se non c'è ricerca, calcoliamo le pagine usando i dati restituiti dal server
            totalPages = responseObj.pages || Math.ceil(response.headers.get('X-Total-Count') / state.per_page) || 1;
        } else {
            // --- 4. FILTRO "OR" LATO JAVASCRIPT ---
            // Se c'è una query, json-server ci ha inviato tutti gli elementi: li filtriamo noi
            data = data.filter(item => {
                if (state.resource === 'posts') {
                    // Cerca nel titolo OPPURE nel body
                    const inTitle = item.title && item.title.toLowerCase().includes(query);
                    const inBody = item.body && item.body.toLowerCase().includes(query);
                    return inTitle || inBody;
                } else if (state.resource === 'comments') {
                    // Cerca nel body OPPURE nell'email
                    const inBody = item.body && item.body.toLowerCase().includes(query);
                    const inEmail = item.email && item.email.toLowerCase().includes(query);
                    return inBody || inEmail;
                } else {
                    // Per utenti e ruoli cerca nel nome
                    return item.name && item.name.toLowerCase().includes(query);
                }
            });

            // Calcoliamo le pagine totali in base a quanti risultati ha trovato il nostro filtro
            totalPages = Math.ceil(data.length / state.per_page) || 1;

            // Tagliamo l'array per inviare alla tabella solo i risultati della pagina corrente
            const startIndex = (state.page - 1) * state.per_page;
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
function renderTable(data) {
    tableBody.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
        tableState.innerHTML = "Nessun risultato trovato.";
        tableState.classList.remove('hidden');
        return;
    }

    tableState.classList.add('hidden');

    // --- Formattiamo gli oggetti annidati ---
    const formattedData = data.map(item => {
        // Creiamo una copia dell'elemento per non mutare direttamente i dati originali
        const formattedItem = { ...item };

        // Se esiste address ed è un oggetto, lo trasformiamo in stringa
        if (formattedItem.address && typeof formattedItem.address === 'object') {
            formattedItem.address = `${formattedItem.address.city}, ${formattedItem.address.street}, ${formattedItem.address.suite}`;
        }

        // Se esiste company ed è un oggetto, lo trasformiamo in stringa
        if (formattedItem.company && typeof formattedItem.company === 'object') {
            formattedItem.company = formattedItem.company.name;
        }

        return formattedItem;
    });

    // Ora usiamo "formattedData" al posto di "data" per generare le colonne
    const keys = Object.keys(formattedData[0]).filter(k => k !== 'isActive');
    tableHead.innerHTML = keys.map(k => `<th class="p-4 border-b uppercase text-xs text-gray-400 font-bold">${k}</th>`).join('') + '<th class="p-4 border-b text-right">Azioni</th>';

    // Usiamo "formattedData" anche qui per generare le righe
    tableBody.innerHTML = formattedData.map(item => `
        <tr class="hover:bg-gray-50 border-b last:border-0">
            ${keys.map(k => `<td class="p-4 text-sm text-gray-600">${item[k]}</td>`).join('')}
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
async function logicalDelete(id) {
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

async function physicalDelete(id) {
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

async function restoreItem(id) {
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

function getNestedValue(obj, path) {
    // "Naviga" nell'oggetto seguendo i punti. Se non trova nulla, restituisce stringa vuota.
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '';
}

function openCreateModal() {
    currentEditId = null;
    modalTitle.innerText = `Nuovo ${state.resource.slice(0, -1)}`; // Es: "Nuovo post"

    const fields = resourceFields[state.resource] || ['name'];

    // Genera campi vuoti
    formFields.innerHTML = fields.map(field => `
        <div>
            <label class="block text-sm font-medium text-gray-700 capitalize">
                ${field.replace(/\./g, ' ')}
            </label>
            <input type="text" name="${field}" class="mt-1 block w-full border p-2 rounded shadow-sm outline-none focus:ring-2 focus:ring-blue-500" required>
        </div>
    `).join('');

    crudModal.classList.remove('hidden');
}

async function editItem(id) {
    currentEditId = id;
    modalTitle.innerText = `Modifica ${state.resource.slice(0, -1)}`;

    try {
        // Recupera i dati specifici di questo elemento
        const response = await fetch(`${BASE_URL}/${state.resource}/${id}`);
        const item = await response.json();

        const fields = resourceFields[state.resource] || ['name'];

        // Genera campi e li popola con i valori esistenti
        formFields.innerHTML = fields.map(field => `
            <div>
                <label class="block text-sm font-medium text-gray-700 capitalize">${field.replace('.', ' ')}</label>
                <input type="text" name="${field}" value="${getNestedValue(item, field)}" class="mt-1 block w-full border p-2 rounded shadow-sm outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
        `).join('');

        crudModal.classList.remove('hidden');
    } catch (err) {
        alert("Errore nel recupero dei dati per la modifica.");
    }
}

// Chiude il modale e resetta il form
function closeModal() {
    crudModal.classList.add('hidden');
    crudForm.reset();
}

// Intercetta il salvataggio del form (Create o Update)
crudForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Definisce i dati inseriti negli input
    const formData = new FormData(crudForm);
    const dataObj = {};

    // Invece di Object.fromEntries che li raccoglierebbe in automatico, costruiamo noi l'oggetto
    // Questo serve a risolvere il problema dell'impossibilità di modifica degli oggetti parametrici
    for (let [key, value] of formData.entries()) {
        const parts = key.split('.'); // Es: ["address", "city"] o ["name"]

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
        const value = dataObj[key];

        if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
            console.error(`Errore di validazione sul campo: ${key}`);

            // Usiamo alert per far apparire l'errore SOPRA il modale
            alert(`Attenzione: non hai compilato il campo "${key.replace(/\./g, ' ')}". Riprova.`);

            return;
        }
    }

    // Se c'è un ID facciamo PATCH (modifica), altrimenti POST (crea)
    const method = currentEditId ? 'PATCH' : 'POST';
    const url = currentEditId ? `${BASE_URL}/${state.resource}/${currentEditId}` : `${BASE_URL}/${state.resource}`;

    try {
        // Disabilitiamo il pulsante salva durante il caricamento (per evitare doppi click)
        const submitBtn = crudForm.querySelector('button[type="submit"]');
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
function changeSection(res) {
    state.resource = res;
    state.page = 1;
    state.isBin = false;
    document.getElementById('sectionTitle').innerText = res;
    document.getElementById('btnBin').innerText = "Cestino";
    fetchData();
}

function toggleBin() {
    state.isBin = !state.isBin;
    state.page = 1;
    document.getElementById('sectionTitle').innerText = state.isBin ? `Cestino ${state.resource}` : state.resource;
    document.getElementById('btnBin').innerText = state.isBin ? "Torna alla Lista" : "Cestino";
    fetchData();
}

function showLoading(isLoading) {
    const btn = document.getElementById('btnSearch');
    btn.disabled = isLoading;
    if (isLoading) {
        tableBody.innerHTML = '<tr><td colspan="10" class="p-10 text-center"><div class="loader inline-block rounded-full border-4 border-t-4 h-8 w-8"></div></td></tr>';
    }
}

function showError(message) {
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

function renderPagination() {
    // Aggiorniamo i testi e gli input
    currentPageInput.value = state.page;
    ofTotLab.textContent = `di ${totalPages}`;
    btnLastPage.textContent = totalPages;

    const toggleButton = (btn, isDisabled) => {
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
userFilter.addEventListener('change', (e) => {
    userId = e.target.value ? parseInt(e.target.value, 10) : undefined;

    // Recupero i valori correnti della barra di ricerca (se ci sono)
    const qVal = adminSearch.value.trim();

    triggerAdminSearch(qVal);
});

btnFirstPage.addEventListener('click', () => { state.page = 1; fetchData(); });

btnPrev.addEventListener('click', () => { if (state.page > 1) { state.page--; fetchData(); } });

btnPrevTen.addEventListener('click', () => { state.page = Math.max(1, state.page - 10); fetchData(); });

btnNext.addEventListener('click', () => { state.page++; fetchData(); });

btnNextTen.addEventListener('click', () => { state.page = Math.min(totalPages, state.page + 10); fetchData(); });

btnLastPage.addEventListener('click', () => { state.page = totalPages; fetchData(); });

pageSizeSelect.addEventListener('change', (e) => {
    state.per_page = parseInt(e.target.value);
    state.page = 1;
    fetchData();
});

function logout() {
    window.location.reload();
}

// Funzione helper per lanciare la ricerca
function triggerAdminSearch() {
    state.page = 1;
    fetchData();
}

// Click sul pulsante "Cerca"
btnSearch.addEventListener('click', triggerAdminSearch);

// Pressione del tasto "Invio" dentro l'input di ricerca
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        triggerAdminSearch();
    }
});