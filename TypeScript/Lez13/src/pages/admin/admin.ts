import { resourceService } from "../../api/resource.service.js";
import { usersService } from "../../api/users.service.js";
import { store } from "../../core/store.js";
import { APP_CONFIG, BASE_URL, WINDOW_URL, IS_LOCAL } from "../../core/constants.js";
import { PaginationComponent } from "../../components/pagination.component.js";
import { ModalComponent } from "../../components/modal.component.js";
import { TableComponent } from "../../components/table.component.js";
import { isComment, isItemArray, isPost, isResponseJson, isRole, isUser } from "../../shared/utils/validator.js";
import * as Elements from "./elements.js";
import { ResponseSearch } from "../../shared/types/response.js";

class AdminPage {
    private pagination: PaginationComponent;
    private modal: ModalComponent;
    private table: TableComponent;

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
        }, (page) => {
            store.state.page = page;
            this.fetchData();
        });

        this.modal = new ModalComponent(Elements.crudModal, Elements.crudForm);
        
        this.table = new TableComponent(Elements.tableHead, Elements.tableBody, Elements.tableState, {
            onEdit: (id) => this.editItem(id),
            onDelete: (id) => this.logicalDelete(id),
            onPhysicalDelete: (id) => this.physicalDelete(id),
            onRestore: (id) => this.restoreItem(id)
        });

        this.setupListeners();
    }

    private setupListeners(): void {
        const loginForm = document.getElementById('loginForm') as HTMLFormElement;
        if (loginForm) {
            loginForm.onsubmit = (e) => this.handleLogin(e);
        }
        
        Elements.crudForm.onsubmit = (e) => this.handleFormSubmit(e);
        
        Elements.userFilter.onchange = (e) => {
            const val = (e.target as HTMLSelectElement).value;
            store.shared.userId = val ? parseInt(val, 10) : undefined;
            this.triggerSearch();
        };

        Elements.pageSizeSelect.onchange = (e) => {
            const section = this.getCurrentSection();
            const perPageItem = store.state.per_page.find(v => v.name === section) 
                             || store.state.per_page.find(v => v.name === 'trash');
            if (perPageItem) {
                perPageItem.length = parseInt((e.target as HTMLSelectElement).value);
            }
            store.state.page = 1;
            this.fetchData();
        };

        Elements.btnSearch.onclick = () => this.triggerSearch();
        Elements.searchInput.onkeypress = (e) => {
            if (e.key === 'Enter') { e.preventDefault(); this.triggerSearch(); }
        };
    }

    private handleLogin(e: Event): void {
        e.preventDefault();
        const user = (document.getElementById('username') as HTMLInputElement).value;
        const pass = (document.getElementById('password') as HTMLInputElement).value;
        const error = document.getElementById('loginError') as HTMLElement;

        if (user === APP_CONFIG.LOGIN_USERNAME && pass === APP_CONFIG.LOGIN_PASSWORD) {
            store.state.isAuthenticated = true;
            Elements.loginSection.classList.add('hidden');
            Elements.dashboardSection.classList.remove('hidden');
            this.fetchData();
        } else {
            error.classList.remove('hidden');
        }
    }

    public async fetchData(): Promise<void> {
        this.table.showLoading();
        
        if (store.state.resource !== 'posts') {
            Elements.userFilterSection.classList.add('hidden');
        } else {
            Elements.userFilterSection.classList.remove('hidden');
            if (Elements.userFilter.options.length <= 1) {
                await this.loadUsersForFilter();
            }
        }

        const query = Elements.searchInput.value.trim().toLowerCase();
        let params = `?isActive=${!store.state.isBin}`;

        if (store.shared.userId && store.state.resource === 'posts') {
            params += `&userId=${store.shared.userId}`;
        }

        const pageSize = store.getPerPageLength(this.getCurrentSection());

        if (!query) {
            if (IS_LOCAL) {
                params += `&_page=${store.state.page}&_per_page=${pageSize}`;
            } else {
                params += `&_page=${store.state.page}&_limit=${pageSize}`;
            }
        }

        try {
            const response = await fetch(`${BASE_URL}/${store.state.resource}${params}`);
            let data: ResponseSearch = await response.json();

            if (!query && isResponseJson(data)) {
                store.shared.totalPages = data.pages || 1;
            } else if (isItemArray(data)) {
                if (query) {
                    data = data.filter(item => this.filterItem(item, query));
                    store.shared.totalPages = Math.ceil(data.length / pageSize) || 1;
                    const start = (store.state.page - 1) * pageSize;
                    data = data.slice(start, start + pageSize);
                } else {
                    const totalCount = Math.ceil(Number(response.headers.get('X-Total-Count')) / pageSize) || 1;
                    store.shared.totalPages = totalCount;
                }
            }

            if (isItemArray(data)) {
                this.table.render(data, store.state.isBin);
            } else if (isResponseJson(data)) {
                this.table.render(data.data, store.state.isBin);
            }

            this.pagination.render(store.state.page, store.shared.totalPages);
        } catch (err) {
            this.table.showError("Errore nel caricamento dei dati.");
        }
    }

    private filterItem(item: any, query: string): boolean {
        if (store.state.resource === 'posts' && isPost(item)) {
            return (item.title?.toLowerCase().includes(query) || item.body?.toLowerCase().includes(query));
        } else if (store.state.resource === 'comments' && isComment(item)) {
            return (item.body?.toLowerCase().includes(query) || item.email?.toLowerCase().includes(query));
        } else if (isUser(item) || isRole(item)) {
            return item.name?.toLowerCase().includes(query);
        }
        return false;
    }

    private async loadUsersForFilter(): Promise<void> {
        try {
            const users = await usersService.getAll();
            users.forEach(u => {
                store.shared.allUsers[u.id] = u.name;
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = u.name;
                Elements.userFilter.appendChild(opt);
            });
        } catch (e) { console.error("Errore caricamento utenti", e); }
    }

    public changeSection(res: string): void {
        store.state.resource = res;
        store.state.page = 1;
        store.state.isBin = false;

        const perPageItem = store.state.per_page.find(v => v.name === res);
        Elements.pageSizeSelect.value = perPageItem?.length.toString() || "5";

        document.getElementById('sectionTitle')!.innerText = res;
        (document.getElementById('btnBin') as HTMLButtonElement).innerText = "Cestino";
        this.fetchData();
    }

    public toggleBin(): void {
        store.state.isBin = !store.state.isBin;
        store.state.page = 1;
        document.getElementById('sectionTitle')!.innerText = store.state.isBin ? `Cestino ${store.state.resource}` : store.state.resource;
        (document.getElementById('btnBin') as HTMLButtonElement).innerText = store.state.isBin ? "Torna alla Lista" : "Cestino";
        this.fetchData();
    }

    public async logicalDelete(id: string): Promise<void> {
        if (!confirm("Spostare nel cestino?")) return;
        try {
            await resourceService.logicalDelete(store.state.resource, id);
            this.fetchData();
        } catch (err) { alert("Errore eliminazione"); }
    }

    public async physicalDelete(id: string): Promise<void> {
        if (!confirm("Eliminare definitivamente?")) return;
        try {
            await resourceService.physicalDelete(store.state.resource, id);
            this.fetchData();
        } catch (err) { alert("Errore eliminazione"); }
    }

    public async restoreItem(id: string): Promise<void> {
        try {
            await resourceService.restoreItem(store.state.resource, id);
            this.fetchData();
        } catch (err) { alert("Errore ripristino"); }
    }

    public openCreateModal(): void {
        store.shared.currentEditId = null;
        this.renderModalForm(null);
        this.modal.open(`Nuovo ${store.state.resource.slice(0, -1)}`, Elements.modalTitle);
    }

    public async editItem(id: string): Promise<void> {
        store.shared.currentEditId = id;
        try {
            const item = await resourceService.getItem(store.state.resource, id);
            this.renderModalForm(item);
            this.modal.open(`Modifica ${store.state.resource.slice(0, -1)}`, Elements.modalTitle);
        } catch (err) { alert("Errore caricamento dati"); }
    }

    private renderModalForm(item: any | null): void {
        const fields = store.resourceFields[store.state.resource as keyof typeof store.resourceFields] || ['name'];
        Elements.formFields.innerHTML = fields.map(field => {
            const value = item ? this.getNestedValue(item, field) : '';
            let input = '';
            if (field === 'userId') {
                let options = '<option value="">Seleziona...</option>';
                for (const uId in store.shared.allUsers) {
                    options += `<option value="${uId}" ${uId == value ? 'selected' : ''}>${store.shared.allUsers[uId]}</option>`;
                }
                input = `<select name="${field}" class="mt-1 block w-full border p-2 rounded shadow-sm outline-none focus:ring-2 focus:ring-blue-500" required>${options}</select>`;
            } else {
                input = `<input type="text" name="${field}" value="${value}" class="mt-1 block w-full border p-2 rounded shadow-sm outline-none focus:ring-2 focus:ring-blue-500" required>`;
            }
            return `<div><label class="block text-sm font-medium text-gray-700 capitalize">${field.replace(/\./g, ' ')}</label>${input}</div>`;
        }).join('');
    }

    private getNestedValue(obj: any, path: string): string {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '';
    }

    private async handleFormSubmit(e: Event): Promise<void> {
        e.preventDefault();
        const formData = new FormData(Elements.crudForm);
        const dataObj: Record<string, any> = {};

        for (let [key, value] of formData.entries()) {
            const parts = key.split('.');
            if (parts.length === 1) dataObj[key] = value;
            else {
                if (!dataObj[parts[0]]) dataObj[parts[0]] = {};
                dataObj[parts[0]][parts[1]] = value;
            }
        }

        if (dataObj.postId) dataObj.postId = parseInt(dataObj.postId, 10);
        if (dataObj.userId) dataObj.userId = parseInt(dataObj.userId, 10);
        if (!store.shared.currentEditId) dataObj.isActive = true;

        try {
            const btn = Elements.crudForm.querySelector('button[type="submit"]') as HTMLButtonElement;
            btn.disabled = true;
            btn.innerText = 'Salvataggio...';

            if (store.shared.currentEditId) {
                await resourceService.updateItem(store.state.resource, store.shared.currentEditId, dataObj);
            } else {
                await resourceService.createItem(store.state.resource, dataObj);
            }

            this.modal.close();
            this.fetchData();
            btn.disabled = false;
            btn.innerText = 'Salva';
        } catch (err) { alert("Errore salvataggio"); }
    }

    private getCurrentSection(): string {
        const titleEl = document.getElementById('sectionTitle');
        return titleEl ? titleEl.innerText.toLowerCase() : store.state.resource;
    }

    private triggerSearch(): void {
        store.state.page = 1;
        this.fetchData();
    }

    public logout(): void {
        window.location.href = `${WINDOW_URL}/src/pages/public`;
    }

    public closeModal(): void {
        this.modal.close();
    }
}

const adminPage = new AdminPage();
(window as any).adminPage = adminPage;
// Exporting for inline handlers
(window as any).changeSection = (res: string) => adminPage.changeSection(res);
(window as any).toggleBin = () => adminPage.toggleBin();
(window as any).logout = () => adminPage.logout();
(window as any).openCreateModal = () => adminPage.openCreateModal();
(window as any).closeModal = () => adminPage.closeModal();
(window as any).fetchData = () => adminPage.fetchData();
(window as any).editItem = (id: string) => adminPage.editItem(id);
(window as any).logicalDelete = (id: string) => adminPage.logicalDelete(id);
(window as any).physicalDelete = (id: string) => adminPage.physicalDelete(id);
(window as any).restoreItem = (id: string) => adminPage.restoreItem(id);
