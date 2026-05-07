/*
Fare il refactor del mini progetto Javascript fatto alla lezione 9 trasformando il progetto da Javascript a Typescript
separando bene la logica in file separati per types/inferfaces, servizi API, helpers, componenti pagina, ecc…
(si consiglia di seguire la struttura delle cartelle e dei file forniti in data odierna) ed evitando il più possibile
codice duplicato, non tipizzato correttamente e con nomi oppure con logiche poco chiare.
*/

import { Post } from "../../types/post.js";
import { User } from "../../types/user.js";
import { Comment } from "../../types/comment.js";
import { sleep } from "../../helpers/sleep.js";

import { PostsService } from "../../services/posts.service.js";
import { UsersService } from "../../services/users.service.js";
import { CommentsService } from "../../services/comments.service.js";

import * as Elements from "./elements.js";
import * as Globals from "../globals.js";
import { PublicRender } from "../../commons/render.js";
import { Pagination } from "../../commons/pagination.js";

// Inizializzazione
async function init(): Promise<void> {
    try {
        const posts: Post[] = await PostsService.getAllPosts();
        const users: User[] = await UsersService.getAllUsers();

        // Mappa gli utenti
        users.forEach(u => {
            Globals.shared.allUsers[u.id] = u.name;
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = u.name;
            Elements.userFilter.appendChild(opt);
        });

        Globals.shared.allPosts = posts;
        Globals.shared.filteredPosts = [...Globals.shared.allPosts];
        render();

    } catch (error) {
        Elements.postsContainer.innerHTML = `<p class="text-red-500 text-center py-4">Errore nel caricamento dei dati iniziali.</p>`;
    }
}

// Rendering lista
function render(): void {
    PublicRender.render();
}

function renderLoading(): void {
    PublicRender.renderLoading();
}

function renderServerError(query: string): void {
    PublicRender.renderServerError(query);
}

function renderPosts(posts: Post[]): void {
    PublicRender.showPosts(posts);
}

function renderPagination(): void {
    Pagination.publicPagination();
}

// Event Listeners per i pulsanti della paginazione
Elements.btnFirstPage.addEventListener('click', () => goToPage(1));

Elements.btnPrev.addEventListener('click', () => goToPage(Globals.shared.currentPage - 1));

Elements.btnPrevTen.addEventListener('click', () => goToPage(Math.max(1, Globals.shared.currentPage - 10)));

Elements.btnNext.addEventListener('click', () => {
    const totalPages: number = Math.ceil(Globals.shared.filteredPosts.length / Globals.shared.itemsPerPage) || 1;
    if (Globals.shared.currentPage < totalPages) goToPage(Globals.shared.currentPage + 1);
});

Elements.btnNextTen.addEventListener('click', () => {
    const totalPages: number = Math.ceil(Globals.shared.filteredPosts.length / Globals.shared.itemsPerPage) || 1;
    goToPage(Math.min(totalPages, Globals.shared.currentPage + 10));
});

Elements.btnLastPage.addEventListener('click', () => {
    const totalPages: number = Math.ceil(Globals.shared.filteredPosts.length / Globals.shared.itemsPerPage) || 1;
    goToPage(totalPages);
});

// Listener per la casella di input in cui l'utente può digitare la pagina
Elements.currentPageInput.addEventListener('change', (e: Event) => {
    let val: number = parseInt((e.target as HTMLInputElement).value);
    const totalPages: number = Math.ceil(Globals.shared.filteredPosts.length / Globals.shared.itemsPerPage) || 1;

    // Controllo per evitare numeri invalidi
    if (isNaN(val) || val < 1) val = 1;
    if (val > totalPages) val = totalPages;

    goToPage(val);
});

// Espansione Card e Caricamento Dettagli
(window as any).toggleDetail = toggleDetail;
async function toggleDetail(postId: number): Promise<void> {
    const detailContainer = document.getElementById(`detail-${postId}`) as HTMLElement;
    const excerpt = document.querySelector(`#post-${postId} .excerpt`) as Element;

    // Se i dati sono già stati caricati in precedenza, fai solo il toggle della visibilità
    if (detailContainer.dataset.loaded === "true") {
        detailContainer.classList.toggle('hidden');
        excerpt.classList.toggle('hidden');
        return;
    }

    // Primo click: nascondi lf'anteprima, mostra il loader ed esegui la fetch
    excerpt.classList.add('hidden');
    detailContainer.classList.remove('hidden');
    detailContainer.innerHTML = '<div class="flex justify-center py-4"><div class="loader rounded-full border-4 border-t-4 border-gray-200 h-6 w-6"></div></div>';

    try {
        const post: Post = await PostsService.getPost(postId);
        const comments: Comment[] = await CommentsService.getAllComments();

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

async function triggerSearch(query: string) {
    renderLoading();

    const delay: number = Math.floor(Math.random() * 3000) + 1000;
    await sleep(delay);

    const isError: boolean = Math.floor(Math.random() * 10) + 1 === 1;
    console.log(isError);

    if (isError) {
        renderServerError(query);
        return;
    }

    Globals.shared.filteredPosts = Globals.shared.allPosts.filter(p => {
        let matchesTitle: boolean = true;
        let matchesBody: boolean = true;
        let matchesUser: boolean = true;

        if (query) {
            matchesTitle = p.title.toLowerCase().includes(query.toLowerCase());
            matchesBody = p.body.toLowerCase().includes(query.toLowerCase());
        }
        if (Globals.shared.userId) {
            matchesUser = p.userId == Globals.shared.userId;
        }

        return (matchesTitle || matchesBody) && matchesUser;
    });

    Globals.shared.currentPage = 1;
    render();
}

// Event Listeners per filtri e paginazione
Elements.userFilter.addEventListener('change', (e: Event) => {
    Globals.shared.userId = parseInt((e.target as HTMLSelectElement).value);

    // Recupero i valori correnti della barra di ricerca (se ci sono)
    const qVal: string = Elements.tbInput.value.trim();

    if (qVal === '' || qVal.length < 3) {
        Globals.shared.filteredPosts = Globals.shared.userId ? Globals.shared.allPosts.filter(p => p.userId == Globals.shared.userId) : [...Globals.shared.allPosts];
        Globals.shared.currentPage = 1;
        render();
    } else {
        triggerSearch(qVal);
    }
});

Elements.pageSizeSelect.addEventListener('change', (e: Event) => {
    Globals.shared.itemsPerPage = parseInt((e.target as HTMLSelectElement).value);
    Globals.shared.currentPage = 1;
    render();
});

Elements.tbInput.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        // 1. Estrai e pulisci i valori
        const qVal: string = Elements.tbInput.value.trim();
        const tbLengthError = document.getElementById('tbLengthError') as HTMLLabelElement;

        // 2. Resetta gli errori visivi
        tbLengthError.style.display = 'none';

        let isValid: boolean = true;

        // 3. Valida il campo
        if (qVal.length >= 0 && qVal.length < 3) {
            tbLengthError.style.display = 'block';
            tbLengthError.style.color = 'darkred';
            isValid = false;
        }

        // Se c'è un errore di validazione, fermati qui
        if (!isValid) return;

        Elements.resetButton.hidden = false;

        // 4. Esegui la ricerca con i valori validati
        triggerSearch(qVal);
    }
});

Elements.searchButton.addEventListener('click', () => {
    const qVal: string = Elements.tbInput.value.trim();
    const tbLengthError = document.getElementById('tbLengthError') as HTMLLabelElement;

    tbLengthError.style.display = 'none';

    let isValid: boolean = true;

    if (qVal.length >= 0 && qVal.length < 3) {
        tbLengthError.style.display = 'block';
        tbLengthError.style.color = 'darkred';
        isValid = false;
    }

    if (!isValid) return;

    Elements.resetButton.hidden = false;

    triggerSearch(qVal);
});

Elements.resetButton.addEventListener('click', () => {
    const qVal: string = Elements.tbInput.value.trim();
    const tbLengthError = document.getElementById('tbLengthError') as HTMLLabelElement;
    tbLengthError.style.display = 'none';

    Elements.tbInput.value = '';
    Elements.resetButton.hidden = true;

    Globals.shared.filteredPosts = Globals.shared.userId ? Globals.shared.allPosts.filter(p => p.userId == Globals.shared.userId) : [...Globals.shared.allPosts];
    Globals.shared.currentPage = 1;
    render();
    return;
})

function goToPage(page: number) {
    Globals.shared.currentPage = page;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

init();
