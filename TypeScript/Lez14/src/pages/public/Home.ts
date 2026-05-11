import { PostService } from '../../services/PostService';
import { UserService } from '../../services/UserService';
import type { Post } from '../../models/Post';
import type { User } from '../../models/User';
import { store } from '../../services/Store';
import { renderPagination } from '../../components/Pagination';

export async function renderHome(container: HTMLElement) {
  const users = await UserService.getAllUsers();
  const allPosts = await PostService.getAllPosts();

  let filteredPosts = [...allPosts];
  let currentSearch = '';
  let currentUserId: number | null = null;

  const render = () => {
    container.innerHTML = `
      <section class="home-page">
        <header class="page-header">
          <h1>Post Recenti</h1>
          <div class="filters">
            <div class="input-group">
              <span class="material-icons">search</span>
              <input type="text" id="search-input" placeholder="Cerca per titolo o contenuto..." value="${currentSearch}">
            </div>
            <div class="input-group">
              <span class="material-icons">person</span>
              <select id="user-filter">
                <option value="">Tutti gli autori</option>
                ${users.map(u => `<option value="${u.id}" ${currentUserId === u.id ? 'selected' : ''}>${u.name}</option>`).join('')}
              </select>
            </div>
          </div>
        </header>
        <div id="posts-grid" class="posts-grid"></div>
        <div id="pagination-container"></div>
      </section>
    `;

    updateGrid();

    const searchInput = container.querySelector('#search-input') as HTMLInputElement;
    const userFilter = container.querySelector('#user-filter') as HTMLSelectElement;

    searchInput.addEventListener('input', (e) => {
      currentSearch = (e.target as HTMLInputElement).value;
      store.publicPagination.currentPage = 1; // Reset to page 1 on filter
      applyFilters();
    });

    userFilter.addEventListener('change', (e) => {
      currentUserId = (e.target as HTMLSelectElement).value ? Number((e.target as HTMLSelectElement).value) : null;
      store.publicPagination.currentPage = 1;
      applyFilters();
    });
  };

  const applyFilters = () => {
    filteredPosts = allPosts.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
                          p.body.toLowerCase().includes(currentSearch.toLowerCase());
      const matchUser = currentUserId === null || p.userId === currentUserId;
      return matchSearch && matchUser;
    });
    updateGrid();
  };

  const updateGrid = () => {
    const postsGrid = container.querySelector('#posts-grid') as HTMLElement;
    const paginationArea = container.querySelector('#pagination-container') as HTMLElement;
    
    if (!postsGrid || !paginationArea) return;

    // Calculate pagination slice
    const { pageSize, currentPage } = store.publicPagination;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + pageSize);

    postsGrid.innerHTML = renderPostList(paginatedPosts, users);

    // Render Pagination
    paginationArea.innerHTML = '';
    paginationArea.appendChild(renderPagination({
      totalItems: filteredPosts.length,
      pageSize,
      currentPage,
      onPageChange: (page) => {
        store.publicPagination.currentPage = page;
        updateGrid();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onPageSizeChange: (size) => {
        store.publicPagination.pageSize = size;
        store.publicPagination.currentPage = 1;
        updateGrid();
      }
    }));
  };

  render();
}

function renderPostList(posts: Post[], users: User[]): string {
  if (posts.length === 0) {
    return '<p class="no-results">Nessun post trovato.</p>';
  }

  return posts.map(post => {
    const author = users.find(u => u.id === post.userId);
    return `
      <article class="post-card">
        <div class="post-content">
          <h2 class="post-title">${post.title}</h2>
          <p class="post-author">di <span>${author?.name || 'Autore sconosciuto'}</span></p>
          <p class="post-excerpt">${post.body.substring(0, 100)}...</p>
        </div>
        <div class="post-actions">
          <a href="#/post/${post.id}" class="btn-text">Leggi di più</a>
        </div>
      </article>
    `;
  }).join('');
}
