# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A single-page personal portfolio site for Mark Bryan Gabriel ("Bryle"), a full stack web
developer in Manila, Philippines. Static HTML/CSS/JS only — no build step, no package
manager, no bundler, no test suite. Version 1.0.1, production-ready: all content in
`index.html` is real (name, bio, real work history, two real shipped projects with
screenshots — resum.io and sense).

## Commands

There is no `package.json`, build tool, linter, or test runner in this repo.

- **Preview**: open `index.html` directly in a browser, or serve the folder statically
  (it lives under XAMPP's `htdocs/`, so it's also reachable at `http://localhost/portfolio/`
  via Apache). Everything is relative paths — no server-side logic.
- **Format**: a Prettier config exists at `.prettierrc` (4-space tabs, single quotes,
  120 print width) but Prettier itself isn't installed as a dependency — run via
  `npx prettier@3 --write index.html css/*.css js/*.js` if formatting is needed.

## Architecture

**One page, five CSS files, six JS modules — no framework.**

### CSS (`css/`, loaded in this cascade order from `index.html`)

1. `tokens.css` — the only source of design values (colors, type scale, spacing, motion
   easing/duration, layout metrics) as custom properties on `:root`. Light theme is
   default; `[data-theme="dark"]` overrides the color tokens. **Components must consume
   these variables, never hard-code raw values** — that's what keeps both themes in sync.
2. `base.css` — reset, `@font-face` fallback declarations, global typography, focus/selection
   styles, `.skip-link` and `.visually-hidden` primitives, `scrollbar-gutter: stable` (so
   opening a modal — which locks `overflow` — never shifts page content sideways).
3. `layout.css` — macro grid: desktop is a 3-column split (`--rail-width | --ruler-width | 1fr`)
   that collapses to a single column below `60em`, with the nav becoming a fixed bottom dock
   instead of a sticky sidebar. Mobile-first: base rules are the small-screen layout, the
   split-screen is layered on inside the `@media (min-width: 60em)` block.
4. `components.css` — reusable pieces: rail identity block, the project gallery panel (dual
   presentation — inline in the rail on desktop, a modal on mobile; see JS below), the image
   lightbox (hover peek on desktop, tap modal on mobile), ruler/tick nav link states,
   theme-toggle button, `.tags`, and the `.reveal`/`.is-inview`/`.motion-ok` scroll-reveal
   utility.
5. `sections.css` — per-section styles only (overview, projects, skills, experience, contact);
   shared behavior (snapping, centering, spacing) intentionally stays out of this file.

All CSS and JS is formatted per `.prettierrc` (4-space soft tabs, single quotes) — run
`npx prettier@3 --write index.html css/*.css js/*.js` after edits.

### JS (`js/`, loaded as `<script type="module" src="js/main.js">`, no bundler)

Each module is independent and fails closed (a missing element/API just makes that module
a no-op) so one broken feature can't take down the others:

- `main.js` — entry point; imports and calls each module's `init*()` function.
- `theme.js` — light/dark toggle. The _actual_ theme is set pre-paint by an inline script in
  `index.html`'s `<head>` (reads `localStorage`, falls back to `prefers-color-scheme`) so
  there's never a flash of the wrong theme; this module only wires the toggle button,
  persists explicit choices to `localStorage`, keeps following the OS preference live until
  the visitor makes an explicit choice, and (when supported) plays a circular
  `document.startViewTransition` reveal centered on the toggle button.
- `scrollSpy.js` — `IntersectionObserver` over the section elements, using a thin
  (`-45% ... -45%`) horizontal band as the "in view" test so it works even when a section
  is taller than the viewport. Sets `aria-current="true"` on the matching `.ruler__link`.
- `motion.js` — scroll-reveal via `IntersectionObserver`, but only activates when
  `prefers-reduced-motion: no-preference` _and_ `IntersectionObserver` exists. It adds a
  `motion-ok` class to `<html>` first — CSS only hides `.reveal` elements when that class
  is present, so no-JS and reduced-motion visitors always see fully visible, unanimated
  content (progressive enhancement, not a loading state to accidentally break).
- `projectGallery.js` — clicking a project title opens a screenshot gallery for it: inline
  in the rail (`dialog.show()`, replacing the identity block in place) at desktop widths, or
  as a true modal (`dialog.showModal()`) below `60em` — same `<dialog>`, same content, the
  presentation is just picked at open time by viewport width. Each project's screenshots
  live in a `<template>` in `index.html` (`data-gallery-shots` on the trigger names which
  one); switching between projects while the panel is open cross-fades the content. Triggers
  are real `href` links with `event.preventDefault()`, so a browser without `<dialog>`
  support, or a failed script load, just falls through to normal navigation.
- `imageLightbox.js` — enlarges a screenshot from the gallery above: on hover at desktop
  widths (`dialog.show()`, no backdrop, dismissed on `mouseleave` — deliberately light so a
  hover doesn't freeze the page), or on tap at small widths (`dialog.showModal()`, full
  opaque backdrop, scroll-locked). Delegated on the shots list container since its images
  are populated dynamically per project by `projectGallery.js`.

### Design language

Palette is called "Patina" (cool bone background, green-black ink, single verdigris
accent) — deliberately one accent color, spent only on interactive/active state and the
one signature moment (the emphasized word in the hero headline, active project link).
Fonts: Archivo (display), Newsreader
(body/serif), Spline Sans Mono (data/labels/nav) from Google Fonts, each paired with a
local metric-compatible `@font-face` fallback (`size-adjust`/`ascent-override`/`descent-override`)
in `base.css` specifically to keep CLS at 0 during the font swap.

Accessibility is load-bearing, not incidental: skip link, visible focus rings via
`:focus-visible`, 44px minimum touch targets on nav links, `aria-current` for active nav
state (not just a CSS class), `prefers-reduced-motion` respected end-to-end, scroll-snap
uses `proximity` (never `mandatory`) so it can't trap a user inside an overflowing section,
and every color pairing in `tokens.css` (both themes) passes WCAG AA (4.5:1) for text.

### SEO

`index.html` carries a canonical link, Open Graph/Twitter Card tags, and a Person JSON-LD
block, all pointed at `https://itsmebryle.com/`. `robots.txt` and `sitemap.xml` live at the
project root. There's no dedicated Open Graph preview image (1200×630) yet — `og:image`/
`twitter:image` are intentionally omitted rather than pointing at something misleading; add
one and wire it in `<head>` before relying on rich social link previews.
