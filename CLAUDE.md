# Math Doodles

Small interactive math pages. Plain HTML/CSS/JS, no build step; GitHub Pages serves the repo root.

## Adding a page

- One self-contained `name.html`, plus a card on `index.html` with a tiny SVG preview.
- Link `common.css` first, then a page `<style>` for what's unique to the page.
- Load `common.js` before the page script; its helpers live on the global `doodle`
  (`$`, `clamp`, `gcd`, `bump`, `holdRepeat`, `numberPicker`, `css`, `onTheme`).
- Most pages use the app shell from `common.css` (`.app` > `.stage` + `.side` > `.top`):
  picture on top in portrait, sidebar on the right in landscape. See `gcf.html` for the
  smallest example. `shearing.html` is the exception: a full-screen canvas with floating panels.
- For number inputs, use the `.picker` markup and wire it with `doodle.numberPicker`.

## Colors

- Use the shared hues (`--red`, `--blue`, `--purple`, …) and UI tokens (`--ink`, `--panel`, …)
  from `common.css`; never hard-code a hex in a page's CSS.
- Give hues meaning per page with local names, e.g. `--a: var(--blue)`.
- Every page must look right in both light and dark mode.
