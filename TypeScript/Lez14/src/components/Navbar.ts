import { ThemeManager } from '../core/ThemeManager';

export function renderNavbar() {
  const navbar = document.createElement('nav');
  navbar.className = 'main-navbar';
  
  navbar.innerHTML = `
    <div class="nav-container">
      <div class="nav-logo">
        <a href="#/">PostManager</a>
      </div>
      <ul class="nav-links">
        <li><a href="#/">Home</a></li>
        <li><a href="#/admin">Admin</a></li>
      </ul>
      <div class="nav-actions">
        <button id="theme-toggle" class="icon-button" title="Cambia tema">
          <span class="material-icons">${ThemeManager.isDark() ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </div>
    </div>
  `;

  const themeToggle = navbar.querySelector('#theme-toggle');
  themeToggle?.addEventListener('click', () => {
    ThemeManager.toggleTheme();
    const icon = themeToggle.querySelector('.material-icons');
    if (icon) {
      icon.textContent = ThemeManager.isDark() ? 'light_mode' : 'dark_mode';
    }
  });

  return navbar;
}
