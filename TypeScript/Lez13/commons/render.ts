import { Post } from "../types/post.js";
import * as PublicElements from "../pages/public/elements.js";
import * as AdminElements from "../pages/admin/elements.js";
import * as Globals from "../pages/globals.js";
import { sleep } from "../helpers/sleep.js";
import { Pagination } from "./pagination.js";
import { Item } from "../types/item.js";
import { isUser } from "../utilities/validator.js";

export class PublicRender {
    // Rendering schermata pubblica
    static render(): void {
        const startIndex: number = (Globals.shared.currentPage - 1) * Globals.shared.itemsPerPage;
        const endIndex: number = startIndex + Globals.shared.itemsPerPage;
        const paginatedItems: Post[] = Globals.shared.filteredPosts.slice(startIndex, endIndex);

        // Ri-mostriamo la paginazione solo se ci sono risultati
        PublicElements.paginationControls.style.display = Globals.shared.filteredPosts.length > 0 ? 'flex' : 'none';

        this.showPosts(paginatedItems);
        Pagination.publicPagination();
    }

    static showPosts(posts: Post[]): void {
        if (posts.length === 0) {
            PublicElements.postsContainer.innerHTML = '<p class="text-center py-10 text-gray-500 text-lg">Nessun risultato trovato.</p>';
            return;
        }

        PublicElements.postsContainer.innerHTML = posts.map(post => `
                    <div id="post-${post.id}" onclick="toggleDetail(${post.id})" class="bg-white p-5 rounded-lg shadow hover:shadow-md transition-all cursor-pointer border-l-4 border-blue-500">
                        <div class="flex justify-between items-start">
                            <div>
                                <h2 class="text-xl font-semibold text-gray-800">${post.title}</h2>
                                <p class="text-sm text-blue-600 font-medium mb-2">Autore: ${Globals.shared.allUsers[post.userId]}</p>
                            </div>
                            <span class="text-gray-400 text-sm">&#9660;</span>
                        </div>
                        
                        <p class="excerpt text-gray-600 italic">"${post.body.substring(0, 20)}..."</p>
                        
                        <div id="detail-${post.id}" data-loaded="false" class="hidden mt-4 pt-4 border-t border-gray-100">
                            </div>
                    </div>
                `).join('');
    }

    static renderLoading(): void {
        PublicElements.postsContainer.innerHTML = `
            <div class="flex justify-center py-10">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
            </div>
        `;

        PublicElements.paginationControls.style.display = 'none';
    }

    static async renderWithLoading(): Promise<void> {
        this.renderLoading();

        const delay: number = Math.floor(Math.random() * 3000) + 1000;
        await sleep(delay);

        const startIndex: number = (Globals.shared.currentPage - 1) * Globals.shared.itemsPerPage;
        const endIndex: number = startIndex + Globals.shared.itemsPerPage;
        const paginatedItems: Post[] = Globals.shared.filteredPosts.slice(startIndex, endIndex);

        this.showPosts(paginatedItems);
        Pagination.publicPagination();
    }

    static renderServerError(query: string): void {
        PublicElements.postsContainer.innerHTML = `
            <div class="text-center py-10">
                <p class="text-red-600 text-lg font-semibold mb-4">Errore temporaneo del server.</p>
                <button onclick="triggerSearch('${query}')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    Riprova
                </button>
            </div>
        `;

        PublicElements.paginationControls.style.display = 'none';
    }
}

export class AdminRender {
    static renderTable(data: Item[]): void {
        AdminElements.tableBody.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            AdminElements.tableState.innerHTML = "Nessun risultato trovato.";
            AdminElements.tableState.classList.remove('hidden');
            return;
        }

        AdminElements.tableState.classList.add('hidden');

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
        AdminElements.tableHead.innerHTML = keys.map(k => `<th class="p-4 border-b uppercase text-xs text-gray-400 font-bold">${k}</th>`).join('') + '<th class="p-4 border-b text-right">Azioni</th>';

        // Usiamo "formattedData" anche qui per generare le righe
        AdminElements.tableBody.innerHTML = formattedData.map(item => `
            <tr class="hover:bg-gray-50 border-b last:border-0">
                ${keys.map(k => `<td class="p-4 text-sm text-gray-600">${(item as Record<string, any>)[k]}</td>`).join('')}
                <td class="p-4 text-right space-x-2">
                    ${Globals.state.isBin
                ? `<button onclick="physicalDelete('${item.id}')" class="text-red-500 font-bold">Cancella</button>
                   <button onclick="restoreItem('${item.id}')" class="text-blue-500 font-bold">Ripristina</button>`
                : `<button onclick="editItem('${item.id}')" class="text-yellow-600">Modifica</button>
                           <button onclick="logicalDelete('${item.id}')" class="text-red-500">Elimina</button>`
            }
                </td>
            </tr>
        `).join('');
    }

    static showLoading(isLoading: boolean): void {
        const btn = document.getElementById('btnSearch') as HTMLButtonElement;
        btn.disabled = isLoading;
        if (isLoading) {
            AdminElements.tableBody.innerHTML = '<tr><td colspan="10" class="p-10 text-center"><div class="loader inline-block rounded-full border-4 border-t-4 h-8 w-8"></div></td></tr>';
        }
    }

    static showError(message: string): void {
        // Svuotiamo il corpo della tabella (rimuove il loader o vecchi dati)
        AdminElements.tableBody.innerHTML = '';

        // Inseriamo il messaggio di errore nel contenitore di stato
        AdminElements.tableState.innerHTML = `
            <div class="text-red-500">
                <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="font-bold text-lg">${message}</p>
                <p class="text-sm mt-2 text-gray-500">Assicurati che json-server sia in esecuzione sulla porta 3000.</p>
            </div>
        `;

        // Rendiamo visibile il blocco di stato
        AdminElements.tableState.classList.remove('hidden');
    }
}
