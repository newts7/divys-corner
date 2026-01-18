import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import fm from 'front-matter';

const POSTS_DIR = './posts';
const DIST_DIR = './dist';
const PUBLIC_DIR = './public';

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
}

// HTML Templates
const baseTemplate = (content, title = "Divy's") => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%231d1d1f' rx='22' width='100' height='100'/><text x='50' y='68' text-anchor='middle' fill='%23ffffff' font-family='-apple-system,SF Pro Display,sans-serif' font-size='58' font-weight='600'>D</text></svg>">
</head>
<body>
  <div class="container">
    ${content}
    <footer>
      <p class="footer-text">Written with love & curiosity</p>
      <p class="footer-quote">"A tiny dot in the cosmos, programming when not doing philosophy"</p>
    </footer>
  </div>
</body>
</html>`;

const headerTemplate = `
<header>
  <h1 class="site-title">Divy's</h1>
  <p class="site-subtitle">Musings of a wandering mind</p>
  <p class="site-tagline">Programming • Philosophy • Life</p>
  <nav>
    <a href="index.html">Journal</a>
    <a href="about.html">About</a>
  </nav>
</header>`;

const sidebarTemplate = (tags, years, activeTag = null, activeYear = null) => `
<aside class="sidebar">
  <div class="sidebar-section">
    <h3 class="sidebar-title">Years</h3>
    <ul class="sidebar-list">
      ${years.map(y => `
        <li><a href="year-${y.year}.html" class="${activeYear === y.year ? 'active' : ''}">${y.year}<span class="count">${y.count}</span></a></li>
      `).join('')}
    </ul>
  </div>
  <div class="sidebar-section">
    <h3 class="sidebar-title">Topics</h3>
    <ul class="sidebar-list">
      ${tags.map(t => `
        <li><a href="tag-${t.slug}.html" class="${activeTag === t.slug ? 'active' : ''}">${t.name}<span class="count">${t.count}</span></a></li>
      `).join('')}
    </ul>
  </div>
</aside>`;

const postListItemTemplate = (post) => `
<li class="post-item">
  <span class="post-date">${formatDate(post.date)}</span>
  <h2 class="post-title"><a href="${post.slug}.html">${post.title}</a></h2>
  <p class="post-excerpt">${post.excerpt || ''}</p>
  ${post.tags && post.tags.length > 0 ? `<div class="post-tags">${post.tags.map(t => `<a href="tag-${slugify(t)}.html" class="tag">${t}</a>`).join('')}</div>` : ''}
</li>`;

const postTemplate = (post, tags, years) => `
<a href="index.html" class="back-link">Back to Journal</a>
<div class="content-wrapper">
  <article class="post">
    <header>
      <h1 class="post-title">${post.title}</h1>
      <p class="post-meta">${formatDate(post.date)}${post.tags && post.tags.length > 0 ? ` · ${post.tags.map(t => `<a href="tag-${slugify(t)}.html">${t}</a>`).join(', ')}` : ''}</p>
    </header>
    <div class="post-content">
      ${post.content}
    </div>
  </article>
  ${sidebarTemplate(tags, years)}
</div>`;

const indexTemplate = (posts, tags, years, title = null, activeTag = null, activeYear = null) => `
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

const aboutTemplate = `
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

// Helper functions
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
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

    posts.push({
      slug: getSlug(file),
      title: parsed.attributes.title || getSlug(file),
      date: parsed.attributes.date || new Date().toISOString(),
      excerpt: parsed.attributes.excerpt || getExcerpt(htmlContent),
      content: htmlContent,
      draft: parsed.attributes.draft || false,
      tags: parsed.attributes.tags || []
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
  const indexHtml = baseTemplate(indexTemplate(posts, tags, years));
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml);
  console.log('✓ Generated index.html');

  // Generate about page
  const aboutHtml = baseTemplate(aboutTemplate, "About | Divy's");
  fs.writeFileSync(path.join(DIST_DIR, 'about.html'), aboutHtml);
  console.log('✓ Generated about.html');

  // Generate tag pages
  for (const tag of tags) {
    const tagPosts = posts.filter(p => p.tags && p.tags.includes(tag.name));
    const tagHtml = baseTemplate(
      indexTemplate(tagPosts, tags, years, `Tagged: ${tag.name}`, tag.slug, null),
      `${tag.name} | Divy's`
    );
    fs.writeFileSync(path.join(DIST_DIR, `tag-${tag.slug}.html`), tagHtml);
    console.log(`✓ Generated tag-${tag.slug}.html`);
  }

  // Generate year pages
  for (const year of years) {
    const yearPosts = posts.filter(p => getYear(p.date) === year.year);
    const yearHtml = baseTemplate(
      indexTemplate(yearPosts, tags, years, `${year.year}`, null, year.year),
      `${year.year} | Divy's`
    );
    fs.writeFileSync(path.join(DIST_DIR, `year-${year.year}.html`), yearHtml);
    console.log(`✓ Generated year-${year.year}.html`);
  }

  // Generate individual post pages
  for (const post of posts) {
    const postHtml = baseTemplate(postTemplate(post, tags, years), `${post.title} | Divy's`);
    fs.writeFileSync(path.join(DIST_DIR, `${post.slug}.html`), postHtml);
    console.log(`✓ Generated ${post.slug}.html`);
  }

  console.log('\n✨ Build complete! Files are in ./dist');
}

build();
