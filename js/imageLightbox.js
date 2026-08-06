// js/imageLightbox.js
// Enlarges a project screenshot on hover at desktop widths (dialog.show(),
// dismissed when the pointer leaves the list) or on tap at small widths
// (dialog.showModal()). Delegated on the shots list container since its
// images are populated dynamically per project by js/projectGallery.js.
// Both paths lock background scroll while a preview is open; the hover peek
// still skips the dimming backdrop the tap modal gets, kept deliberately
// light since a hover interaction shouldn't visually freeze the rest of the
// page the way a deliberate tap/click should.

const DESKTOP_QUERY = '(min-width: 60em)';

export function initImageLightbox() {
    const shotsList = document.querySelector('[data-gallery-shots-list]');
    const lightbox = document.querySelector('[data-image-lightbox]');
    const lightboxImg = lightbox ? lightbox.querySelector('[data-image-lightbox-img]') : null;
    const closeBtn = lightbox ? lightbox.querySelector('[data-image-lightbox-close]') : null;

    if (!shotsList || !lightbox || !lightboxImg || !closeBtn) return;
    if (typeof lightbox.show !== 'function' || typeof lightbox.showModal !== 'function') return;

    function isDesktop() {
        return window.matchMedia(DESKTOP_QUERY).matches;
    }

    function populate(img) {
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt;
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

    // Delegated (bubbling) so it covers whichever screenshots are currently
    // cloned into the list, without needing to re-bind per project switch.
    shotsList.addEventListener('mouseover', (event) => {
        if (!isDesktop()) return;
        const img = event.target.closest('.rail__gallery-shot img');
        if (!img) return;
        populate(img);
        if (!lightbox.open) lockScroll();
        lightbox.show();
    });

    // mouseleave (not delegated, doesn't bubble) fires exactly once when the
    // pointer leaves the whole list — moving between sibling thumbnails
    // shouldn't close and reopen it.
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

    closeBtn.addEventListener('click', close);

    // A click landing on the dialog itself (rather than its padded content)
    // only happens in modal mode — it means the backdrop was hit.
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) close();
    });
}
