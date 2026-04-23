/*
Utilizzando JSONPlaceholder (https://jsonplaceholder.typicode.com/) creare un'interfaccia
che restituisca un elenco di articoli (post) in cui è possibile vedere il titolo,
il nome dell’utente (user), che si può ottenere dall’apposita rotta “user”,
e i primi 20 caratteri del body, cliccando sul singolo elemento si deve vedere il
dettaglio completo del post e i suoi relativi commenti (comments).
Crea nell’elenco il filtro per il campo utente (userId) in modo che si possano cercare
tutti gli articoli (post) di un certo utente mostrandone il nome ricevuto,
preso sempre dall’apposita rotta “user”.

Extra: Per l’elenco dei post implementa la paginazione, dove l’utente che sta usando l’UI
può scegliere se vedere 5, 10, 15, 20 o 25 risultati per pagina.
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

function renderPosts(posts) {
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p class="text-center py-10 text-gray-500">Nessun post trovato.</p>';
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

function goToPage(page) {
    currentPage = page;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

init();