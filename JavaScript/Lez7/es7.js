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
const postModal = document.getElementById('postModal');
const modalContent = document.getElementById('modalContent');

// Inizializzazione
async function init() {
    try {
        const [postsRes, usersRes] = await Promise.all([
            fetch('https://jsonplaceholder.typicode.com/posts'),
            fetch('https://jsonplaceholder.typicode.com/users')
        ]);

        const posts = await postsRes.json();
        const users = await usersRes.json();

        // Mappa gli utenti per un accesso rapido via ID
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
        postsContainer.innerHTML = `<p class="text-red-500">Errore nel caricamento dei dati.</p>`;
    }
}

// Funzione di rendering principale
function render() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredPosts.slice(startIndex, endIndex);

    renderPosts(paginatedItems);
    renderPagination();
}

function renderPosts(posts) {
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p class="text-center py-10">Nessun post trovato.</p>';
        return;
    }

    postsContainer.innerHTML = posts.map(post => `
                <div onclick="showDetail(${post.id})" class="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
                    <h2 class="text-xl font-semibold text-gray-800">${post.title}</h2>
                    <p class="text-sm text-blue-600 font-medium mb-2">Autore: ${allUsers[post.userId]}</p>
                    <p class="text-gray-600 italic">"${post.body.substring(0, 20)}..."</p>
                </div>
            `).join('');
}

function renderPagination() {
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    let html = '';

    for (let i = 1; i <= totalPages; i++) {
        html += `
                    <button onclick="goToPage(${i})" class="px-3 py-1 rounded ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}">
                        ${i}
                    </button>
                `;
    }
    paginationControls.innerHTML = html;
}

// Gestione Dettaglio e Commenti
async function showDetail(postId) {
    modalContent.innerHTML = '<div class="flex justify-center"><div class="loader rounded-full border-4 border-t-4 border-gray-200 h-8 w-8"></div></div>';
    postModal.classList.remove('hidden');

    try {
        const [postRes, commRes] = await Promise.all([
            fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`),
            fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`)
        ]);

        const post = await postRes.json();
        const comments = await commRes.json();

        modalContent.innerHTML = `
                    <h2 class="text-2xl font-bold mb-2">${post.title}</h2>
                    <p class="text-blue-600 mb-4 font-semibold">Autore: ${allUsers[post.userId]}</p>
                    <div class="bg-gray-50 p-4 rounded mb-6 text-gray-700 leading-relaxed">
                        ${post.body}
                    </div>
                    <h3 class="text-lg font-bold mb-4 border-b pb-2">Commenti (${comments.length})</h3>
                    <div class="space-y-4">
                        ${comments.map(c => `
                            <div class="border-b border-gray-100 pb-3">
                                <p class="text-sm font-bold text-gray-800">${c.email}</p>
                                <p class="text-sm text-gray-600">${c.body}</p>
                            </div>
                        `).join('')}
                    </div>
                `;
    } catch (error) {
        modalContent.innerHTML = '<p class="text-red-500">Errore nel caricamento del dettaglio.</p>';
    }
}

// Event Listeners
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

function closeModal() {
    postModal.classList.add('hidden');
}

// Chiudi modal cliccando fuori
window.onclick = (event) => {
    if (event.target == postModal) closeModal();
}

init();