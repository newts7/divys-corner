// Serves the current site plus each candidate redesign on its own port so the
// three can be compared side by side in a browser.
//
//   npm run preview     (builds everything first, then serves)
//   node preview.js     (serves whatever is already built)

import http from 'http';
import fs from 'fs';
import path from 'path';

const SITES = [
  { port: 4000, dir: './dist',          name: 'Current (unchanged)' },
  { port: 4001, dir: './dist-press',    name: 'Design 1 — Press (editorial)' },
  { port: 4002, dir: './dist-terminal', name: 'Design 2 — Terminal (dark technical)' },
  { port: 4003, dir: './dist-atelier',  name: 'Design 3 — Atelier (modern minimal)' },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function serve(root, port, name) {
  if (!fs.existsSync(root)) {
    console.log(`⚠️  ${name}: ${root} not built yet — run npm run build:all`);
    return;
  }

  http
    .createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      // Resolve inside root only; never let ../ escape the served directory.
      const rel = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
      let file = path.join(root, rel);

      if (!path.resolve(file).startsWith(path.resolve(root))) {
        res.writeHead(403).end('Forbidden');
        return;
      }

      // Clean URLs: /about -> about.html, / -> index.html
      if (!path.extname(file)) {
        if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
          file = path.join(file, 'index.html');
        } else if (fs.existsSync(`${file}.html`)) {
          file = `${file}.html`;
        }
      }

      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        const notFound = path.join(root, '404.html');
        if (fs.existsSync(notFound)) {
          res.writeHead(404, { 'Content-Type': MIME['.html'] }).end(fs.readFileSync(notFound));
        } else {
          res.writeHead(404).end('Not found');
        }
        return;
      }

      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(fs.readFileSync(file));
    })
    .listen(port, () => {
      console.log(`  ${String(port).padEnd(6)} http://localhost:${port}  —  ${name}`);
    });
}

console.log('\n🎨  Divy\'s — design previews\n');
for (const site of SITES) serve(site.dir, site.port, site.name);
console.log('\n   Ctrl-C to stop all servers.\n');
