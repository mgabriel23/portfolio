// js/projectGallery.js
// Opens a project's screenshot gallery inline in the rail on desktop
// (dialog.show(), replacing the identity block in place) or as a true modal
// on small screens (dialog.showModal()) — same panel, same content, picked
// at open time by viewport width. Triggers stay plain working links, so a
// browser without <dialog> support, or a failed script load, just falls
// through to normal navigation instead of doing nothing.

const DESKTOP_QUERY = '(min-width: 60em)';
const MOTION_QUERY = '(prefers-reduced-motion: no-preference)';

export function initProjectGallery() {
    const identity = document.querySelector('[data-rail-identity]');
    const panel = document.querySelector('[data-rail-gallery]');
    const triggers = document.querySelectorAll('[data-open-gallery]');
    const projectsSection = document.getElementById('projects');

    if (!identity || !panel || triggers.length === 0) return;
    if (typeof panel.show !== 'function' || typeof panel.showModal !== 'function') return;

    const eyebrowEl = panel.querySelector('[data-gallery-eyebrow]');
    const titleEl = panel.querySelector('[data-gallery-title]');
    const visitEl = panel.querySelector('[data-gallery-visit]');
    const visitLabelEl = panel.querySelector('[data-gallery-visit-label]');
    const backBtn = panel.querySelector('[data-gallery-close]');

    let lastTrigger = null;
    // Set right before an implicit (scroll-triggered) close, so the 'close'
    // handler below knows not to yank focus back to a trigger the visitor
    // has already scrolled away from.
    let suppressRefocus = false;

    function isDesktop() {
        return window.matchMedia(DESKTOP_QUERY).matches;
    }

    function allowsMotion() {
        return window.matchMedia(MOTION_QUERY).matches;
    }

    function populate(trigger) {
        const title = trigger.textContent.trim();
        eyebrowEl.textContent = trigger.dataset.projectEyebrow || '';
        titleEl.textContent = title;
        visitEl.href = trigger.href;
        visitLabelEl.textContent = title;
    }

    // Desktop content changes — first open, or switching projects while
    // already open — cross-fade via View Transitions instead of swapping
    // instantly, the same progressive-enhancement pattern theme.js uses for
    // the theme swap. Mobile's modal open/close keeps its own CSS transition.
    function mutate(fn) {
        if (isDesktop() && allowsMotion() && document.startViewTransition) {
            document.startViewTransition(fn);
        } else {
            fn();
        }
    }

    function open(trigger) {
        lastTrigger = trigger;

        mutate(() => {
            populate(trigger);
            if (isDesktop()) {
                identity.hidden = true;
                panel.show();
            } else {
                panel.showModal();
            }
        });

        backBtn.focus({ preventScroll: true });
    }

    function close() {
        if (panel.open) mutate(() => panel.close());
    }

    // Used by the scroll-away observer below: closes without stealing focus
    // (and the scroll-into-view that focus() would otherwise trigger).
    function closeSilently() {
        suppressRefocus = true;
        close();
    }

    panel.addEventListener('close', () => {
        identity.hidden = false;
        if (!suppressRefocus && lastTrigger) lastTrigger.focus({ preventScroll: true });
        suppressRefocus = false;
    });

    // A click landing on the panel itself (rather than its padded content)
    // only happens in modal mode — it means the backdrop was hit.
    panel.addEventListener('click', (event) => {
        if (event.target === panel) close();
    });

    backBtn.addEventListener('click', close);

    // showModal() closes on Escape natively; this only covers the desktop
    // dialog.show() case, which doesn't get that behavior for free.
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && panel.open && !panel.matches(':modal')) close();
    });

    // Scrolling the Projects section fully out of view returns the rail to
    // the identity view on its own — the gallery only makes sense while
    // Projects is actually what's on screen.
    if (projectsSection) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting && identity.hidden) closeSilently();
                }
            },
            { threshold: 0 }
        );
        sectionObserver.observe(projectsSection);
    }

    for (const trigger of triggers) {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            open(trigger);
        });
    }
}
