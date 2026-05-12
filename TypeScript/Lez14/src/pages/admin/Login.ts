import { store } from '../../services/Store';

export function renderLogin(container: HTMLElement) {
  container.innerHTML = `
    <div class="login-page">
      <div class="login-card">
        <header class="login-header">
          <span class="material-icons login-icon">lock</span>
          <h1>Accedi all'Area Admin</h1>
          <p>Inserisci le tue credenziali per continuare</p>
        </header>
        
        <form id="login-form" class="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <div class="input-with-icon">
              <span class="material-icons">person</span>
              <input type="text" id="username" name="username" placeholder="Inserisci username" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-with-icon">
              <span class="material-icons">vpn_key</span>
              <input type="password" id="password" name="password" placeholder="Inserisci password" required>
            </div>
          </div>
          
          <div id="login-error" class="error-message" style="display: none;">
            Credenziali non valide. Riprova.
          </div>
          
          <button type="submit" class="btn-primary btn-block">
            Accedi
          </button>
        </form>
      </div>
    </div>
  `;

  const loginForm = container.querySelector('#login-form') as HTMLFormElement;
  const errorMsg = container.querySelector('#login-error') as HTMLElement;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (username === 'admin' && password === 'admin') {
      store.setAuthenticated(true);
      window.location.hash = '/admin';
    } else {
      errorMsg.style.display = 'block';
      (container.querySelector('#password') as HTMLInputElement).value = '';
    }
  });
}
