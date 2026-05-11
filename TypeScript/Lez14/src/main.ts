import './style.css'
import { Router } from './core/Router'
import { ThemeManager } from './core/ThemeManager'
import { renderNavbar } from './components/Navbar'
import { PostService } from './services/PostService'
import { UserService } from './services/UserService'

// Initialize core services
ThemeManager.init();

const appElement = document.querySelector<HTMLDivElement>('#app')!;

// Initial data fetch
async function initApp() {
  try {
    appElement.innerHTML = `
      <div class="loader-container">
        <div class="loader">Caricamento dati...</div>
      </div>
    `;
    
    // Fetch users and posts in parallel
    await Promise.all([
      UserService.getAllUsers(),
      PostService.getAllPosts()
    ]);

    // Setup Layout
    appElement.innerHTML = '';
    const navbar = renderNavbar();
    const content = document.createElement('main');
    content.id = 'content';
    content.className = 'content-container';
    
    appElement.appendChild(navbar);
    appElement.appendChild(content);

    // Setup Router
    const router = new Router('content');
    
    router.addRoute('/', () => {
      import('./pages/public/Home').then(m => m.renderHome(content));
    });
    
    router.addRoute('/post/:id', (params) => {
      import('./pages/public/PostDetail').then(m => m.renderPostDetail(content, Number(params.id)));
    });
    
    router.addRoute('/admin', () => {
      import('./pages/admin/AdminDashboard').then(m => m.renderAdminDashboard(content));
    });

    router.start();
    
  } catch (error) {
    console.error('Failed to initialize app:', error);
    appElement.innerHTML = `<div class="error-container">Errore nel caricamento dell'applicazione.</div>`;
  }
}

initApp();
