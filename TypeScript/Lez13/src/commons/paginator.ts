import * as PublicElements from "../pages/public/elements.js";
import * as AdminElements from "../pages/admin/elements.js";
import * as Globals from "../pages/globals.js";

export class Paginator {
    static publicPagination(): void {
        const totalPages: number = Math.ceil(Globals.shared.filteredPosts.length / Globals.shared.itemsPerPage);

        // Aggiorniamo i testi e gli input
        PublicElements.currentPageInput.value = Globals.shared.currentPage.toString();
        PublicElements.ofTotLab.textContent = `di ${totalPages}`;
        PublicElements.btnLastPage.textContent = totalPages.toString();

        // Logica di abilitazione/disabilitazione
        this.toggleButton(PublicElements.btnFirstPage, Globals.shared.currentPage === 1);
        this.toggleButton(PublicElements.btnPrev, Globals.shared.currentPage === 1);
        this.toggleButton(PublicElements.btnPrevTen, Globals.shared.currentPage <= 10);

        this.toggleButton(PublicElements.btnNext, Globals.shared.currentPage === totalPages);
        this.toggleButton(PublicElements.btnNextTen, Globals.shared.currentPage > totalPages - 10);
        this.toggleButton(PublicElements.btnLastPage, Globals.shared.currentPage === totalPages);
    }

    static adminPagination(): void {
        // Aggiorniamo i testi e gli input
        AdminElements.currentPageInput.value = Globals.state.page.toString();
        AdminElements.ofTotLab.textContent = `di ${Globals.shared.totalPages}`;
        AdminElements.btnLastPage.textContent = Globals.shared.totalPages.toString();

        // Logica di abilitazione/disabilitazione
        this.toggleButton(AdminElements.btnFirstPage, Globals.state.page === 1);
        this.toggleButton(AdminElements.btnPrev, Globals.state.page === 1);
        this.toggleButton(AdminElements.btnPrevTen, Globals.state.page <= 10);

        this.toggleButton(AdminElements.btnNext, Globals.state.page === Globals.shared.totalPages);
        this.toggleButton(AdminElements.btnNextTen, Globals.state.page > Globals.shared.totalPages - 10);
        this.toggleButton(AdminElements.btnLastPage, Globals.state.page === Globals.shared.totalPages);
    }

    static toggleButton(btn: HTMLButtonElement, isDisabled: boolean): void {
        btn.disabled = isDisabled;
        if (isDisabled) {
            btn.classList.add('opacity-40', 'cursor-not-allowed', 'bg-gray-100');
            btn.classList.remove('hover:bg-gray-200');
        } else {
            btn.classList.remove('opacity-40', 'cursor-not-allowed', 'bg-gray-100');
            btn.classList.add('hover:bg-gray-200');
        }
    }
}
