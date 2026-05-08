import { User } from "../../types/user.js";
import { Item } from "../../types/item.js";
import { ResourceFields } from "../../types/resource-fields.js";
import { ResponseSearch } from "../../types/response.js";
import { isComment, isItemArray, isPost, isResponseJson, isRole, isUser } from "../../utilities/validator.js";
import { BASE_URL, isLocal, WINDOW_URL } from '../../utilities/api.js';

import { UsersService } from "../../services/users.service.js";
import { ItemService } from "../../services/item.service.js";

import * as Elements from "./elements.js";
import * as Globals from "../globals.js";
import { Renderer } from "../../commons/renderer.js";
import { Paginator } from "../../commons/paginator.js";

// 1. Gestione Autenticazione
(document.getElementById('loginForm') as HTMLFormElement).addEventListener('submit', (e: Event) => {
    e.preventDefault();
    const user: string = (document.getElementById('username') as HTMLInputElement).value;
    const pass: string = (document.getElementById('password') as HTMLInputElement).value;
    const error = document.getElementById('loginError') as HTMLParagraphElement;

    // Simulazione autenticazione
    if (user === 'admin' && pass === 'admin') {
        Globals.state.isAuthenticated = true;
        Elements.loginSection.classList.add('hidden');
        Elements.dashboardSection.classList.remove('hidden');
        fetchData();
    } else {
        error.classList.remove('hidden');
    }
});

// 2. Recupero Dati (Read)
async function fetchData(): Promise<void> {
    Renderer.showLoadingAdmin(true);

    // --- 1. GESTIONE UI FILTRO UTENTI ---
    if (Globals.state.resource !== 'posts') {
        Elements.userFilterSection.classList.add('hidden');
    } else {
        Elements.userFilterSection.classList.remove('hidden');
        if (Elements.userFilter.options.length <= 1) {
            try {
                const usersList: User[] = await UsersService.getAllUsers();
                usersList.forEach(u => {
                    Globals.shared.allUsers[u.id] = u.name;
                    const opt = document.createElement('option') as HTMLOptionElement;
                    opt.value = u.id;
                    opt.textContent = u.name;
                    Elements.userFilter.appendChild(opt);
                });
            } catch (e) { console.error("Errore caricamento utenti", e); }
        }
    }

    // --- 2. COSTRUZIONE DELLA QUERY AL SERVER ---
    const query: string = (document.getElementById('adminSearch') as HTMLInputElement).value.trim().toLowerCase();

    // Partiamo dall'URL base con il filtro del cestino
    let url: string = `${BASE_URL}/${Globals.state.resource}?isActive=${!Globals.state.isBin}`;

    // Passiamo il filtro per utente al server
    if (Globals.shared.userId && Globals.state.resource === 'posts') {
        url += `&userId=${Globals.shared.userId}`;
    }

    // SE NON C'È RICERCA, chiediamo al server di fare la paginazione al posto nostro
    if (!query) {
        // Gestione automatica della differenza tra locale (v1) e Vercel (v0.17)
        if (isLocal) {
            url += `&_page=${Globals.state.page}&_per_page=${Globals.state.per_page}`;
        } else {
            url += `&_page=${Globals.state.page}&_limit=${Globals.state.per_page}`;
        }
    }

    // --- 3. ESECUZIONE E RENDERING ---
    try {
        const response: Response = await fetch(url);
        let responseObj: ResponseSearch = await response.json();

        if (!query && isResponseJson(responseObj)) {
            // Se non c'è ricerca, calcoliamo le pagine usando i dati restituiti dal server
            const headers: Headers = response.headers;
            const totalCount: number = Math.ceil(Number(headers.get('X-Total-Count')) / Globals.state.per_page) || 1;
            Globals.shared.totalPages = responseObj.pages || totalCount;
        } else if (isItemArray(responseObj)) {
            // --- 4. FILTRO "OR" LATO JAVASCRIPT ---
            // Se c'è una query, json-server ci ha inviato tutti gli elementi: li filtriamo noi
            responseObj = responseObj.filter(item => {
                if (Globals.state.resource === 'posts' && isPost(item)) {
                    // Cerca nel titolo OPPURE nel body
                    const inTitle = item.title && item.title.toLowerCase().includes(query);
                    const inBody = item.body && item.body.toLowerCase().includes(query);
                    return inTitle || inBody;
                } else if (Globals.state.resource === 'comments' && isComment(item)) {
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
            Globals.shared.totalPages = Math.ceil(responseObj.length / Globals.state.per_page) || 1;

            // Tagliamo l'array per inviare alla tabella solo i risultati della pagina corrente
            const startIndex: number = (Globals.state.page - 1) * Globals.state.per_page;
            responseObj = responseObj.slice(startIndex, startIndex + Globals.state.per_page);
        }

        if (isItemArray(responseObj))
            Renderer.renderTable(responseObj);
        else if (isResponseJson(responseObj))
            Renderer.renderTable(responseObj.data);

        Paginator.adminPagination();

    } catch (err) {
        Renderer.showError("Errore nel caricamento dei dati.");
        console.error(err);
    } finally {
        Renderer.showLoadingAdmin(false);
    }
}

// 4. Operazioni CRUD (Delete Logico e Ripristino)
async function logicalDelete(id: string): Promise<void> {
    await ItemService.logicalDelete(Globals.state.resource, id);
    fetchData();
    Globals.state.page = 1;
}

async function physicalDelete(id: string): Promise<void> {
    await ItemService.physicalDelete(Globals.state.resource, id);
    fetchData();
}

async function restoreItem(id: string): Promise<void> {
    await ItemService.restoreItem(Globals.state.resource, id);
    fetchData();
}

function getNestedValue(obj: Item, path: string): string {
    // "Naviga" nell'oggetto seguendo i punti. Se non trova nulla, restituisce stringa vuota.
    return path.split('.').reduce((acc: any, part: string) => acc && acc[part], obj) || '';
}

function openCreateModal(): void {
    Globals.shared.currentEditId = null;
    Elements.modalTitle.innerText = `Nuovo ${Globals.state.resource.slice(0, -1)}`; // Es: "Nuovo post"

    const fields: string[] = Globals.resourceFields[Globals.state.resource as keyof ResourceFields] || ['name'];

    Elements.formFields.innerHTML = fields.map(field => {
        let inputElement: string = '';

        if (field === 'userId') {
            // 1. Costruiamo le opzioni leggendo dall'oggetto allUsers
            let options: string = '<option value="">Seleziona un utente...</option>';
            for (const id in Globals.shared.allUsers) {
                options += `<option value="${id}">${Globals.shared.allUsers[id]}</option>`;
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

    Elements.crudModal.classList.remove('hidden');
}

async function editItem(id: string): Promise<void> {
    Globals.shared.currentEditId = id;
    Elements.modalTitle.innerText = `Modifica ${Globals.state.resource.slice(0, -1)}`;

    try {
        // Recupera i dati specifici di questo elemento
        const item: Item = await ItemService.getItem(Globals.state.resource, id);

        const fields: string[] = Globals.resourceFields[Globals.state.resource as keyof ResourceFields] || ['name'];

        Elements.formFields.innerHTML = fields.map(field => {
            const value: string = getNestedValue(item, field);
            let inputElement: string = '';

            if (field === 'userId') {
                // 1. Costruiamo le opzioni selezionando automaticamente l'autore attuale
                let options: string = '<option value="">Seleziona un utente...</option>';
                for (const uId in Globals.shared.allUsers) {
                    // Usiamo == (invece di ===) perché uId è una stringa (chiave dell'oggetto) e value potrebbe essere un numero intero
                    const isSelected: string = (uId == value) ? 'selected' : '';
                    options += `<option value="${uId}" ${isSelected}>${Globals.shared.allUsers[uId]}</option>`;
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

        Elements.crudModal.classList.remove('hidden');
    } catch (err) {
        alert("Errore nel recupero dei dati per la modifica.");
    }
}

// Chiude il modale e resetta il form
function closeModal(): void {
    Elements.crudModal.classList.add('hidden');
    Elements.crudForm.reset();
}

// Intercetta il salvataggio del form (Create o Update)
Elements.crudForm.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    // Definisce i dati inseriti negli input
    const formData: FormData = new FormData(Elements.crudForm);
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
    if (!Globals.shared.currentEditId) {
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
    const method: string = Globals.shared.currentEditId ? 'PATCH' : 'POST';

    try {
        // Disabilitiamo il pulsante salva durante il caricamento (per evitare doppi click)
        const submitBtn = Elements.crudForm.querySelector('button[type="submit"]') as HTMLButtonElement;
        submitBtn.disabled = true;
        submitBtn.innerText = 'Salvataggio...';

        if (method === 'POST')
            await ItemService.createItem(Globals.state.resource, dataObj);
        else if (method === 'PATCH')
            await ItemService.updateItem(Globals.state.resource, Globals.shared.currentEditId!, dataObj);

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
    Globals.state.resource = res;
    Globals.state.page = 1;
    Globals.state.isBin = false;
    (document.getElementById('sectionTitle') as HTMLElement).innerText = res;
    (document.getElementById('btnBin') as HTMLButtonElement).innerText = "Cestino";
    fetchData();
}

function toggleBin(): void {
    Globals.state.isBin = !Globals.state.isBin;
    Globals.state.page = 1;
    (document.getElementById('sectionTitle') as HTMLElement).innerText = Globals.state.isBin ? `Cestino ${Globals.state.resource}` : Globals.state.resource;
    (document.getElementById('btnBin') as HTMLButtonElement).innerText = Globals.state.isBin ? "Torna alla Lista" : "Cestino";
    fetchData();
}

// Event Listeners per filtri e paginazione
Elements.userFilter.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLSelectElement;
    Globals.shared.userId = target.value ? parseInt(target.value, 10) : undefined;

    triggerAdminSearch();
});

Elements.btnFirstPage.addEventListener('click', () => { Globals.state.page = 1; fetchData(); });

Elements.btnPrev.addEventListener('click', () => { if (Globals.state.page > 1) { Globals.state.page--; fetchData(); } });

Elements.btnPrevTen.addEventListener('click', () => { Globals.state.page = Math.max(1, Globals.state.page - 10); fetchData(); });

Elements.btnNext.addEventListener('click', () => { Globals.state.page++; fetchData(); });

Elements.btnNextTen.addEventListener('click', () => { Globals.state.page = Math.min(Globals.shared.totalPages, Globals.state.page + 10); fetchData(); });

Elements.btnLastPage.addEventListener('click', () => { Globals.state.page = Globals.shared.totalPages; fetchData(); });

Elements.pageSizeSelect.addEventListener('change', (e: Event) => {
    Globals.state.per_page = parseInt((e.target as HTMLSelectElement).value);
    Globals.state.page = 1;
    fetchData();
});

Elements.currentPageInput.addEventListener('change', (e: Event) => {
    let newPage = parseInt((e.target as HTMLInputElement).value);
    if (isNaN(newPage) || newPage < 1) newPage = 1;
    if (newPage > Globals.shared.totalPages) newPage = Globals.shared.totalPages;
    Globals.state.page = newPage;
    fetchData();
});

function logout(): void {
    const targetUrl = WINDOW_URL + "/src/pages/public";
    window.location.href = targetUrl;
}

// Funzione helper per lanciare la ricerca
function triggerAdminSearch(): void {
    Globals.state.page = 1;
    fetchData();
}

// Click sul pulsante "Cerca"
Elements.btnSearch.addEventListener('click', triggerAdminSearch);

// Pressione del tasto "Invio" dentro l'input di ricerca
Elements.searchInput.addEventListener('keypress', (e: KeyboardEvent) => {
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
