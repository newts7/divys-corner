import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { marked } from 'marked';
import fm from 'front-matter';
import { Resvg } from '@resvg/resvg-js';

const POSTS_DIR = './posts';
// The site's design lives in themes/press (editorial/print). THEME is still an
// env var so a future candidate design can be built side by side without
// touching this file; with nothing set the site builds as Press.
const THEME = process.env.THEME || 'press';
const DIST_DIR = process.env.DIST_DIR || './dist';
const THEME_DIR = THEME ? path.join('./themes', THEME) : null;
const PUBLIC_DIR = './public';
const OG_DIR = path.join(DIST_DIR, 'og');

// Resolve bundled Inter font files (used to rasterise OG images deterministically,
// independent of whatever fonts happen to exist on the build machine).
const require = createRequire(import.meta.url);
const FONT_FILES = [
  require.resolve('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
  require.resolve('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
  require.resolve('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
];

// Site-wide config (drives canonical URLs, sitemap, Open Graph, RSS, structured data)
const SITE = {
  url: 'https://divys.blog',
  name: "Divy's",
  title: "Divy's — Musings on Programming, Philosophy & Life",
  description:
    "The personal journal of Divyanshu — essays and notes on programming, philosophy, cloud engineering, and life.",
  author: 'Divyanshu',
  twitter: '@__newts',
  locale: 'en_US',
  image: 'https://divys.blog/og-default.png',
  social: [
    'https://github.com/newts7',
    'https://www.linkedin.com/in/imnewts/',
    'https://x.com/__newts',
  ],
};

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Copy public files to dist
function copyPublicFiles() {
  const files = fs.readdirSync(PUBLIC_DIR);
  for (const file of files) {
    fs.copyFileSync(path.join(PUBLIC_DIR, file), path.join(DIST_DIR, file));
  }
  // Theme assets (style.css, theme.js, ...) win over the defaults in public/
  if (THEME_DIR && fs.existsSync(THEME_DIR)) {
    for (const file of fs.readdirSync(THEME_DIR)) {
      if (file === 'theme.js') continue; // build-time module, not a static asset
      const from = path.join(THEME_DIR, file);
      if (fs.statSync(from).isFile()) fs.copyFileSync(from, path.join(DIST_DIR, file));
    }
  }
}

// Escape a string for safe use inside HTML attributes / XML text
function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---- Open Graph image generation (1200x630 PNG, rendered from SVG via resvg) ----

// Greedily wrap a title into lines of at most `maxChars`, capping at `maxLines`
// (the final line gets an ellipsis if the title overflows).
function wrapTitle(title, maxChars = 24, maxLines = 4) {
  const words = String(title).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…';
  }
  return lines;
}

// SVG for a per-post OG card: brand mark + wrapped title + footer.
function ogPostSvg(title) {
  const lines = wrapTitle(title);
  const fontSize = 66;
  const lineHeight = 84;
  // Vertically centre the title block within the area below the brand row.
  const blockHeight = lines.length * lineHeight;
  let y = 300 + (300 - blockHeight) / 2;
  const titleSvg = lines
    .map((l) => {
      const t = `<text x="72" y="${y}" fill="#ffffff" font-family="Inter" font-size="${fontSize}" font-weight="700">${esc(l)}</text>`;
      y += lineHeight;
      return t;
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1d1d1f"/>
  <rect x="72" y="72" width="84" height="84" rx="20" fill="#ffffff"/>
  <text x="114" y="132" text-anchor="middle" fill="#1d1d1f" font-family="Inter" font-size="52" font-weight="700">D</text>
  <text x="172" y="130" fill="#ffffff" font-family="Inter" font-size="40" font-weight="700">Divy's</text>
  ${titleSvg}
  <text x="72" y="566" fill="#6e6e73" font-family="Inter" font-size="30" font-weight="500">divys.blog • Programming • Philosophy • Life</text>
</svg>`;
}

// SVG for the default/site-wide OG card.
function ogDefaultSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1d1d1f"/>
  <rect x="64" y="64" width="120" height="120" rx="28" fill="#ffffff"/>
  <text x="124" y="152" text-anchor="middle" fill="#1d1d1f" font-family="Inter" font-size="74" font-weight="700">D</text>
  <text x="64" y="340" fill="#ffffff" font-family="Inter" font-size="84" font-weight="700">Divy's</text>
  <text x="64" y="412" fill="#a1a1a6" font-family="Inter" font-size="40" font-weight="400">Musings of a wandering mind</text>
  <text x="64" y="566" fill="#6e6e73" font-family="Inter" font-size="32" font-weight="500">Programming • Philosophy • Life</text>
</svg>`;
}

// Rasterise an SVG string to a 1200-wide PNG buffer using the bundled Inter fonts.
function svgToPng(svg) {
  const resvg = new Resvg(svg, {
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: 'Inter' },
    fitTo: { mode: 'width', value: 1200 },
  });
  return resvg.render().asPng();
}

// HTML Templates
// Presentation hooks a theme may override (see themes/<name>/theme.js)
let theme = {
  bodyClass: '',
  head: '',
  bodyEnd: '',
  shell: (content) => `<div class="container">
    ${content}
    <footer>
      <p class="footer-text">Written with love & curiosity</p>
      <p class="footer-quote">"A tiny dot in the cosmos, programming when not doing philosophy"</p>
    </footer>
  </div>`,
};

const baseTemplate = (content, meta = {}) => {
  const {
    title = SITE.title,
    description = SITE.description,
    pagePath = '',
    type = 'website',
    image = SITE.image,
    imageAlt = `${SITE.name} — ${SITE.author}`,
    socialTitle = title,
    publishedTime = null,
    modifiedTime = null,
    tags = [],
    jsonLd = null,
    robots = 'index, follow, max-image-preview:large, max-snippet:-1',
  } = meta;

  const canonical = SITE.url + (pagePath ? `/${pagePath}` : '/');
  const jsonLdBlock = jsonLd
    ? `\n  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="${esc(SITE.author)}">
  <meta name="robots" content="${robots}">
  <meta name="theme-color" content="#1d1d1f">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" type="application/rss+xml" title="${esc(SITE.name)} RSS Feed" href="${SITE.url}/feed.xml">
  <link rel="sitemap" type="application/xml" href="${SITE.url}/sitemap.xml">

  <!-- Open Graph -->
  <meta property="og:type" content="${type}">
  <meta property="og:title" content="${esc(socialTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="${esc(SITE.name)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(imageAlt)}">
  <meta property="og:locale" content="${SITE.locale}">${
    publishedTime ? `\n  <meta property="article:published_time" content="${publishedTime}">` : ''
  }${modifiedTime ? `\n  <meta property="article:modified_time" content="${modifiedTime}">` : ''}${
    type === 'article' ? `\n  <meta property="article:author" content="${esc(SITE.author)}">` : ''
  }${
    tags.length ? '\n  ' + tags.map((t) => `<meta property="article:tag" content="${esc(t)}">`).join('\n  ') : ''
  }

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(socialTitle)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${esc(imageAlt)}">
  <meta name="twitter:creator" content="${esc(SITE.twitter)}">

  <link rel="stylesheet" href="/style.css">${theme.head}
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%231d1d1f' rx='22' width='100' height='100'/><text x='50' y='68' text-anchor='middle' fill='%23ffffff' font-family='-apple-system,SF Pro Display,sans-serif' font-size='58' font-weight='600'>D</text></svg>">${jsonLdBlock}
</head>
<body${theme.bodyClass ? ` class="${theme.bodyClass}"` : ''}>
  ${theme.shell(content)}${theme.bodyEnd}
</body>
</html>`;
};

const headerTemplate = `
<header>
  <h1 class="site-title"><a href="/">Divy's</a></h1>
  <p class="site-subtitle">Musings of a wandering mind</p>
  <p class="site-tagline">Programming • Philosophy • Life</p>
  <nav>
    <a href="/">Journal</a>
    <a href="/about">About</a>
  </nav>
</header>`;

const sidebarTemplate = (tags, years, activeTag = null, activeYear = null) => `
<aside class="sidebar">
  <div class="sidebar-section">
    <h3 class="sidebar-title">Years</h3>
    <ul class="sidebar-list">
      ${years.map(y => `
        <li><a href="/year-${y.year}" class="${activeYear === y.year ? 'active' : ''}">${y.year}<span class="count">${y.count}</span></a></li>
      `).join('')}
    </ul>
  </div>
  <div class="sidebar-section">
    <h3 class="sidebar-title">Topics</h3>
    <ul class="sidebar-list">
      ${tags.map(t => `
        <li><a href="/tag-${t.slug}" class="${activeTag === t.slug ? 'active' : ''}">${t.name}<span class="count">${t.count}</span></a></li>
      `).join('')}
    </ul>
  </div>
</aside>`;

const postListItemTemplate = (post) => `
<li class="post-item">
  <span class="post-date"><time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time></span>
  <h2 class="post-title"><a href="/${post.slug}">${post.title}</a></h2>
  <p class="post-excerpt">${post.excerpt || ''}</p>
  ${post.tags && post.tags.length > 0 ? `<div class="post-tags">${post.tags.map(t => `<a href="/tag-${slugify(t)}" class="tag">${t}</a>`).join('')}</div>` : ''}
</li>`;

// Share buttons (X, WhatsApp, Instagram, copy link)
const shareTemplate = (post) => {
  const url = `${SITE.url}/${post.slug}`;
  const title = post.title;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  const icons = {
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.582 0 11.94-5.358 11.944-11.892a11.821 11.821 0 00-3.487-8.453z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
  };
  return `
    <div class="post-share" data-share-url="${esc(url)}" data-share-title="${esc(title)}">
      <span class="share-label">Share</span>
      <div class="share-buttons">
        <a class="share-btn share-x" href="${esc(xUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Share on X">${icons.x}</a>
        <a class="share-btn share-wa" href="${esc(waUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">${icons.whatsapp}</a>
        <button class="share-btn share-ig" type="button" aria-label="Share on Instagram">${icons.instagram}</button>
        <button class="share-btn share-link" type="button" aria-label="Copy link">${icons.link}</button>
      </div>
    </div>`;
};

// Inline script powering copy-link, the toast, and Instagram/native share
const shareScript = `
<script>
(function () {
  var box = document.querySelector('.post-share');
  if (!box) return;
  var url = box.dataset.shareUrl;
  var title = box.dataset.shareTitle;

  function toast(msg) {
    var t = document.querySelector('.share-toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'share-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }

  function fallbackCopy() {
    var ta = document.createElement('textarea');
    ta.value = url;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function copyLink() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(url).catch(fallbackCopy);
    }
    return fallbackCopy();
  }

  var linkBtn = box.querySelector('.share-link');
  if (linkBtn) {
    linkBtn.addEventListener('click', function () {
      copyLink().then(function () { toast('Link copied to clipboard'); });
    });
  }

  var igBtn = box.querySelector('.share-ig');
  if (igBtn) {
    igBtn.addEventListener('click', function () {
      if (navigator.share) {
        navigator.share({ title: title, url: url }).catch(function (e) {
          if (e && e.name === 'AbortError') return;
          copyLink().then(function () { toast('Link copied — open Instagram to share'); });
        });
        return;
      }
      copyLink().then(function () { toast('Link copied — open Instagram to share'); });
    });
  }
})();
</script>`;

let postTemplate = (post, tags, years) => `
<a href="/" class="back-link">Back to Journal</a>
<div class="content-wrapper">
  <article class="post">
    <header>
      <h1 class="post-title">${post.title}</h1>
      <p class="post-meta"><time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>${post.tags && post.tags.length > 0 ? ` · ${post.tags.map(t => `<a href="/tag-${slugify(t)}">${t}</a>`).join(', ')}` : ''}</p>
    </header>
    <div class="post-content">
      ${post.content}
    </div>
    ${shareTemplate(post)}
  </article>
  ${sidebarTemplate(tags, years)}
</div>
${shareScript}`;

let indexTemplate = (posts, tags, years, title = null, activeTag = null, activeYear = null) => `
${headerTemplate}
${title ? `<h2 class="archive-title">${title}</h2>` : ''}
<div class="content-wrapper">
  <main>
    <ul class="post-list">
      ${posts.map(postListItemTemplate).join('')}
    </ul>
  </main>
  ${sidebarTemplate(tags, years, activeTag, activeYear)}
</div>`;

let aboutTemplate = `
${headerTemplate}
<main class="about-content">
  <article class="post">
    <div class="post-content">
      <p>Hello, I'm <strong>Divyanshu</strong> — a curious soul navigating the intersection of code and cosmos.</p>

      <p>By day, I solve problems with programming. By night, I ponder the deeper questions that code can't quite answer. This corner of the internet is where I share my thoughts, learnings, and occasional musings on life, technology, and everything in between.</p>

      <p>I believe in the power of writing to clarify thought, and in sharing ideas openly. Whether it's a technical deep-dive, a philosophical tangent, or just a reflection on something I've learned — you'll find it here.</p>

      <hr>

      <p>Find me elsewhere:</p>
      <div class="social-links">
        <a href="https://github.com/newts7" aria-label="GitHub"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg></a>
        <a href="https://www.linkedin.com/in/imnewts/" aria-label="LinkedIn"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        <a href="https://x.com/__newts" aria-label="X"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
      </div>
    </div>
  </article>
</main>`;

let notFoundTemplate = `
${headerTemplate}
<main class="about-content">
  <article class="post">
    <header>
      <h1 class="post-title">Page not found</h1>
      <p class="post-meta">Error 404</p>
    </header>
    <div class="post-content">
      <p>The page you're looking for doesn't exist — it may have been moved or never existed at all.</p>
      <p><a href="/">Head back to the Journal</a> and find something worth reading.</p>
    </div>
  </article>
</main>`;

// Helper functions
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// YYYY-MM-DD for <time datetime> and sitemap <lastmod>
function isoDate(dateStr) {
  return new Date(dateStr).toISOString().split('T')[0];
}

// Full ISO 8601 for article:published_time
function isoDateTime(dateStr) {
  return new Date(dateStr).toISOString();
}

function getSlug(filename) {
  return filename.replace(/\.md$/, '');
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getExcerpt(content, maxLength = 160) {
  const text = content.replace(/<[^>]+>/g, '').replace(/\n/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

function getYear(dateStr) {
  return new Date(dateStr).getFullYear();
}

// JSON-LD structured data
function websiteJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.name,
      alternateName: 'Divys Corner',
      url: SITE.url + '/',
      description: SITE.description,
      inLanguage: 'en',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: SITE.author,
      url: SITE.url + '/about',
      sameAs: SITE.social,
    },
  ];
}

function postJsonLd(post) {
  const url = `${SITE.url}/${post.slug}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: isoDateTime(post.date),
      dateModified: isoDateTime(post.updated),
      author: { '@type': 'Person', name: SITE.author, url: SITE.url + '/about' },
      publisher: { '@type': 'Person', name: SITE.author, url: SITE.url + '/about' },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url,
      image: post.ogImage,
      keywords: (post.tags || []).join(', '),
      inLanguage: 'en',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Journal', item: SITE.url + '/' },
        { '@type': 'ListItem', position: 2, name: post.title, item: url },
      ],
    },
  ];
}

// Read and parse all posts
function getPosts() {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const posts = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const parsed = fm(content);
    const htmlContent = marked(parsed.body);

    const slug = getSlug(file);
    const date = parsed.attributes.date || new Date().toISOString();
    posts.push({
      slug,
      title: parsed.attributes.title || slug,
      date,
      // Optional `updated:` front-matter drives dateModified / article:modified_time.
      updated: parsed.attributes.updated || date,
      excerpt: parsed.attributes.excerpt || getExcerpt(htmlContent),
      content: htmlContent,
      draft: parsed.attributes.draft || false,
      tags: parsed.attributes.tags || [],
      ogImage: `${SITE.url}/og/${slug}.png`,
    });
  }

  // Sort by date, newest first
  return posts
    .filter(p => !p.draft)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Get all unique tags with counts
function getTags(posts) {
  const tagCounts = {};
  for (const post of posts) {
    if (post.tags) {
      for (const tag of post.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }
  return Object.entries(tagCounts)
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => b.count - a.count);
}

// Get all unique years with counts
function getYears(posts) {
  const yearCounts = {};
  for (const post of posts) {
    const year = getYear(post.date);
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  }
  return Object.entries(yearCounts)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => b.year - a.year);
}

// Generate sitemap.xml
function buildSitemap(posts, tags, years) {
  const newest = posts.length ? isoDate(posts[0].date) : null;
  const entries = [];

  const add = (loc, lastmod, changefreq, priority) => {
    entries.push(
      `  <url>\n    <loc>${loc}</loc>` +
      (lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '') +
      (changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : '') +
      (priority ? `\n    <priority>${priority}</priority>` : '') +
      `\n  </url>`
    );
  };

  add(SITE.url + '/', newest, 'daily', '1.0');
  add(SITE.url + '/about', null, 'monthly', '0.5');
  for (const post of posts) add(`${SITE.url}/${post.slug}`, isoDate(post.date), 'yearly', '0.8');
  for (const tag of tags) add(`${SITE.url}/tag-${tag.slug}`, newest, 'weekly', '0.4');
  for (const year of years) add(`${SITE.url}/year-${year.year}`, newest, 'yearly', '0.4');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

// Generate robots.txt
function buildRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`;
}

// Generate RSS feed (feed.xml)
function buildFeed(posts) {
  const lastBuild = posts.length ? new Date(posts[0].date).toUTCString() : '';
  const items = posts.map(p => {
    const url = `${SITE.url}/${p.slug}`;
    return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>${(p.tags || []).map(t => `\n      <category>${esc(t)}</category>`).join('')}
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)}</title>
    <link>${SITE.url}/</link>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(SITE.description)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

// Build the site
function build() {
  console.log('🏗️  Building Divy\'s...\n');

  // Copy static files
  copyPublicFiles();
  console.log('✓ Copied static files');

  // Get all posts
  const posts = getPosts();
  console.log(`✓ Found ${posts.length} posts`);

  // Get tags and years
  const tags = getTags(posts);
  const years = getYears(posts);
  console.log(`✓ Found ${tags.length} tags, ${years.length} years`);

  // Generate index page
  const indexHtml = baseTemplate(indexTemplate(posts, tags, years), {
    title: SITE.title,
    description: SITE.description,
    pagePath: '',
    type: 'website',
    jsonLd: websiteJsonLd(),
  });
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml);
  console.log('✓ Generated index.html');

  // Generate about page
  const aboutHtml = baseTemplate(aboutTemplate, {
    title: "About — Divy's",
    description: "About Divyanshu — programmer, occasional philosopher, and the writer behind Divy's.",
    pagePath: 'about',
    type: 'profile',
  });
  fs.writeFileSync(path.join(DIST_DIR, 'about.html'), aboutHtml);
  console.log('✓ Generated about.html');

  // Generate 404 page (noindex — error pages shouldn't be in the index)
  const notFoundHtml = baseTemplate(notFoundTemplate, {
    title: "Page not found — Divy's",
    description: "The page you're looking for doesn't exist.",
    pagePath: '404',
    type: 'website',
    robots: 'noindex, follow',
  });
  fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFoundHtml);
  console.log('✓ Generated 404.html');

  // Generate tag pages
  for (const tag of tags) {
    const tagPosts = posts.filter(p => p.tags && p.tags.includes(tag.name));
    const tagHtml = baseTemplate(
      indexTemplate(tagPosts, tags, years, `Tagged: ${tag.name}`, tag.slug, null),
      {
        title: `${tag.name} — ${SITE.name}`,
        description: `Essays and notes tagged "${tag.name}" on ${SITE.name}.`,
        pagePath: `tag-${tag.slug}`,
        type: 'website',
      }
    );
    fs.writeFileSync(path.join(DIST_DIR, `tag-${tag.slug}.html`), tagHtml);
    console.log(`✓ Generated tag-${tag.slug}.html`);
  }

  // Generate year pages
  for (const year of years) {
    const yearPosts = posts.filter(p => getYear(p.date) === year.year);
    const yearHtml = baseTemplate(
      indexTemplate(yearPosts, tags, years, `${year.year}`, null, year.year),
      {
        title: `${year.year} — ${SITE.name}`,
        description: `Posts published in ${year.year} on ${SITE.name}.`,
        pagePath: `year-${year.year}`,
        type: 'website',
      }
    );
    fs.writeFileSync(path.join(DIST_DIR, `year-${year.year}.html`), yearHtml);
    console.log(`✓ Generated year-${year.year}.html`);
  }

  // Generate per-post OG images
  if (!fs.existsSync(OG_DIR)) fs.mkdirSync(OG_DIR, { recursive: true });
  fs.writeFileSync(path.join(DIST_DIR, 'og-default.png'), svgToPng(ogDefaultSvg()));
  for (const post of posts) {
    fs.writeFileSync(path.join(OG_DIR, `${post.slug}.png`), svgToPng(ogPostSvg(post.title)));
  }
  console.log(`✓ Generated ${posts.length + 1} OG images`);

  // Generate individual post pages
  for (const post of posts) {
    const postHtml = baseTemplate(postTemplate(post, tags, years), {
      title: `${post.title} — ${SITE.name}`,
      socialTitle: post.title,
      description: post.excerpt,
      pagePath: post.slug,
      type: 'article',
      image: post.ogImage,
      imageAlt: `${post.title} — ${SITE.name}`,
      publishedTime: isoDateTime(post.date),
      modifiedTime: post.updated !== post.date ? isoDateTime(post.updated) : null,
      tags: post.tags,
      jsonLd: postJsonLd(post),
    });
    fs.writeFileSync(path.join(DIST_DIR, `${post.slug}.html`), postHtml);
    console.log(`✓ Generated ${post.slug}.html`);
  }

  // Generate SEO files
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), buildSitemap(posts, tags, years));
  console.log('✓ Generated sitemap.xml');

  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), buildRobots());
  console.log('✓ Generated robots.txt');

  fs.writeFileSync(path.join(DIST_DIR, 'feed.xml'), buildFeed(posts));
  console.log('✓ Generated feed.xml');

  console.log('\n✨ Build complete! Files are in ./dist');
}

async function loadTheme() {
  if (!THEME) return;
  const modPath = path.resolve(THEME_DIR, 'theme.js');
  if (!fs.existsSync(modPath)) throw new Error(`Unknown theme "${THEME}" (no ${modPath})`);
  const mod = await import(`file://${modPath}`);
  const t = mod.createTheme({
    SITE, esc, formatDate, isoDate, slugify, getYear,
    shareTemplate, shareScript,
  });
  theme = { ...theme, ...t };
  if (t.indexTemplate) indexTemplate = t.indexTemplate;
  if (t.postTemplate) postTemplate = t.postTemplate;
  if (t.aboutTemplate) aboutTemplate = t.aboutTemplate;
  if (t.notFoundTemplate) notFoundTemplate = t.notFoundTemplate;
  console.log(`🎨 Theme: ${THEME}`);
}

await loadTheme();
build();
