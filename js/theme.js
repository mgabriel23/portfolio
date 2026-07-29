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

/**
 * Positions the circular reveal at the toggle button and sizes it to reach
 * the viewport's farthest corner, so the incoming theme fully covers the
 * screen by the time the animation ends.
 */
function setRevealOrigin(toggle) {
    const rect = toggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const root = document.documentElement.style;
    root.setProperty('--theme-reveal-x', `${x}px`);
    root.setProperty('--theme-reveal-y', `${y}px`);
    root.setProperty('--theme-reveal-radius', `${radius}px`);
}

export function initTheme() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;

    updateToggleLabel(toggle);

    const allowsMotion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

    toggle.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';

        const applyAndPersist = () => {
            applyTheme(next);
            storeTheme(next);
            updateToggleLabel(toggle);
        };

        // Circular reveal only when the browser supports it and the visitor
        // hasn't opted out of motion; otherwise the theme still switches, just
        // as an instant swap (progressive enhancement, not a requirement).
        if (allowsMotion && document.startViewTransition) {
            setRevealOrigin(toggle);
            document.startViewTransition(applyAndPersist);
        } else {
            applyAndPersist();
        }
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
