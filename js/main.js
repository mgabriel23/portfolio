// js/main.js
// Entry point: wires independent feature modules. Each module owns its own
// guards and can fail closed without affecting the others.

import { initTheme } from './theme.js';
import { initScrollSpy } from './scrollSpy.js';
import { initMotion } from './motion.js';
import { initProjectGallery } from './projectGallery.js';

function init() {
    initTheme();
    initScrollSpy();
    initMotion();
    initProjectGallery();
}

// Modules are deferred by type="module", but guard anyway in case the script
// is ever inlined or loaded differently.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
