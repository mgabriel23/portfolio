# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A single-page personal portfolio site. Static HTML/CSS/JS only — no build step, no
package manager, no bundler, no test suite. All content in `index.html` (name, bio,
projects, experience, contact) is **placeholder content** ("Adrian Cruz", `example.com`
links, placeholder GitHub/LinkedIn/email) awaiting real details.

## Commands

There is no `package.json`, build tool, linter, or test runner in this repo.

- **Preview**: open `index.html` directly in a browser, or serve the folder statically
  (it lives under XAMPP's `htdocs/`, so it's also reachable at `http://localhost/portfolio/`
  via Apache). Everything is relative paths — no server-side logic.
- **Format**: a Prettier config exists at `.prettierrc` (4-space tabs, single quotes,
  120 print width) but Prettier itself isn't installed as a dependency — run via
  `npx prettier --write .` if formatting is needed.

## Architecture

**One page, five CSS files, four JS modules — no framework.**

### CSS (`css/`, loaded in this cascade order from `index.html`)

1. `tokens.css` — the only source of design values (colors, type scale, spacing, motion
   easing/duration, layout metrics) as custom properties on `:root`. Light theme is
   default; `[data-theme="dark"]` overrides the color tokens. **Components must consume
   these variables, never hard-code raw values** — that's what keeps both themes in sync.
2. `base.css` — reset, `@font-face` fallback declarations, global typography, focus/selection
   styles, `.skip-link` and `.visually-hidden` primitives.
3. `layout.css` — macro grid: desktop is a 3-column split (`--rail-width | --ruler-width | 1fr`)
   that collapses to a single column below `60em`, with the nav becoming a fixed bottom dock
   instead of a sticky sidebar. Mobile-first: base rules are the small-screen layout, the
   split-screen is layered on inside the `@media (min-width: 60em)` block.
4. `components.css` — reusable pieces: rail identity block, ruler/tick nav link states,
   theme-toggle button, `.tags`, and the `.reveal`/`.is-inview`/`.motion-ok` scroll-reveal
   utility.
5. `sections.css` — per-section styles only (overview, projects, experience, contact); shared
   behavior (snapping, centering, spacing) intentionally stays out of this file.

All CSS and JS is formatted per `.prettierrc` (4-space soft tabs, single quotes) — run
`npx prettier --write css/*.css js/*.js` after edits.

### JS (`js/`, loaded as `<script type="module" src="js/main.js">`, no bundler)

Each module is independent and fails closed (a missing element/API just makes that module
a no-op) so one broken feature can't take down the others:

- `main.js` — entry point; imports and calls `initTheme()`, `initScrollSpy()`, `initMotion()`.
- `theme.js` — light/dark toggle. The *actual* theme is set pre-paint by an inline script in
  `index.html`'s `<head>` (reads `localStorage`, falls back to `prefers-color-scheme`) so
  there's never a flash of the wrong theme; this module only wires the toggle button,
  persists explicit choices to `localStorage`, and keeps following the OS preference live
  until the visitor makes an explicit choice.
- `scrollSpy.js` — `IntersectionObserver` over the section elements, using a thin
  (`-45% ... -45%`) horizontal band as the "in view" test so it works even when a section
  is taller than the viewport. Sets `aria-current="true"` on the matching `.ruler__link`.
- `motion.js` — scroll-reveal via `IntersectionObserver`, but only activates when
  `prefers-reduced-motion: no-preference` *and* `IntersectionObserver` exists. It adds a
  `motion-ok` class to `<html>` first — CSS only hides `.reveal` elements when that class
  is present, so no-JS and reduced-motion visitors always see fully visible, unanimated
  content (progressive enhancement, not a loading state to accidentally break).

### Design language

Palette is called "Patina" (cool bone background, green-black ink, single verdigris
accent) — deliberately one accent color, spent only on interactive/active state and the
one signature moment (name, active project link). Fonts: Archivo (display), Newsreader
(body/serif), Spline Sans Mono (data/labels/nav) from Google Fonts, each paired with a
local metric-compatible `@font-face` fallback (`size-adjust`/`ascent-override`/`descent-override`)
in `base.css` specifically to keep CLS at 0 during the font swap.

Accessibility is load-bearing, not incidental: skip link, visible focus rings via
`:focus-visible`, 44px minimum touch targets on nav links, `aria-current` for active nav
state (not just a CSS class), `prefers-reduced-motion` respected end-to-end, and scroll-snap
uses `proximity` (never `mandatory`) so it can't trap a user inside an overflowing section.
