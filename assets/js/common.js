const THEME_KEY = 'sth-theme';

function trackEvent(name, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

window.trackEvent = trackEvent;

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.toggle('dark-theme', theme === 'dark');
  document.body.classList.toggle('dark-theme', theme === 'dark');
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    // ignore storage errors
  }
}

function getPreferredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
  } catch (err) {
    // ignore
  }
  return 'light';
}

function initThemeToggle(startTheme) {
  const buttons = Array.from(document.querySelectorAll('.theme-toggle'));
  if (!buttons.length) return;
  const setLabel = (theme) => {
    const label = theme === 'dark' ? 'Use light theme' : 'Use dark theme';
    const aria = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    buttons.forEach(button => {
      const labelEl = button.querySelector('.theme-label');
      if (labelEl) {
        labelEl.textContent = label;
      } else {
        button.textContent = label;
      }
      button.setAttribute('aria-label', aria);
    });
  };
  setLabel(startTheme);
  const handleClick = () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setLabel(next);
    trackEvent('theme_toggle', { theme: next });
  };
  buttons.forEach(button => button.addEventListener('click', handleClick));
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const stored = (() => {
        try { return localStorage.getItem(THEME_KEY); } catch (err) { return null; }
      })();
      if (!stored) {
        applyTheme(e.matches ? 'dark' : 'light');
        setLabel(e.matches ? 'dark' : 'light');
      }
    });
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // ignore registration errors
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }

  const yearEl = document.querySelector('.year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  initThemeToggle(initialTheme);
  registerServiceWorker();
});
