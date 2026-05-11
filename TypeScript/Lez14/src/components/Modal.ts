export interface ModalOptions {
  title: string;
  content: string | HTMLElement;
  onConfirm?: (data: any) => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export class Modal {
  private overlay: HTMLElement;
  private modal: HTMLElement;

  constructor(options: ModalOptions) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    
    this.modal = document.createElement('div');
    this.modal.className = 'modal-container';
    
    const contentHtml = typeof options.content === 'string' ? options.content : '';
    
    this.modal.innerHTML = `
      <div class="modal-header">
        <h3>${options.title}</h3>
        <button class="modal-close"><span class="material-icons">close</span></button>
      </div>
      <div class="modal-body">
        ${contentHtml}
      </div>
      <div class="modal-footer">
        <button class="btn-secondary modal-cancel">${options.cancelText || 'Annulla'}</button>
        <button class="btn-primary modal-confirm">${options.confirmText || 'Conferma'}</button>
      </div>
    `;

    if (typeof options.content !== 'string') {
      this.modal.querySelector('.modal-body')?.appendChild(options.content);
    }

    this.overlay.appendChild(this.modal);
    
    // Events
    this.modal.querySelector('.modal-close')?.addEventListener('click', () => this.close());
    this.modal.querySelector('.modal-cancel')?.addEventListener('click', () => {
      options.onCancel?.();
      this.close();
    });
    
    this.modal.querySelector('.modal-confirm')?.addEventListener('click', () => {
      const formData = this.getFormData();
      options.onConfirm?.(formData);
      this.close();
    });

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }

  private getFormData(): any {
    const inputs = this.modal.querySelectorAll('input, select, textarea');
    const data: any = {};
    inputs.forEach((input: any) => {
      if (input.name) {
        const val = input.value;
        // Convert to number if it's a numeric string and doesn't look like a phone number or similar
        // Or if the input type is specifically number
        if (input.type === 'number' || (!isNaN(val) && val !== '' && !val.includes(' '))) {
          data[input.name] = Number(val);
        } else {
          data[input.name] = val;
        }
      }
    });
    return data;
  }

  public open() {
    document.body.appendChild(this.overlay);
    document.body.style.overflow = 'hidden';
  }

  public close() {
    this.overlay.remove();
    document.body.style.overflow = '';
  }
}
