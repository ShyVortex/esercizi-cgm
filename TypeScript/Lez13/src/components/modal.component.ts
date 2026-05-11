export class ModalComponent {
    constructor(
        private container: HTMLElement,
        private form?: HTMLFormElement
    ) {}

    public open(title?: string, titleElement?: HTMLElement): void {
        if (title && titleElement) {
            titleElement.innerText = title;
        }
        this.container.classList.remove('hidden');
    }

    public close(): void {
        this.container.classList.add('hidden');
        if (this.form) {
            this.form.reset();
        }
    }

    public setFields(html: string, fieldsContainer: HTMLElement): void {
        fieldsContainer.innerHTML = html;
    }

    public isVisible(): boolean {
        return !this.container.classList.contains('hidden');
    }
}
