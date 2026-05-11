export class ThemeManager {
  private static THEME_KEY = 'app-theme';

  static init() {
    const savedTheme = localStorage.getItem(this.THEME_KEY) || 'light';
    this.setTheme(savedTheme as 'light' | 'dark');
  }

  static setTheme(theme: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  static toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  static isDark(): boolean {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }
}
