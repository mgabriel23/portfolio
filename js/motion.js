// js/motion.js
// Scroll-reveal micro-interaction, opted into only when the visitor allows
// motion. CSS keeps everything visible by default, so no-JS and
// reduced-motion visitors never see hidden content.

export function initMotion() {
    const allowsMotion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

    if (!allowsMotion || !('IntersectionObserver' in window)) return;

    const targets = document.querySelectorAll('.reveal');
    if (targets.length === 0) return;

    // Flag first, so the hide-then-reveal styles only ever apply when this
    // module is definitely going to reveal them again.
    document.documentElement.classList.add('motion-ok');

    const observer = new IntersectionObserver(
        (entries, self) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.classList.add('is-inview');
                self.unobserve(entry.target); // Reveal once; re-animating on every pass is noise.
            }
        },
        { threshold: 0.2 }
    );

    for (const target of targets) observer.observe(target);
}
