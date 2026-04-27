/*
Usando JSON-Server per simulare il back-end, crea una dashboard amministratore con la gestione completa di post
(articoli), commenti, utenti e ruoli in un vero e proprio CRUD (Create, Read, Update, Delete), con paginazione,
ricerca e filtri dei campi. Crea anche un menù per passare da una sezione all’altra.

Extra: crea un campo “isActive” su tutte le risorse per la cancellazione logica, se il valore è false non si deve vedere
ma ci deve essere una pagina “cestino” per ognuna dove si può recuperare un elemento cancellato.

Mantienere la logica degli stati della UI vista nelle lezioni precedenti, perciò mostrare all’utente messaggi di
caricamento, errori, risultati vuoti e successo. Durante il caricamento disabilitare il pulsante per impedire all’utente
di rieffettuare la richiesta mentre c’è qualcosa già in corso.

Per la paginazione disabilitare i pulsante che non effettuano nessuna operazione (esempio: pulsante indietro
mentre l’utente è sulla pagina 1).
*/

// Stato dell'applicazione
let allPosts = [];
let allUsers = {};
let filteredPosts = [];
let currentPage = 1;
let itemsPerPage = 10;
let userId;

// Elementi principali
const postsContainer = document.getElementById('postsContainer');
const userFilter = document.getElementById('userFilter');
const pageSizeSelect = document.getElementById('pageSize');

// Elementi della paginazione
const paginationControls = document.getElementById('paginationControls');
const btnFirstPage = document.getElementById('btnFirstPage');
const btnPrevTen = document.getElementById('btnPrevTen');
const btnPrev = document.getElementById('btnPrev');
const currentPageInput = document.getElementById('currentPage');
const ofTotLab = document.getElementById('ofTotLab');
const btnNext = document.getElementById('btnNext');
const btnNextTen = document.getElementById('btnNextTen');
const btnLastPage = document.getElementById('btnLastPage');

// Elementi di ricerca
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const tbInput = document.getElementById('tbInput');
const searchButton = document.getElementById('searchButton');
const resetButton = document.getElementById('resetButton');

// Elementi per json-server
const localDb = 'db.json';
let isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const BASE_URL = isLocal ? "http://localhost:3000" : "/api";

// Inizializzazione
async function init() {
    try {
        const [postsRes, usersRes] = await Promise.all([
            fetch(`${BASE_URL}/posts`),
            fetch(`${BASE_URL}/users`)
        ]);

        const posts = await postsRes.json();
        const users = await usersRes.json();

        // Mappa gli utenti
        users.forEach(u => {
            allUsers[u.id] = u.name;
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = u.name;
            userFilter.appendChild(opt);
        });

        allPosts = posts;
        filteredPosts = posts.filter(p => p.isActive === true);
        render();

    } catch (error) {
        postsContainer.innerHTML = `<p class="text-red-500 text-center py-4">Errore nel caricamento dei dati iniziali.</p>`;
    }
}

// Rendering lista
function render() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredPosts.slice(startIndex, endIndex);

    // Ri-mostriamo la paginazione solo se ci sono risultati
    paginationControls.style.display = filteredPosts.length > 0 ? 'flex' : 'none';

    renderPosts(paginatedItems);
    renderPagination();
}

function renderLoading() {
    postsContainer.innerHTML = `
        <div class="flex justify-center py-10">
            <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
        </div>
    `;

    paginationControls.style.display = 'none';
}

async function renderWithLoading() {
    renderLoading();

    const delay = Math.floor(Math.random() * 3000) + 1000;
    await sleep(delay);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredPosts.slice(startIndex, endIndex);

    renderPosts(paginatedItems);
    renderPagination();
}

function renderServerError(query) {
    postsContainer.innerHTML = `
        <div class="text-center py-10">
            <p class="text-red-600 text-lg font-semibold mb-4">Errore temporaneo del server.</p>
            <button onclick="triggerSearch('${query}')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Riprova
            </button>
        </div>
    `;

    paginationControls.style.display = 'none';
}

function renderPosts(posts) {
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p class="text-center py-10 text-gray-500 text-lg">Nessun risultato trovato.</p>';
        return;
    }

    postsContainer.innerHTML = posts.map(post => `
                <div id="post-${post.id}" onclick="toggleDetail(${post.id})" class="bg-white p-5 rounded-lg shadow hover:shadow-md transition-all cursor-pointer border-l-4 border-blue-500">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-xl font-semibold text-gray-800">${post.title}</h2>
                            <p class="text-sm text-blue-600 font-medium mb-2">Autore: ${allUsers[post.userId]}</p>
                        </div>
                        <span class="text-gray-400 text-sm">&#9660;</span>
                    </div>
                    
                    <p class="excerpt text-gray-600 italic">"${post.body.substring(0, 20)}..."</p>
                    
                    <div id="detail-${post.id}" data-loaded="false" class="hidden mt-4 pt-4 border-t border-gray-100">
                        </div>
                </div>
            `).join('');
}

function renderPagination() {
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    let html = '';

    // Aggiorniamo i testi e gli input
    currentPageInput.value = currentPage;
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
    toggleButton(btnFirstPage, currentPage === 1);
    toggleButton(btnPrev, currentPage === 1);
    toggleButton(btnPrevTen, currentPage <= 10);

    toggleButton(btnNext, currentPage === totalPages);
    toggleButton(btnNextTen, currentPage > totalPages - 10);
    toggleButton(btnLastPage, currentPage === totalPages);
}

// Event Listeners per i pulsanti della paginazione
btnFirstPage.addEventListener('click', () => goToPage(1));

btnPrev.addEventListener('click', () => goToPage(currentPage - 1));

btnPrevTen.addEventListener('click', () => goToPage(Math.max(1, currentPage - 10)));

btnNext.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
    if (currentPage < totalPages) goToPage(currentPage + 1);
});

btnNextTen.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
    goToPage(Math.min(totalPages, currentPage + 10));
});

btnLastPage.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
    goToPage(totalPages);
});

// Listener per la casella di input in cui l'utente può digitare la pagina
currentPageInput.addEventListener('change', (e) => {
    let val = parseInt(e.target.value);
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;

    // Controllo per evitare numeri invalidi
    if (isNaN(val) || val < 1) val = 1;
    if (val > totalPages) val = totalPages;

    goToPage(val);
});

// Espansione Card e Caricamento Dettagli
async function toggleDetail(postId) {
    const detailContainer = document.getElementById(`detail-${postId}`);
    const excerpt = document.querySelector(`#post-${postId} .excerpt`);

    // Se i dati sono già stati caricati in precedenza, fai solo il toggle della visibilità
    if (detailContainer.dataset.loaded === "true") {
        detailContainer.classList.toggle('hidden');
        excerpt.classList.toggle('hidden');
        return;
    }

    // Primo click: nascondi l'anteprima, mostra il loader ed esegui la fetch
    excerpt.classList.add('hidden');
    detailContainer.classList.remove('hidden');
    detailContainer.innerHTML = '<div class="flex justify-center py-4"><div class="loader rounded-full border-4 border-t-4 border-gray-200 h-6 w-6"></div></div>';

    try {
        const [postRes, commRes] = await Promise.all([
            fetch(`${BASE_URL}/posts/${postId}`),
            fetch(`${BASE_URL}/comments`)
        ]);

        const post = await postRes.json();
        let comments = await commRes.json();
        console.log(comments);

        comments = comments.filter(c => c.postId === postId);
        console.log(comments);

        // Inserisci i dati completi
        detailContainer.innerHTML = `
                    <div class="text-gray-700 leading-relaxed mb-6 bg-gray-50 p-4 rounded-md">
                        ${post.body}
                    </div>
                    <h3 class="text-md font-bold mb-3 text-gray-800 border-b pb-1">Commenti (${comments.length})</h3>
                    <div class="space-y-3">
                        ${comments.map(c => `
                            <div class="bg-white border border-gray-200 p-3 rounded-md shadow-sm">
                                <p class="text-sm font-bold text-gray-800">${c.email}</p>
                                <p class="text-sm text-gray-600 mt-1">${c.body}</p>
                            </div>
                        `).join('')}
                    </div>
                `;

        // Segna come caricato per evitare chiamate API duplicate ai click successivi
        detailContainer.dataset.loaded = "true";

    } catch (error) {
        detailContainer.innerHTML = '<p class="text-red-500 text-sm">Errore nel caricamento dei dettagli.</p>';
        excerpt.classList.remove('hidden'); // Ripristina l'anteprima se fallisce
        console.error(error);
    }
}

async function triggerSearch(query) {
    renderLoading();

    const delay = Math.floor(Math.random() * 3000) + 1000;
    await sleep(delay);

    const isError = Math.floor(Math.random() * 10) + 1 === 1;
    console.log(isError);

    if (isError) {
        renderServerError(query);
        return;
    }

    filteredPosts = allPosts.filter(p => {
        let matchesTitle = true;
        let matchesBody = true;
        let matchesUser = true;

        if (query) {
            matchesTitle = p.title.toLowerCase().includes(query.toLowerCase());
            matchesBody = p.body.toLowerCase().includes(query.toLowerCase());
        }
        if (userId)
            matchesUser = p.userId == userId;

        return (matchesTitle || matchesBody) && matchesUser;
    });

    currentPage = 1;
    render();
}

// Event Listeners per filtri e paginazione
userFilter.addEventListener('change', (e) => {
    userId = e.target.value;

    // Recupero i valori correnti della barra di ricerca (se ci sono)
    const qVal = tbInput.value.trim();

    if (qVal === '' || qVal.length < 3) {
        filteredPosts = userId ? allPosts.filter(p => p.userId == userId) : [...allPosts];
        currentPage = 1;
        render();
    } else {
        triggerSearch(qVal);
    }
});

pageSizeSelect.addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 1;
    render();
});

tbInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        // 1. Estrai e pulisci i valori
        const qVal = tbInput.value.trim();
        const tbLengthError = document.getElementById('tbLengthError');

        // 2. Resetta gli errori visivi
        tbLengthError.style.display = 'none';

        let isValid = true;

        // 3. Valida il campo
        if (qVal.length >= 0 && qVal.length < 3) {
            tbLengthError.style.display = 'block';
            tbLengthError.style.color = 'darkred';
            isValid = false;
        }

        // Se c'è un errore di validazione, fermati qui
        if (!isValid) return;

        resetButton.hidden = false;

        // 4. Esegui la ricerca con i valori validati
        triggerSearch(qVal);
    }
});

searchButton.addEventListener('click', () => {
    const qVal = tbInput.value.trim();
    const tbLengthError = document.getElementById('tbLengthError');

    tbLengthError.style.display = 'none';

    let isValid = true;

    if (qVal.length >= 0 && qVal.length < 3) {
        tbLengthError.style.display = 'block';
        tbLengthError.style.color = 'darkred';
        isValid = false;
    }

    if (!isValid) return;

    resetButton.hidden = false;

    triggerSearch(qVal);
});

resetButton.addEventListener('click', () => {
    const qVal = tbInput.value.trim();
    const tbLengthError = document.getElementById('tbLengthError');
    tbLengthError.style.display = 'none';

    tbInput.value = '';
    resetButton.hidden = true;

    filteredPosts = userId ? allPosts.filter(p => p.userId == userId) : [...allPosts];
    currentPage = 1;
    render();
    return;
})

function goToPage(page) {
    currentPage = page;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

init();