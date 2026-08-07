// js/imageLightbox.js
// Enlarges a project screenshot, or the rail's profile photo, on hover at
// desktop widths (dialog.show(), dismissed when the pointer leaves) or on
// tap at small widths (dialog.showModal()). Screenshots are delegated on
// their shots list container since they're populated dynamically per
// project by js/projectGallery.js; the rail photo is a single fixed
// element wired up directly. Both paths lock background scroll while a
// preview is open; the hover peek still skips the dimming backdrop the tap
// modal gets, kept deliberately light since a hover interaction shouldn't
// visually freeze the rest of the page the way a deliberate tap/click
// should.

const DESKTOP_QUERY = '(min-width: 60em)';

export function initImageLightbox() {
    const shotsList = document.querySelector('[data-gallery-shots-list]');
    const photoTrigger = document.querySelector('[data-lightbox-photo]');
    const lightbox = document.querySelector('[data-image-lightbox]');
    const lightboxImg = lightbox ? lightbox.querySelector('[data-image-lightbox-img]') : null;
    const caption = lightbox ? lightbox.querySelector('[data-image-lightbox-caption]') : null;
    const captionName = lightbox ? lightbox.querySelector('[data-image-lightbox-caption-name]') : null;
    const captionRole = lightbox ? lightbox.querySelector('[data-image-lightbox-caption-role]') : null;
    const closeBtn = lightbox ? lightbox.querySelector('[data-image-lightbox-close]') : null;

    if (!lightbox || !lightboxImg || !closeBtn) return;
    if (typeof lightbox.show !== 'function' || typeof lightbox.showModal !== 'function') return;

    function isDesktop() {
        return window.matchMedia(DESKTOP_QUERY).matches;
    }

    // Screenshots don't need a caption identifying them; the photo does, so
    // it can still say who it is once it's the only thing on screen at
    // modal/hover-peek size, away from the name text next to the thumbnail.
    // Name and role are set as separate lines (not one string) so they never
    // have to line-wrap mid-phrase on a narrow modal.
    function populate(img, { label, name, role } = {}) {
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt;
        lightbox.setAttribute('aria-label', label || img.alt || 'Enlarged image');
        if (captionName) captionName.textContent = name || '';
        if (captionRole) captionRole.textContent = role || '';
        if (caption) caption.hidden = !name && !role;
    }

    function lockScroll() {
        document.documentElement.style.overflow = 'hidden';
    }

    function unlockScroll() {
        document.documentElement.style.overflow = '';
    }

    function close() {
        if (lightbox.open) lightbox.close();
    }

    lightbox.addEventListener('close', unlockScroll);

    if (shotsList) {
        // Delegated (bubbling) so it covers whichever screenshots are
        // currently cloned into the list, without needing to re-bind per
        // project switch.
        shotsList.addEventListener('mouseover', (event) => {
            if (!isDesktop()) return;
            const img = event.target.closest('.rail__gallery-shot img');
            if (!img) return;
            populate(img);
            if (!lightbox.open) lockScroll();
            lightbox.show();
        });

        // mouseleave (not delegated, doesn't bubble) fires exactly once when
        // the pointer leaves the whole list — moving between sibling
        // thumbnails shouldn't close and reopen it.
        shotsList.addEventListener('mouseleave', () => {
            if (isDesktop() && !lightbox.matches(':modal')) close();
        });

        shotsList.addEventListener('click', (event) => {
            if (isDesktop()) return;
            const img = event.target.closest('.rail__gallery-shot img');
            if (!img) return;
            populate(img);
            lockScroll();
            lightbox.showModal();
        });
    }

    if (photoTrigger) {
        const photoImg = photoTrigger.querySelector('img');
        const populatePhoto = () => {
            if (!photoImg) return;
            populate(photoImg, {
                label: 'Larger photo of Mark Bryan Gabriel',
                name: 'Mark Bryan Gabriel',
                role: 'Full Stack Web Developer',
            });
        };

        // Mouse hover only — matches the screenshot peek above. Deliberately
        // not mirrored on focus: a dialog (even non-modal) moves focus to
        // itself once shown, which would immediately blur this trigger and
        // close what focus had just opened. Popping an overlay from focus
        // alone, before any activation, would also be a context change the
        // user didn't ask for (WCAG 3.2.1) — keyboard users get the enlarge
        // on Enter/Space instead, same as the click path below.
        photoTrigger.addEventListener('mouseenter', () => {
            if (!isDesktop()) return;
            populatePhoto();
            if (!lightbox.open) lockScroll();
            lightbox.show();
        });
        photoTrigger.addEventListener('mouseleave', () => {
            if (isDesktop() && !lightbox.matches(':modal')) close();
        });

        photoTrigger.addEventListener('click', (event) => {
            // A native button fires a click with detail: 0 when activated via
            // Enter/Space instead of a pointer, which is how keyboard users
            // reach this on desktop too — a real mouse click there is a
            // no-op since hover already opened the peek.
            const isKeyboardActivation = event.detail === 0;
            if (isDesktop() && !isKeyboardActivation) return;
            event.preventDefault();
            if (!photoImg) return;
            populatePhoto();
            lockScroll();
            lightbox.showModal();
        });
    }

    closeBtn.addEventListener('click', close);

    // A click landing on the dialog itself (rather than its padded content)
    // only happens in modal mode — it means the backdrop was hit.
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) close();
    });
}
