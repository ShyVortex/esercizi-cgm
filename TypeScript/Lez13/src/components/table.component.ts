export interface TableActions {
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onPhysicalDelete?: (id: string) => void;
    onRestore?: (id: string) => void;
}

export class TableComponent {
    constructor(
        private headElement: HTMLElement,
        private bodyElement: HTMLElement,
        private stateElement: HTMLElement,
        private actions: TableActions
    ) {
        this.setupListeners();
    }

    private setupListeners(): void {
        this.bodyElement.onclick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const id = target.dataset.id;
            const action = target.dataset.action;

            if (!id || !action) return;

            switch (action) {
                case 'edit': this.actions.onEdit?.(id); break;
                case 'delete': this.actions.onDelete?.(id); break;
                case 'physicalDelete': this.actions.onPhysicalDelete?.(id); break;
                case 'restore': this.actions.onRestore?.(id); break;
            }
        };
    }

    public render(data: any[], isBin: boolean): void {
        this.bodyElement.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            this.stateElement.innerHTML = "Nessun risultato trovato.";
            this.stateElement.classList.remove('hidden');
            this.headElement.innerHTML = '';
            return;
        }

        this.stateElement.classList.add('hidden');

        const formattedData = this.formatData(data);
        const keys = Object.keys(formattedData[0]).filter(k => k !== 'isActive');

        this.headElement.innerHTML = keys.map(k => `
            <th class="p-4 border-b uppercase text-xs text-gray-400 font-bold">${k}</th>
        `).join('') + '<th class="p-4 border-b text-right">Azioni</th>';

        this.bodyElement.innerHTML = formattedData.map(item => `
            <tr class="hover:bg-gray-50 border-b last:border-0">
                ${keys.map(k => `<td class="p-4 text-sm text-gray-600">${item[k]}</td>`).join('')}
                <td class="p-4 text-right space-x-2">
                    ${isBin
                        ? `<button data-id="${item.id}" data-action="physicalDelete" class="text-red-500 font-bold">Cancella</button>
                           <button data-id="${item.id}" data-action="restore" class="text-blue-500 font-bold">Ripristina</button>`
                        : `<button data-id="${item.id}" data-action="edit" class="text-yellow-600">Modifica</button>
                           <button data-id="${item.id}" data-action="delete" class="text-red-500">Elimina</button>`
                    }
                </td>
            </tr>
        `).join('');
    }

    public showLoading(): void {
        this.bodyElement.innerHTML = '<tr><td colspan="10" class="p-10 text-center"><div class="loader inline-block rounded-full border-4 border-t-4 h-8 w-8"></div></td></tr>';
    }

    public showError(message: string): void {
        this.bodyElement.innerHTML = '';
        this.stateElement.innerHTML = `
            <div class="text-red-500">
                <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="font-bold text-lg">${message}</p>
                <p class="text-sm mt-2 text-gray-500">Verifica la connessione al server.</p>
            </div>
        `;
        this.stateElement.classList.remove('hidden');
    }

    private formatData(data: any[]): any[] {
        return data.map(item => {
            const formatted = { ...item };
            
            // User formatting logic
            if (formatted.address && typeof formatted.address === 'object') {
                formatted.address = `${formatted.address.city}, ${formatted.address.street}`;
            }
            if (formatted.company && typeof formatted.company === 'object') {
                formatted.company = formatted.company.name;
            }
            
            return formatted;
        });
    }
}
