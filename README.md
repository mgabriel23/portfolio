# Portfolio

A single-page personal portfolio site — vanilla HTML, CSS, and JavaScript, no framework,
no build step, no dependencies.

> **Note:** the content in `index.html` (name, bio, projects, experience, contact links)
> is currently placeholder text and needs to be replaced with real details before this
> goes live.

## Features

- **Split-screen layout** on desktop (identity rail · section nav · content panels) that
  collapses to a single column with a bottom nav dock on mobile.
- **Light/dark theme** toggle, persisted in `localStorage`, following the OS preference
  until you make an explicit choice — resolved before first paint so there's no flash of
  the wrong theme.
- **Scroll-spy navigation** — the nav marks the section currently in view via
  `aria-current`, not just a styling class.
- **Scroll-reveal animation**, progressively enhanced: content is fully visible by
  default and only animates in for visitors who haven't requested reduced motion.
- Built with accessibility in mind: skip link, visible focus states, 44px touch targets,
  and full `prefers-reduced-motion` support.

## Project structure

```
index.html          Single page: all markup and section content
css/
  tokens.css        Design tokens (color, type, spacing, motion) — light & dark themes
  base.css          Reset, font loading, global typography, a11y primitives
  layout.css        Macro layout (rail / nav / content panels, responsive breakpoints)
  components.css    Reusable UI pieces (rail, nav ticks, theme toggle, tags, reveal)
  sections.css      Per-section styles (overview, projects, experience, contact)
js/
  main.js           Entry point — wires up the feature modules below
  theme.js          Theme toggle + persistence
  scrollSpy.js      Active-section nav highlighting
  motion.js         Scroll-reveal animation
assets/             Static assets (currently empty)
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
npx prettier --write .
```

## Customizing

To make this your own, update in `index.html`:

- Name, role, and intro copy in the `.rail` header
- Social/contact links (`GitHub`, `LinkedIn`, email) in `.rail__foot` and `#contact`
- `#projects` and `#experience` entries
- `<title>`, meta description, and Open Graph tags in `<head>`
- Design tokens (colors, fonts, spacing) in `css/tokens.css` if you want a different look
