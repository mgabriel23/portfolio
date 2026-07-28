// js/scrollSpy.js
// Marks the ruler link of the section currently in view with aria-current,
// so the active state is exposed to assistive tech, not just styled.

/**
 * A narrow horizontal band across the viewport's middle decides "in view".
 * This works for sections taller than the viewport, where percentage
 * thresholds on the whole element would never fire.
 */
const OBSERVER_OPTIONS = {
  rootMargin: "-45% 0px -45% 0px",
  threshold: 0,
};

export function initScrollSpy() {
  const links = Array.from(
    document.querySelectorAll('.ruler__link[href^="#"]')
  );
  if (links.length === 0 || !("IntersectionObserver" in window)) return;

  const linkById = new Map();
  const sections = [];

  for (const link of links) {
    const id = decodeURIComponent(link.hash.slice(1));
    const section = id ? document.getElementById(id) : null;
    if (!section) continue; // A stale link should never break the observer set.
    linkById.set(id, link);
    sections.push(section);
  }

  if (sections.length === 0) return;

  const setActive = (id) => {
    for (const [linkId, link] of linkById) {
      if (linkId === id) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    }
  }, OBSERVER_OPTIONS);

  for (const section of sections) observer.observe(section);
}
