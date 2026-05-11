import { PostService } from '../../services/PostService';
import { UserService } from '../../services/UserService';
import { CommentService } from '../../services/CommentService';
import type { Post } from '../../models/Post';
import type { User } from '../../models/User';
import type { Comment } from '../../models/Comment';
import { Modal } from '../../components/Modal';
import { store } from '../../services/Store';
import { renderPagination } from '../../components/Pagination';

type AdminTab = 'posts' | 'users' | 'comments' | 'trash';

export async function renderAdminDashboard(container: HTMLElement) {
  let activeTab: AdminTab = 'posts';
  
  const filters = {
    posts: { search: '', userId: '' },
    users: { search: '' },
    comments: { search: '' }
  };

  const render = () => {
    container.innerHTML = `
      <section class="admin-dashboard">
        <header class="page-header">
          <h1>Pannello Amministrazione</h1>
        </header>
        
        <div class="admin-layout">
          <aside class="admin-sidebar">
            <button class="nav-item ${activeTab === 'posts' ? 'active' : ''}" data-tab="posts">
              <span class="material-icons">article</span> Gestione Post
            </button>
            <button class="nav-item ${activeTab === 'users' ? 'active' : ''}" data-tab="users">
              <span class="material-icons">people</span> Gestione Utenti
            </button>
            <button class="nav-item ${activeTab === 'comments' ? 'active' : ''}" data-tab="comments">
              <span class="material-icons">comment</span> Gestione Commenti
            </button>
            <button class="nav-item ${activeTab === 'trash' ? 'active' : ''}" data-tab="trash">
              <span class="material-icons">delete_outline</span> Cestino
            </button>
          </aside>
          
          <main id="admin-content" class="admin-main">
            <!-- Dynamic content here -->
          </main>
        </div>
      </section>
    `;

    container.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = (e.currentTarget as HTMLElement).dataset.tab as AdminTab;
        if (activeTab === tab) return;
        activeTab = tab;
        render(); // Re-render shell
        updateTabContent(true);
      });
    });

    updateTabContent(true);
  };

  const updateTabContent = async (fullRender = false) => {
    const contentArea = container.querySelector('#admin-content') as HTMLElement;
    if (!contentArea) return;

    if (activeTab === 'posts') {
      let posts = await PostService.getAllPosts();
      const users = await UserService.getAllUsers();
      if (filters.posts.search) {
        const query = filters.posts.search.toLowerCase();
        posts = posts.filter(p => p.title.toLowerCase().includes(query) || p.body.toLowerCase().includes(query));
      }
      if (filters.posts.userId) {
        posts = posts.filter(p => p.userId === Number(filters.posts.userId));
      }
      renderPostsManager(contentArea, posts, users, fullRender);
    } else if (activeTab === 'users') {
      let users = await UserService.getAllUsers();
      if (filters.users.search) {
        const query = filters.users.search.toLowerCase();
        users = users.filter(u => u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query));
      }
      renderUsersManager(contentArea, users, fullRender);
    } else if (activeTab === 'comments') {
      let comments = await CommentService.getAllComments();
      const posts = await PostService.getAllPosts();
      const users = await UserService.getAllUsers();
      if (filters.comments.search) {
        const query = filters.comments.search.toLowerCase();
        comments = comments.filter(c => c.email.toLowerCase().includes(query) || c.body.toLowerCase().includes(query));
      }
      renderCommentsManager(contentArea, comments, posts, users, fullRender);
    } else if (activeTab === 'trash') {
      renderTrashManager(contentArea);
    }
  };

  const renderPostsManager = (area: HTMLElement, posts: Post[], users: User[], fullRender: boolean) => {
    if (fullRender) {
      area.innerHTML = `
        <div class="manager-header">
          <h2 id="manager-title">Gestione Post</h2>
          <button class="btn-primary" id="add-post-btn"><span class="material-icons">add</span> Nuovo Post</button>
        </div>
        <div class="admin-filters">
          <div class="filter-group">
            <span class="material-icons">search</span>
            <input type="text" id="post-search" placeholder="Cerca per titolo o corpo..." value="${filters.posts.search}">
          </div>
          <div class="filter-group">
            <span class="material-icons">filter_list</span>
            <select id="post-author-filter">
              <option value="">Tutti gli autori</option>
              ${users.map(u => `<option value="${u.id}" ${filters.posts.userId === String(u.id) ? 'selected' : ''}>${u.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div id="table-container"></div>
        <div id="pagination-container"></div>
      `;
      
      area.querySelector('#post-search')?.addEventListener('input', (e) => {
        filters.posts.search = (e.target as HTMLInputElement).value;
        store.adminPagination.posts.currentPage = 1;
        updateTabContent(false);
      });
      area.querySelector('#post-author-filter')?.addEventListener('change', (e) => {
        filters.posts.userId = (e.target as HTMLSelectElement).value;
        store.adminPagination.posts.currentPage = 1;
        updateTabContent(false);
      });
      area.querySelector('#add-post-btn')?.addEventListener('click', () => {
        showPostModal(null, users, (data) => {
          PostService.addPost(data);
          updateTabContent(true);
        });
      });
    }

    const { pageSize, currentPage } = store.adminPagination.posts;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedPosts = posts.slice(startIndex, startIndex + pageSize);

    const title = area.querySelector('#manager-title');
    if (title) title.textContent = `Gestione Post (${posts.length})`;

    const tableContainer = area.querySelector('#table-container');
    if (tableContainer) {
      tableContainer.innerHTML = `
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr><th>ID</th><th>Titolo</th><th>Autore</th><th>Azioni</th></tr>
            </thead>
            <tbody>
              ${paginatedPosts.map(p => {
                const author = users.find(u => u.id === p.userId);
                return `
                  <tr>
                    <td>${p.id}</td>
                    <td class="text-truncate">${p.title}</td>
                    <td>${author?.name || 'Unknown'}</td>
                    <td class="actions">
                      <button class="icon-button edit-btn" data-id="${p.id}"><span class="material-icons">edit</span></button>
                      <button class="icon-button delete-btn" data-id="${p.id}"><span class="material-icons">delete</span></button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      tableContainer.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = Number((e.currentTarget as HTMLElement).dataset.id);
          if (confirm(`Spostare il post ${id} nel cestino?`)) {
            PostService.deletePost(id);
            updateTabContent(true);
          }
        });
      });

      tableContainer.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = Number((e.currentTarget as HTMLElement).dataset.id);
          const post = PostService.getPostById(id);
          if (post) {
            showPostModal(post, users, (data) => {
              PostService.updatePost(id, data);
              updateTabContent(true);
            });
          }
        });
      });
    }

    const paginationContainer = area.querySelector('#pagination-container');
    if (paginationContainer) {
      paginationContainer.innerHTML = '';
      paginationContainer.appendChild(renderPagination({
        totalItems: posts.length,
        pageSize,
        currentPage,
        onPageChange: (page) => {
          store.adminPagination.posts.currentPage = page;
          updateTabContent(false);
        },
        onPageSizeChange: (size) => {
          store.adminPagination.posts.pageSize = size;
          store.adminPagination.posts.currentPage = 1;
          updateTabContent(false);
        }
      }));
    }
  };

  const renderUsersManager = (area: HTMLElement, users: User[], fullRender: boolean) => {
    if (fullRender) {
      area.innerHTML = `
        <div class="manager-header">
          <h2 id="manager-title">Gestione Utenti</h2>
          <button class="btn-primary" id="add-user-btn"><span class="material-icons">person_add</span> Nuovo Utente</button>
        </div>
        <div class="admin-filters">
          <div class="filter-group">
            <span class="material-icons">search</span>
            <input type="text" id="user-search" placeholder="Cerca per nome o username..." value="${filters.users.search}">
          </div>
        </div>
        <div id="table-container"></div>
        <div id="pagination-container"></div>
      `;
      
      area.querySelector('#user-search')?.addEventListener('input', (e) => {
        filters.users.search = (e.target as HTMLInputElement).value;
        store.adminPagination.users.currentPage = 1;
        updateTabContent(false);
      });
      area.querySelector('#add-user-btn')?.addEventListener('click', () => {
        showUserModal(null, (data) => {
          UserService.addUser(data);
          updateTabContent(true);
        });
      });
    }

    const { pageSize, currentPage } = store.adminPagination.users;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedUsers = users.slice(startIndex, startIndex + pageSize);

    const title = area.querySelector('#manager-title');
    if (title) title.textContent = `Gestione Utenti (${users.length})`;

    const tableContainer = area.querySelector('#table-container');
    if (tableContainer) {
      tableContainer.innerHTML = `
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr><th>ID</th><th>Nome</th><th>Email</th><th>Azioni</th></tr>
            </thead>
            <tbody>
              ${paginatedUsers.map(u => `
                <tr>
                  <td>${u.id}</td>
                  <td>${u.name}</td>
                  <td>${u.email}</td>
                  <td class="actions">
                    <button class="icon-button edit-btn" data-id="${u.id}"><span class="material-icons">edit</span></button>
                    <button class="icon-button delete-btn" data-id="${u.id}"><span class="material-icons">delete</span></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      tableContainer.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = Number((e.currentTarget as HTMLElement).dataset.id);
          const user = UserService.getUserById(id);
          if (user) {
            showUserModal(user, (data) => {
              UserService.updateUser(id, data);
              updateTabContent(true);
            });
          }
        });
      });

      tableContainer.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = Number((e.currentTarget as HTMLElement).dataset.id);
          if (confirm(`Spostare l'utente ${id} nel cestino?`)) {
            UserService.deleteUser(id);
            updateTabContent(true);
          }
        });
      });
    }

    const paginationContainer = area.querySelector('#pagination-container');
    if (paginationContainer) {
      paginationContainer.innerHTML = '';
      paginationContainer.appendChild(renderPagination({
        totalItems: users.length,
        pageSize,
        currentPage,
        onPageChange: (page) => {
          store.adminPagination.users.currentPage = page;
          updateTabContent(false);
        },
        onPageSizeChange: (size) => {
          store.adminPagination.users.pageSize = size;
          store.adminPagination.users.currentPage = 1;
          updateTabContent(false);
        }
      }));
    }
  };

  const renderCommentsManager = (area: HTMLElement, comments: Comment[], posts: Post[], users: User[], fullRender: boolean) => {
    if (fullRender) {
      area.innerHTML = `
        <div class="manager-header">
          <h2 id="manager-title">Gestione Commenti</h2>
          <button class="btn-primary" id="add-comment-btn"><span class="material-icons">add_comment</span> Nuovo Commento</button>
        </div>
        <div class="admin-filters">
          <div class="filter-group">
            <span class="material-icons">search</span>
            <input type="text" id="comment-search" placeholder="Cerca per email o testo..." value="${filters.comments.search}">
          </div>
        </div>
        <div id="table-container"></div>
        <div id="pagination-container"></div>
      `;
      
      area.querySelector('#comment-search')?.addEventListener('input', (e) => {
        filters.comments.search = (e.target as HTMLInputElement).value;
        store.adminPagination.comments.currentPage = 1;
        updateTabContent(false);
      });
      area.querySelector('#add-comment-btn')?.addEventListener('click', () => {
        showCommentModal(null, users, posts, (data) => {
          CommentService.addComment(data);
          updateTabContent(true);
        });
      });
    }

    const { pageSize, currentPage } = store.adminPagination.comments;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedComments = comments.slice(startIndex, startIndex + pageSize);

    const title = area.querySelector('#manager-title');
    if (title) title.textContent = `Gestione Commenti (${comments.length})`;

    const tableContainer = area.querySelector('#table-container');
    if (tableContainer) {
      tableContainer.innerHTML = `
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr><th>Post ID</th><th>ID</th><th>Nome</th><th>Autore Post</th><th>Email</th><th>Azioni</th></tr>
            </thead>
            <tbody>
              ${paginatedComments.map(c => {
                const post = posts.find(p => p.id === c.postId);
                const postAuthor = users.find(u => u.id === post?.userId);
                return `
                  <tr>
                    <td>${c.postId}</td>
                    <td>${c.id}</td>
                    <td class="text-truncate" title="${c.name}">${c.name}</td>
                    <td>${postAuthor?.name || 'Unknown'}</td>
                    <td>${c.email}</td>
                    <td class="actions">
                      <button class="icon-button edit-btn" data-id="${c.id}"><span class="material-icons">edit</span></button>
                      <button class="icon-button delete-btn" data-id="${c.id}"><span class="material-icons">delete</span></button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      tableContainer.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = Number((e.currentTarget as HTMLElement).dataset.id);
          const comment = comments.find(c => c.id === id);
          if (comment) {
            showCommentModal(comment, users, posts, (data) => {
              CommentService.updateComment(id, data);
              updateTabContent(true);
            });
          }
        });
      });

      tableContainer.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = Number((e.currentTarget as HTMLElement).dataset.id);
          if (confirm(`Spostare il commento ${id} nel cestino?`)) {
            CommentService.deleteComment(id);
            updateTabContent(true);
          }
        });
      });
    }

    const paginationContainer = area.querySelector('#pagination-container');
    if (paginationContainer) {
      paginationContainer.innerHTML = '';
      paginationContainer.appendChild(renderPagination({
        totalItems: comments.length,
        pageSize,
        currentPage,
        onPageChange: (page) => {
          store.adminPagination.comments.currentPage = page;
          updateTabContent(false);
        },
        onPageSizeChange: (size) => {
          store.adminPagination.comments.pageSize = size;
          store.adminPagination.comments.currentPage = 1;
          updateTabContent(false);
        }
      }));
    }
  };

  const renderTrashManager = (area: HTMLElement) => {
    const deletedPosts = PostService.getDeletedPosts();
    const deletedUsers = UserService.getDeletedUsers();
    const deletedComments = CommentService.getDeletedComments();
    const totalDeleted = deletedPosts.length + deletedUsers.length + deletedComments.length;

    // For trash, we combine items or just paginate sections?
    // Let's paginate the whole trash view or just keep it simple.
    // The user said "per la dashboard admin il valore deve essere relativo alla tab selezionata".
    // So "trash" is one tab.
    
    const allDeleted = [
      ...deletedPosts.map(p => ({ ...p, type: 'post' })),
      ...deletedUsers.map(u => ({ ...u, type: 'user' })),
      ...deletedComments.map(c => ({ ...c, type: 'comment' }))
    ];

    const { pageSize, currentPage } = store.adminPagination.trash;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedDeleted = allDeleted.slice(startIndex, startIndex + pageSize);

    area.innerHTML = `
      <div class="manager-header">
        <h2>Cestino (${totalDeleted})</h2>
      </div>
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr><th>Tipo</th><th>ID</th><th>Nome/Titolo</th><th>Azioni</th></tr>
          </thead>
          <tbody>
            ${paginatedDeleted.map((item: any) => `
              <tr>
                <td><span class="badge-type">${item.type}</span></td>
                <td>${item.id}</td>
                <td>${item.title || item.name || item.email || 'N/A'}</td>
                <td class="actions">
                  <button class="icon-button restore-btn" data-id="${item.id}" data-type="${item.type}" title="Ripristina"><span class="material-icons">restore</span></button>
                  <button class="icon-button permanent-delete-btn" data-id="${item.id}" data-type="${item.type}" title="Elimina definitivamente"><span class="material-icons">delete_forever</span></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div id="pagination-container"></div>
    `;

    const paginationContainer = area.querySelector('#pagination-container');
    if (paginationContainer) {
      paginationContainer.innerHTML = '';
      paginationContainer.appendChild(renderPagination({
        totalItems: totalDeleted,
        pageSize,
        currentPage,
        onPageChange: (page) => {
          store.adminPagination.trash.currentPage = page;
          updateTabContent(true);
        },
        onPageSizeChange: (size) => {
          store.adminPagination.trash.pageSize = size;
          store.adminPagination.trash.currentPage = 1;
          updateTabContent(true);
        }
      }));
    }

    area.querySelectorAll('.restore-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const id = Number(target.dataset.id);
        const type = target.dataset.type;
        if (type === 'post') PostService.restorePost(id);
        if (type === 'user') UserService.restoreUser(id);
        if (type === 'comment') CommentService.restoreComment(id);
        updateTabContent(true);
      });
    });

    area.querySelectorAll('.permanent-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const id = Number(target.dataset.id);
        const type = target.dataset.type;
        if (confirm('Sei sicuro? Questa operazione è irreversibile.')) {
          if (type === 'post') PostService.permanentlyDeletePost(id);
          if (type === 'user') UserService.permanentlyDeleteUser(id);
          if (type === 'comment') CommentService.permanentlyDeleteComment(id);
          updateTabContent(true);
        }
      });
    });
  };

  render();
}

// Helper table render moved into managers to handle pagination correctly

// --- Modals ---

function showPostModal(post: Post | null, users: User[], onSave: (data: any) => void) {
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="form-group">
      <label>Titolo</label>
      <input type="text" name="title" value="${post?.title || ''}" required>
    </div>
    <div class="form-group">
      <label>Contenuto</label>
      <textarea name="body" rows="4" required>${post?.body || ''}</textarea>
    </div>
    <div class="form-group">
      <label>Autore</label>
      <select name="userId" id="post-author-select" required>
        ${users.map(u => `
          <option value="${u.id}">
            ${u.name}
          </option>
        `).join('')}
      </select>
    </div>
  `;

  const authorSelect = content.querySelector('#post-author-select') as HTMLSelectElement;
  if (post && authorSelect) {
    authorSelect.value = String(post.userId);
  }

  const modal = new Modal({
    title: post ? 'Modifica Post' : 'Nuovo Post',
    content: content,
    onConfirm: (data) => onSave(data)
  });
  modal.open();
}

function showUserModal(user: User | null, onSave: (data: any) => void) {
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="form-group">
      <label>Nome Completo</label>
      <input type="text" name="name" value="${user?.name || ''}" required>
    </div>
    <div class="form-group">
      <label>Username</label>
      <input type="text" name="username" value="${user?.username || ''}" required>
    </div>
    <div class="form-group">
      <label>Email</label>
      <input type="email" name="email" value="${user?.email || ''}" required>
    </div>
  `;

  const modal = new Modal({
    title: user ? 'Modifica Utente' : 'Nuovo Utente',
    content: content,
    onConfirm: (data) => onSave(data)
  });
  modal.open();
}

function showCommentModal(comment: Comment | null, users: User[], posts: Post[], onSave: (data: any) => void) {
  const content = document.createElement('div');
  content.innerHTML = `
    <div class="form-group">
      <label>Post di riferimento</label>
      <select name="postId" required>
        ${posts.map(p => `
          <option value="${p.id}" ${p.id === comment?.postId ? 'selected' : ''}>
            [ID ${p.id}] ${p.title.substring(0, 30)}...
          </option>
        `).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Autore (User)</label>
      <select id="user-selector" required>
        <option value="">Seleziona un utente per riempire i campi...</option>
        ${users.map(u => `
          <option value="${u.id}" data-name="${u.name}" data-email="${u.email}">
            ${u.name}
          </option>
        `).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Nome Visualizzato</label>
      <input type="text" name="name" id="comment-name" value="${comment?.name || ''}" required>
    </div>
    <div class="form-group">
      <label>Email</label>
      <input type="email" name="email" id="comment-email" value="${comment?.email || ''}" required>
    </div>
    <div class="form-group">
      <label>Commento</label>
      <textarea name="body" rows="3" required>${comment?.body || ''}</textarea>
    </div>
  `;

  const userSelector = content.querySelector('#user-selector') as HTMLSelectElement;
  
  if (comment) {
    const post = posts.find(p => p.id === comment.postId);
    if (post) {
      userSelector.value = String(post.userId);
    }
  }

  userSelector.addEventListener('change', () => {
    const selectedOption = userSelector.options[userSelector.selectedIndex];
    if (selectedOption.value) {
      (content.querySelector('#comment-name') as HTMLInputElement).value = selectedOption.dataset.name || '';
      (content.querySelector('#comment-email') as HTMLInputElement).value = selectedOption.dataset.email || '';
    }
  });

  const modal = new Modal({
    title: comment ? 'Modifica Commento' : 'Nuovo Commento',
    content: content,
    onConfirm: (data) => onSave(data)
  });
  modal.open();
}
