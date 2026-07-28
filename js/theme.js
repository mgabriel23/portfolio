// js/theme.js
// Theme state: reads the value set by the pre-paint bootstrap in index.html,
// wires the toggle, persists explicit choices, and follows the OS preference
// until the visitor makes one.

const STORAGE_KEY = 'theme';
const THEMES = new Set(['light', 'dark']);

/**
 * localStorage can throw (private browsing, storage disabled), so reads and
 * writes are wrapped rather than assumed.
 */
function readStoredTheme() {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return THEMES.has(value) ? value : null;
    } catch {
        return null;
    }
}

function storeTheme(value) {
    try {
        localStorage.setItem(STORAGE_KEY, value);
    } catch {
        // Persistence is an enhancement; the in-page toggle still works without it.
    }
}

function applyTheme(value) {
    document.documentElement.dataset.theme = value;
}

function currentTheme() {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function updateToggleLabel(toggle) {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    toggle.setAttribute('aria-label', `Switch to ${next} theme`);
}

export function initTheme() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;

    updateToggleLabel(toggle);

    toggle.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        storeTheme(next);
        updateToggleLabel(toggle);
    });

    // Follow live OS changes only while the visitor has no explicit preference,
    // so a deliberate choice is never silently overridden.
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', (event) => {
        if (readStoredTheme() !== null) return;
        applyTheme(event.matches ? 'dark' : 'light');
        updateToggleLabel(toggle);
    });
}
