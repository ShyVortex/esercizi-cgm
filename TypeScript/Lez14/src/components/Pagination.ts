export interface PaginationOptions {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function renderPagination(options: PaginationOptions): HTMLElement {
  const totalPages = Math.ceil(options.totalItems / options.pageSize);
  const container = document.createElement('div');
  container.className = 'pagination-container';

  const pageSizes = [5, 10, 15, 20, 25];

  container.innerHTML = `
    <div class="pagination-info">
      Mostrati <strong>${Math.min(options.totalItems, (options.currentPage - 1) * options.pageSize + 1)}</strong> - 
      <strong>${Math.min(options.totalItems, options.currentPage * options.pageSize)}</strong> di <strong>${options.totalItems}</strong>
    </div>
    
    <div class="pagination-controls">
      <div class="page-size-selector">
        <label>Righe per pagina:</label>
        <select id="page-size-select">
          ${pageSizes.map(size => `<option value="${size}" ${size === options.pageSize ? 'selected' : ''}>${size}</option>`).join('')}
        </select>
      </div>

      <div class="page-nav">
        <button class="icon-button" id="prev-page" ${options.currentPage === 1 ? 'disabled' : ''}>
          <span class="material-icons">chevron_left</span>
        </button>
        <span class="page-indicator">Pagina ${options.currentPage} di ${totalPages || 1}</span>
        <button class="icon-button" id="next-page" ${options.currentPage >= totalPages ? 'disabled' : ''}>
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
    </div>
  `;

  container.querySelector('#page-size-select')?.addEventListener('change', (e) => {
    options.onPageSizeChange(Number((e.target as HTMLSelectElement).value));
  });

  container.querySelector('#prev-page')?.addEventListener('click', () => {
    if (options.currentPage > 1) options.onPageChange(options.currentPage - 1);
  });

  container.querySelector('#next-page')?.addEventListener('click', () => {
    if (options.currentPage < totalPages) options.onPageChange(options.currentPage + 1);
  });

  return container;
}
