# Portfolio

**Version 1.0.1** — production-ready.

A single-page personal portfolio site for Mark Bryan Gabriel ("Bryle") — vanilla HTML,
CSS, and JavaScript, no framework, no build step, no dependencies.

## Features

- **Split-screen layout** on desktop (identity rail · section nav · content panels) that
  collapses to a single column with a bottom nav dock on mobile.
- **Light/dark theme** toggle, persisted in `localStorage`, following the OS preference
  until you make an explicit choice — resolved before first paint so there's no flash of
  the wrong theme, with a circular reveal animation centered on the toggle button.
- **Scroll-spy navigation** — the nav marks the section currently in view via
  `aria-current`, not just a styling class.
- **Project screenshot gallery** — clicking a project opens its screenshots inline in the
  rail on desktop, or as a modal on mobile; hovering (desktop) or tapping (mobile) a
  screenshot enlarges it further in its own lightbox.
- **Scroll-reveal animation**, progressively enhanced: content is fully visible by
  default and only animates in for visitors who haven't requested reduced motion.
- Built with accessibility in mind: skip link, visible focus states, 44px touch targets,
  full `prefers-reduced-motion` support, and every color pairing in both themes verified
  against WCAG AA contrast requirements.
- SEO essentials: canonical link, Open Graph/Twitter Card tags, Person structured data
  (JSON-LD), `robots.txt`, and `sitemap.xml`.

## Project structure

```
index.html          Single page: all markup and section content
robots.txt           Crawler directives + sitemap reference
sitemap.xml          Single-URL sitemap for the page
css/
  tokens.css        Design tokens (color, type, spacing, motion) — light & dark themes
  base.css          Reset, font loading, global typography, a11y primitives
  layout.css        Macro layout (rail / nav / content panels, responsive breakpoints)
  components.css    Reusable UI pieces (rail, project gallery, image lightbox, nav ticks,
                    theme toggle, tags, reveal)
  sections.css      Per-section styles (overview, projects, skills, experience, contact)
js/
  main.js           Entry point — wires up the feature modules below
  theme.js          Theme toggle + persistence
  scrollSpy.js      Active-section nav highlighting
  motion.js         Scroll-reveal animation
  projectGallery.js Per-project screenshot gallery (inline on desktop, modal on mobile)
  imageLightbox.js  Enlarged screenshot preview (hover on desktop, tap on mobile)
assets/             Resume PDF + project screenshots
```

## Getting started

No build tools or dependencies required.

- Open `index.html` directly in a browser, **or**
- Serve the folder with any static server. Since this project lives under XAMPP's
  `htdocs/`, it's also reachable via Apache at `http://localhost/portfolio/`.

## Formatting

A Prettier config is included at [.prettierrc](.prettierrc). Prettier isn't installed as
a project dependency, so run it via:

```sh
npx prettier@3 --write index.html css/*.css js/*.js
```

## Customizing

To make this your own, update in `index.html`:

- Name, role, intro copy, and location in the `.rail` header
- `#projects` entries and their matching `<template id="gallery-shots-*">` screenshot sets
- `#skills`, `#experience`, and `#contact` entries
- `<title>`, meta description, canonical/OG URLs, and the JSON-LD block in `<head>`
- `robots.txt` / `sitemap.xml` if you deploy to a different domain than `itsmebryle.com`
- Design tokens (colors, fonts, spacing) in `css/tokens.css` if you want a different look

**Known gap:** there's no dedicated Open Graph preview image (1200×630) yet, so
`og:image`/`twitter:image` are omitted rather than pointing at something misleading — add
one before relying on rich link previews on social platforms.
