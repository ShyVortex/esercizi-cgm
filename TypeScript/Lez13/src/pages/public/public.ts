import { postsService } from "../../api/posts.service.js";
import { usersService } from "../../api/users.service.js";
import { commentsService } from "../../api/comments.service.js";
import { store } from "../../core/store.js";
import { PaginationComponent } from "../../components/pagination.component.js";
import { sleep } from "../../shared/utils/sleep.js";
import { WINDOW_URL } from "../../core/constants.js";
import * as Elements from "./elements.js";
import { Post } from "../../shared/types/post.js";

class PublicPage {
    private pagination: PaginationComponent;

    constructor() {
        this.pagination = new PaginationComponent({
            btnFirst: Elements.btnFirstPage,
            btnPrev: Elements.btnPrev,
            btnPrevTen: Elements.btnPrevTen,
            btnNext: Elements.btnNext,
            btnNextTen: Elements.btnNextTen,
            btnLast: Elements.btnLastPage,
            inputPage: Elements.currentPageInput,
            lblTotal: Elements.ofTotLab
        }, (page) => this.goToPage(page));

        this.setupListeners();
    }

    private setupListeners(): void {
        Elements.userFilter.onchange = (e: Event) => {
            store.shared.userId = parseInt((e.target as HTMLSelectElement).value);
            this.applyFiltersAndRender();
        };

        Elements.pageSizeSelect.onchange = (e: Event) => {
            store.shared.itemsPerPage = parseInt((e.target as HTMLSelectElement).value);
            store.shared.currentPage = 1;
            this.render();
        };

        Elements.searchButton.onclick = () => this.handleSearch();
        Elements.resetButton.onclick = () => this.handleReset();
        Elements.adminButton.onclick = () => window.location.href = `${WINDOW_URL}/src/pages/admin`;

        Elements.tbInput.onkeypress = (e: KeyboardEvent) => {
            if (e.key === 'Enter') this.handleSearch();
        };
    }

    public async init(): Promise<void> {
        try {
            const [posts, users] = await Promise.all([
                postsService.getActivePosts(),
                usersService.getActiveUsers()
            ]);

            store.shared.allPosts = posts;
            store.shared.filteredPosts = [...posts];

            // Setup users filter
            users.forEach(u => {
                store.shared.allUsers[u.id] = u.name;
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = u.name;
                Elements.userFilter.appendChild(opt);
            });

            this.render();
        } catch (error) {
            Elements.postsContainer.innerHTML = `<p class="text-red-500 text-center py-4">Errore nel caricamento dei dati.</p>`;
        }
    }

    private handleSearch(): void {
        const query = Elements.tbInput.value.trim();
        const errorLabel = document.getElementById('tbLengthError') as HTMLElement;
        
        if (query.length > 0 && query.length < 3) {
            errorLabel.style.display = 'block';
            errorLabel.style.color = 'darkred';
            return;
        }
        
        errorLabel.style.display = 'none';
        Elements.resetButton.hidden = query === '';
        this.triggerSearch(query);
    }

    private handleReset(): void {
        Elements.tbInput.value = '';
        Elements.resetButton.hidden = true;
        this.applyFiltersAndRender();
    }

    public async triggerSearch(query: string): Promise<void> {
        this.showLoading();
        await sleep(1000 + Math.random() * 2000); // Simulate network delay

        // Random error simulation
        if (Math.floor(Math.random() * 10) + 1 === 1) {
            this.showError(query);
            return;
        }

        this.applyFiltersAndRender(query);
    }

    private applyFiltersAndRender(query: string = ''): void {
        store.shared.filteredPosts = store.shared.allPosts.filter(p => {
            const matchesQuery = query ? (p.title.toLowerCase().includes(query.toLowerCase()) || p.body.toLowerCase().includes(query.toLowerCase())) : true;
            const matchesUser = store.shared.userId ? p.userId == store.shared.userId : true;
            return matchesQuery && matchesUser;
        });

        store.shared.currentPage = 1;
        this.render();
    }

    private render(): void {
        const { currentPage, itemsPerPage, filteredPosts } = store.shared;
        const totalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedItems = filteredPosts.slice(startIndex, startIndex + itemsPerPage);

        Elements.paginationControls.style.display = filteredPosts.length > 0 ? 'flex' : 'none';
        
        if (paginatedItems.length === 0) {
            Elements.postsContainer.innerHTML = '<p class="text-center py-10 text-gray-500 text-lg">Nessun risultato trovato.</p>';
        } else {
            Elements.postsContainer.innerHTML = paginatedItems.map(post => this.createPostCard(post)).join('');
        }

        this.pagination.render(currentPage, totalPages);
    }

    private createPostCard(post: Post): string {
        return `
            <div id="post-${post.id}" onclick="window.publicPage.toggleDetail(${post.id})" class="bg-white p-5 rounded-lg shadow hover:shadow-md transition-all cursor-pointer border-l-4 border-blue-500">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-xl font-semibold text-gray-800">${post.title}</h2>
                        <p class="text-sm text-blue-600 font-medium mb-2">Autore: ${store.shared.allUsers[post.userId]}</p>
                    </div>
                    <span class="text-gray-400 text-sm">&#9660;</span>
                </div>
                <p class="excerpt text-gray-600 italic">"${post.body.substring(0, 20)}..."</p>
                <div id="detail-${post.id}" data-loaded="false" class="hidden mt-4 pt-4 border-t border-gray-100"></div>
            </div>
        `;
    }

    public async toggleDetail(postId: number): Promise<void> {
        const detailContainer = document.getElementById(`detail-${postId}`) as HTMLElement;
        const excerpt = document.querySelector(`#post-${postId} .excerpt`) as Element;

        if (detailContainer.dataset.loaded === "true") {
            detailContainer.classList.toggle('hidden');
            excerpt.classList.toggle('hidden');
            return;
        }

        excerpt.classList.add('hidden');
        detailContainer.classList.remove('hidden');
        detailContainer.innerHTML = '<div class="flex justify-center py-4"><div class="loader rounded-full border-4 border-t-4 border-gray-200 h-6 w-6"></div></div>';

        try {
            const post = await postsService.getById(postId);
            const comments = await commentsService.getCommentsByPostId(postId);

            detailContainer.innerHTML = `
                <div class="text-gray-700 leading-relaxed mb-6 bg-gray-50 p-4 rounded-md">${post.body}</div>
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
            detailContainer.dataset.loaded = "true";
        } catch (error) {
            detailContainer.innerHTML = '<p class="text-red-500 text-sm">Errore nel caricamento dei dettagli.</p>';
            excerpt.classList.remove('hidden');
        }
    }

    private goToPage(page: number): void {
        store.shared.currentPage = page;
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    private showLoading(): void {
        Elements.postsContainer.innerHTML = `
            <div class="flex justify-center py-10">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
            </div>
        `;
        Elements.paginationControls.style.display = 'none';
    }

    private showError(query: string): void {
        Elements.postsContainer.innerHTML = `
            <div class="text-center py-10">
                <p class="text-red-600 text-lg font-semibold mb-4">Errore temporaneo del server.</p>
                <button onclick="window.publicPage.triggerSearch('${query}')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    Riprova
                </button>
            </div>
        `;
        Elements.paginationControls.style.display = 'none';
    }
}

const publicPage = new PublicPage();
(window as any).publicPage = publicPage;
publicPage.init();
