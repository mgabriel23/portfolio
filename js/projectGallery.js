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
    const rail = document.querySelector('.rail');
    const triggers = document.querySelectorAll('[data-open-gallery]');

    if (!identity || !panel || !rail || triggers.length === 0) return;
    if (typeof panel.show !== 'function' || typeof panel.showModal !== 'function') return;

    const contentEl = panel.querySelector('[data-gallery-content]');
    const eyebrowEl = panel.querySelector('[data-gallery-eyebrow]');
    const titleEl = panel.querySelector('[data-gallery-title]');
    const shotsListEl = panel.querySelector('[data-gallery-shots-list]');
    const visitEl = panel.querySelector('[data-gallery-visit]');
    const visitLabelEl = panel.querySelector('[data-gallery-visit-label]');
    const backBtn = panel.querySelector('[data-gallery-close]');

    let lastTrigger = null;

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

        const shotsTemplate = document.getElementById(trigger.dataset.galleryShots);
        if (shotsTemplate) shotsListEl.replaceChildren(shotsTemplate.content.cloneNode(true));
    }

    // Desktop content changes — first open, or switching projects while
    // already open — cross-fade via View Transitions instead of swapping
    // instantly, the same progressive-enhancement pattern theme.js uses for
    // the theme swap. Mobile's modal open/close keeps its own CSS transition.
    //
    // view-transition-name is set on .rail only for the instant this runs,
    // and cleared right after — that scopes the transition to just the rail
    // instead of the whole page (the default with no name set at all), so it
    // can't visibly touch the main content. It's set dynamically rather than
    // in CSS because a permanent name on .rail would also hijack the theme
    // toggle's own (already-working) full-page circular-reveal transition.
    function mutate(fn) {
        if (isDesktop() && allowsMotion() && document.startViewTransition) {
            rail.style.viewTransitionName = 'rail-panel';
            const transition = document.startViewTransition(fn);
            const clearName = () => {
                rail.style.viewTransitionName = '';
            };
            transition.finished.then(clearName, clearName);
        } else {
            fn();
        }
    }

    // Switching to a different project while the panel is already open is a
    // pure content change — nothing about the panel's own visibility changes,
    // so mutate()'s View Transition has nothing visible to animate. Fade the
    // content itself out and back in around the swap instead.
    function swapContent(trigger) {
        if (!contentEl || !allowsMotion()) {
            populate(trigger);
            return;
        }

        contentEl.classList.add('is-swapping');
        contentEl.addEventListener(
            'transitionend',
            () => {
                populate(trigger);
                contentEl.classList.remove('is-swapping');
            },
            { once: true }
        );
    }

    function open(trigger) {
        const isSwitch = panel.open;
        lastTrigger = trigger;

        if (isSwitch) {
            swapContent(trigger);
        } else {
            mutate(() => {
                populate(trigger);
                if (isDesktop()) {
                    identity.hidden = true;
                    panel.show();
                } else {
                    panel.showModal();
                }
            });
        }

        backBtn.focus({ preventScroll: true });
    }

    function close() {
        if (panel.open) mutate(() => panel.close());
    }

    panel.addEventListener('close', () => {
        identity.hidden = false;
        if (lastTrigger) lastTrigger.focus({ preventScroll: true });
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

    for (const trigger of triggers) {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            open(trigger);
        });
    }
}
