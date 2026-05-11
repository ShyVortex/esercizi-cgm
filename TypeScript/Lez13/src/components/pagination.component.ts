export interface PaginationElements {
    btnFirst: HTMLButtonElement;
    btnPrev: HTMLButtonElement;
    btnPrevTen: HTMLButtonElement;
    btnNext: HTMLButtonElement;
    btnNextTen: HTMLButtonElement;
    btnLast: HTMLButtonElement;
    inputPage: HTMLInputElement;
    lblTotal: HTMLElement;
}

export class PaginationComponent {
    private currentPage: number = 1;
    private totalPages: number = 1;

    constructor(
        private elements: PaginationElements,
        private onPageChange: (page: number) => void
    ) {
        this.init();
    }

    private init(): void {
        this.elements.btnFirst.onclick = () => this.goToPage(1);
        this.elements.btnPrev.onclick = () => this.goToPage(this.currentPage - 1);
        this.elements.btnPrevTen.onclick = () => this.goToPage(this.currentPage - 10);
        this.elements.btnNext.onclick = () => this.goToPage(this.currentPage + 1);
        this.elements.btnNextTen.onclick = () => this.goToPage(this.currentPage + 10);
        this.elements.btnLast.onclick = () => this.goToPage(this.totalPages);

        this.elements.inputPage.onchange = (e: Event) => {
            const val = parseInt((e.target as HTMLInputElement).value);
            if (!isNaN(val)) this.goToPage(val);
        };
    }

    public render(currentPage: number, totalPages: number): void {
        this.currentPage = currentPage;
        this.totalPages = Math.max(1, totalPages);

        this.elements.inputPage.value = this.currentPage.toString();
        this.elements.lblTotal.textContent = `di ${this.totalPages}`;
        this.elements.btnLast.textContent = this.totalPages.toString();

        this.updateButtonsState();
    }

    private goToPage(page: number): void {
        let targetPage = page;
        if (targetPage < 1) targetPage = 1;
        if (targetPage > this.totalPages) targetPage = this.totalPages;

        if (targetPage !== this.currentPage) {
            this.onPageChange(targetPage);
        } else {
            // Re-render to fix input value if it was invalid
            this.elements.inputPage.value = this.currentPage.toString();
        }
    }

    private updateButtonsState(): void {
        this.toggleButton(this.elements.btnFirst, this.currentPage === 1);
        this.toggleButton(this.elements.btnPrev, this.currentPage === 1);
        this.toggleButton(this.elements.btnPrevTen, this.currentPage <= 10);

        this.toggleButton(this.elements.btnNext, this.currentPage === this.totalPages);
        this.toggleButton(this.elements.btnNextTen, this.currentPage > this.totalPages - 10);
        this.toggleButton(this.elements.btnLast, this.currentPage === this.totalPages);
    }

    private toggleButton(btn: HTMLButtonElement, isDisabled: boolean): void {
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
