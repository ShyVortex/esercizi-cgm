/*
Partendo dall’esercizio predente sui post, commenti e utenti, implementare una barra di ricerca che simuli una
chiamata al back-end della durata tra i 1000 e i 4000 ms, i cui criteri di validazione sono che il campo è obbligatorio
e deve essere di almeno 3 caratteri (controlli lato javascript e non HTML), che mostri all’utente solo i risultati
trovati in base al titolo oppure al body del post. Genera un numero casuale da 1 a 10 dove in caso di 1 deve essere
restituito un errore temporaneo del server con la possibilità di riprovare. Gestire il loader durante la fase di sleep che
simula il caricamento del back-end, l’errore in caso di validazione oppure errore server, l’eventuale pulsante per
riprovare e il caso di ritorno di un array di risultati vuoto.
*/

// Stato dell'applicazione
let allPosts = [];
let allUsers = {};
let filteredPosts = [];
let currentPage = 1;
let itemsPerPage = 10;

const postsContainer = document.getElementById('postsContainer');
const userFilter = document.getElementById('userFilter');
const pageSizeSelect = document.getElementById('pageSize');
const paginationControls = document.getElementById('paginationControls');
const inputs = document.querySelectorAll('#titleInput, #bodyInput');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Inizializzazione
async function init() {
    try {
        const [postsRes, usersRes] = await Promise.all([
            fetch('https://jsonplaceholder.typicode.com/posts'),
            fetch('https://jsonplaceholder.typicode.com/users')
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
        filteredPosts = [...allPosts];
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

    renderPosts(paginatedItems);
    renderPagination();
}

function renderLoading() {
    postsContainer.innerHTML = `
        <div class="flex justify-center py-10">
            <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
        </div>
    `;
    paginationControls.innerHTML = '';
}

function renderServerError(titleQuery, bodyQuery) {
    postsContainer.innerHTML = `
        <div class="text-center py-10">
            <p class="text-red-600 text-lg font-semibold mb-4">Errore temporaneo del server.</p>
            <button onclick="triggerSearch('${titleQuery}', '${bodyQuery}')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Riprova
            </button>
        </div>
    `;
    paginationControls.innerHTML = '';
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

    for (let i = 1; i <= totalPages; i++) {
        html += `
                    <button onclick="goToPage(${i})" class="px-3 py-1 rounded transition-colors ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}">
                        ${i}
                    </button>
                `;
    }
    paginationControls.innerHTML = html;
}

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
            fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`),
            fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`)
        ]);

        const post = await postRes.json();
        const comments = await commRes.json();

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
    }
}

async function triggerSearch(titleQuery, bodyQuery) {
    renderLoading();

    const delay = Math.floor(Math.random() * 3000) + 1000;
    await sleep(delay);

    const isError = Math.floor(Math.random() * 10) + 1 === 1;
    console.log(isError);

    if (isError) {
        renderServerError(titleQuery, bodyQuery);
        return;
    }

    filteredPosts = allPosts.filter(p => {
        let matchesTitle = true;
        let matchesBody = true;

        if (titleQuery)
            matchesTitle = p.title.toLowerCase().includes(titleQuery.toLowerCase());
        if (bodyQuery)
            matchesBody = p.body.toLowerCase().includes(bodyQuery.toLowerCase());

        return matchesTitle && matchesBody;
    });

    currentPage = 1;
    render();
}

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        // Se c'era già un timer in corso, lo cancella
        clearTimeout(timeoutId);
        // Ne fa partire uno nuovo
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Event Listeners per filtri e paginazione
userFilter.addEventListener('change', (e) => {
    const userId = e.target.value;
    filteredPosts = userId ? allPosts.filter(p => p.userId == userId) : [...allPosts];
    currentPage = 1;
    render();
});

pageSizeSelect.addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 1;
    render();
});

inputs.forEach(input => {
    // Usiamo 'input' invece di 'change' e impostiamo un ritardo di 500ms
    input.addEventListener('input', debounce((e) => {
        // 1. Estrai e pulisci i valori
        const tVal = titleInput.value.trim();
        const bVal = bodyInput.value.trim();

        const titleLengthError = document.getElementById('titleLengthError');
        const bodyLengthError = document.getElementById('bodyLengthError');

        // 2. Resetta gli errori visivi
        titleLengthError.style.display = 'none';
        bodyLengthError.style.display = 'none';

        let isValid = true;

        // 3. Valida il Titolo
        if (tVal.length > 0 && tVal.length < 3) {
            titleLengthError.style.display = 'block';
            titleLengthError.style.color = 'darkred';
            isValid = false;
        }

        // 4. Valida il Corpo
        if (bVal.length > 0 && bVal.length < 3) {
            bodyLengthError.style.display = 'block';
            bodyLengthError.style.color = 'darkred';
            isValid = false;
        }

        // Se c'è un errore di validazione, fermati qui
        if (!isValid) return;

        // 5. Caso di Reset (entrambi i campi vuoti)
        if (tVal.length === 0 && bVal.length === 0) {
            filteredPosts = [...allPosts];
            currentPage = 1;
            render();
            return;
        }

        // 6. Esegui la ricerca con i valori validati
        triggerSearch(tVal, bVal);
    }, 500)); // <-- 500 millisecondi di attesa prima di far partire la ricerca
});

function goToPage(page) {
    currentPage = page;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

init();