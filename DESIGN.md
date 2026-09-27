# Design

The site's look lives in `themes/press/` — an **editorial / print** design.
Reference points: Stripe Press, Tufte CSS, Increment, gwern.net.

- Warm paper background (`#fbf8f1`), oxblood accent, hairline rules instead of boxes
- Fraunces (display serif) + Newsreader (body serif) + IBM Plex Mono for chrome
- The front page reads like a front page: a full-width lead story, then a
  two-column numbered index of everything else
- Articles get a standfirst, a drop cap, a ~34rem measure, and a § section mark
- Right rail carries the archive, subjects, and a colophon
- Automatic dark mode via `prefers-color-scheme`

## How it plugs in

`build.js` reads a `THEME` env var, defaulting to `press`. It resolves to a
folder in `themes/`: every file there is copied over `public/` into the output,
and `theme.js` supplies the page templates.

```bash
npm run build     # builds the site as Press into dist/
```

To try an alternative design without disturbing this one, add
`themes/<name>/{theme.js,style.css}` and build it to a separate directory:

```bash
THEME=<name> DIST_DIR=./dist-<name> node build.js
```

Setting `THEME=` (empty) falls back to the original pre-redesign templates in
`build.js`, which are still there as a baseline.
