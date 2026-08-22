# Three candidate redesigns

The site now supports swappable themes. `build.js` reads two env vars:

```bash
THEME=press DIST_DIR=./dist-press node build.js
```

`THEME` picks a folder in `themes/`; every file in that folder is copied over
`public/` into the output, and `themes/<name>/theme.js` supplies the page
templates. With no `THEME` set the build is byte-for-byte the original site, so
nothing is lost if none of these are picked.

## Preview all of them

```bash
npm install
npm run preview
```

| Port | What |
|------|------|
| 4000 | Current site, unchanged (baseline for comparison) |
| 4001 | **Design 1 — Press** |
| 4002 | **Design 2 — Terminal** |
| 4003 | **Design 3 — Atelier** |

---

## Design 1 — Press (`themes/press`)

**Editorial / print.** The reference points are Stripe Press, Tufte CSS,
Increment magazine, and gwern.net — the designs people repeatedly name when
asked which blogs are a pleasure to read for long stretches.

- Warm paper background (`#fbf8f1`), oxblood accent, hairline rules instead of boxes
- Fraunces (display serif) + Newsreader (body serif) + IBM Plex Mono for chrome
- Front page reads like a front page: a full-width lead story, then a
  two-column numbered index of everything else
- Articles get a standfirst, a drop cap, a ~34rem measure, and a § section mark
- Right rail carries the archive, subjects, and a colophon
- Automatic dark mode via `prefers-color-scheme`

Best if you want the blog to feel like a publication and the writing to be the
loudest thing on the page.

## Design 2 — Terminal (`themes/terminal`)

**Dark-first technical.** Reference points: Vercel/Linear dark UI, LessWrong's
dual rails, Maxime Heckel's palette. Dark-mode-first was the single most-cited
2026 trend for long reading sessions.

- Deep charcoal (`#0a0c10`) with a faint blueprint grid, cyan/lime/violet accents
- JetBrains Mono for all chrome and code, Inter for prose
- Shell-prompt motifs (`$ cat post.md`, `# heading`) used as real information design
- Three-column article layout: **auto-generated sticky table of contents** on the
  left (built from the post's own `h2`/`h3`, with scroll-spy), prose in the middle,
  archive rail on the right
- Reading-progress bar and computed read time
- Post list is a dense scannable feed with ISO dates and hover states

Best if the audience is engineers and posts are long and code-heavy.

## Design 3 — Atelier (`themes/atelier`)

**Modern minimal / product-grade.** Reference points: Josh Comeau, Lee Robinson,
Brian Lovin, Linear's marketing site.

- Light-first with a **real dark-mode toggle** (persisted to `localStorage`,
  applied before first paint so there's no flash)
- Inter for everything, Instrument Serif italic for accents, indigo→violet gradient
- Landing hero with a call to action, then pill filters for topics and years
- Card grid index — the newest post is a full-width feature card, the rest are
  a two-up grid with hover lift
- Article page centred at 680px with an author block, read time, progress bar,
  and a share card

Best if you want the blog to feel like a modern product site and expect a lot of
mobile readers.

---

## Picking one

Once you've chosen, the theme can become the default by setting `THEME` in the
build command (`vercel.json` / your deploy step), or by folding that theme's
`theme.js` and `style.css` back into `build.js` and `public/style.css`.
