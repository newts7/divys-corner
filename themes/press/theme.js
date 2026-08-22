// Theme: "Press" — an editorial, print-inspired treatment.
// Reference points: Stripe Press, Tufte CSS, Increment magazine, gwern.net typography.
// Warm paper, real serif display type, a numbered index, generous measure, drop caps.

export function createTheme(ctx) {
  const { SITE, esc, formatDate, isoDate, slugify, shareTemplate, shareScript } = ctx;

  const masthead = (variant = 'full') => `
<header class="masthead ${variant === 'compact' ? 'masthead-compact' : ''}">
  <div class="masthead-rule"></div>
  <div class="masthead-inner">
    <p class="masthead-kicker">A personal journal &middot; Est. MMXXIV</p>
    <h1 class="masthead-title"><a href="/">Divy&rsquo;s</a></h1>
    <p class="masthead-sub">Musings of a wandering mind &mdash; programming, philosophy, life</p>
  </div>
  <nav class="masthead-nav">
    <a href="/">Journal</a>
    <span class="nav-dot">&bull;</span>
    <a href="/about">About</a>
    <span class="nav-dot">&bull;</span>
    <a href="/feed.xml">RSS</a>
  </nav>
  <div class="masthead-rule thin"></div>
</header>`;

  const rail = (tags, years, activeTag, activeYear) => `
<aside class="rail">
  <section class="rail-section">
    <h3 class="rail-title">The Archive</h3>
    <ul class="rail-list">
      ${years.map(y => `<li><a href="/year-${y.year}" class="${activeYear === y.year ? 'active' : ''}"><span>${y.year}</span><em>${y.count}</em></a></li>`).join('')}
    </ul>
  </section>
  <section class="rail-section">
    <h3 class="rail-title">Subjects</h3>
    <ul class="rail-list rail-tags">
      ${tags.map(t => `<li><a href="/tag-${t.slug}" class="${activeTag === t.slug ? 'active' : ''}"><span>${t.name}</span><em>${t.count}</em></a></li>`).join('')}
    </ul>
  </section>
  <section class="rail-section rail-colophon">
    <h3 class="rail-title">Colophon</h3>
    <p>Set in Fraunces &amp; Newsreader. Written by hand, published as static files.</p>
  </section>
</aside>`;

  const lead = (post) => `
<article class="lead">
  <p class="lead-kicker">Latest dispatch</p>
  <h2 class="lead-title"><a href="/${post.slug}">${post.title}</a></h2>
  <p class="lead-excerpt">${post.excerpt || ''}</p>
  <p class="lead-meta">
    <time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>
    ${post.tags && post.tags.length ? `<span class="sep">&mdash;</span>${post.tags.map(t => `<a href="/tag-${slugify(t)}">${t}</a>`).join(', ')}` : ''}
  </p>
  <a class="lead-more" href="/${post.slug}">Read the piece <span aria-hidden="true">&rarr;</span></a>
</article>`;

  const indexRow = (post, i) => `
<li class="entry">
  <span class="entry-num">${String(i + 1).padStart(2, '0')}</span>
  <div class="entry-body">
    <h3 class="entry-title"><a href="/${post.slug}">${post.title}</a></h3>
    <p class="entry-excerpt">${post.excerpt || ''}</p>
    <p class="entry-meta">
      <time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>
      ${post.tags && post.tags.length ? `<span class="sep">&middot;</span>${post.tags.map(t => `<a href="/tag-${slugify(t)}" class="tag">${t}</a>`).join('')}` : ''}
    </p>
  </div>
</li>`;

  const indexTemplate = (posts, tags, years, title = null, activeTag = null, activeYear = null) => {
    const isArchive = Boolean(title);
    const [first, ...rest] = posts;
    const list = isArchive ? posts : rest;
    return `
${masthead(isArchive ? 'compact' : 'full')}
${isArchive
  ? `<div class="archive-head"><p class="archive-kicker">Filed under</p><h2 class="archive-title">${title}</h2><p class="archive-count">${posts.length} ${posts.length === 1 ? 'piece' : 'pieces'}</p></div>`
  : (first ? lead(first) : '')}
<div class="sheet">
  <main class="column">
    <h2 class="column-head"><span>${isArchive ? 'The pieces' : 'More from the journal'}</span></h2>
    <ol class="entries">
      ${list.map(indexRow).join('')}
    </ol>
    ${list.length === 0 ? '<p class="empty">Nothing filed here yet.</p>' : ''}
  </main>
  ${rail(tags, years, activeTag, activeYear)}
</div>`;
  };

  const postTemplate = (post, tags, years) => `
${masthead('compact')}
<div class="sheet sheet-article">
  <article class="post">
    <header class="post-head">
      <p class="post-kicker">${post.tags && post.tags.length ? post.tags[0] : 'Journal'}</p>
      <h1 class="post-title">${post.title}</h1>
      <p class="post-standfirst">${esc(post.excerpt || '')}</p>
      <p class="post-meta">
        <span class="byline">By ${esc(SITE.author)}</span>
        <span class="sep">&mdash;</span>
        <time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>
        ${post.tags && post.tags.length ? `<span class="sep">&mdash;</span>${post.tags.map(t => `<a href="/tag-${slugify(t)}">${t}</a>`).join(', ')}` : ''}
      </p>
    </header>
    <div class="post-content">
      ${post.content}
    </div>
    <div class="post-end">&#10087;</div>
    ${shareTemplate(post)}
    <a href="/" class="back-link">&larr; Back to the journal</a>
  </article>
  ${rail(tags, years, null, null)}
</div>
${shareScript}`;

  const aboutTemplate = `
${masthead('compact')}
<div class="sheet sheet-single">
  <article class="post">
    <header class="post-head">
      <p class="post-kicker">Colophon</p>
      <h1 class="post-title">About</h1>
      <p class="post-standfirst">A curious soul navigating the intersection of code and cosmos.</p>
    </header>
    <div class="post-content">
      <p>Hello, I&rsquo;m <strong>Divyanshu</strong> &mdash; a curious soul navigating the intersection of code and cosmos.</p>
      <p>By day, I solve problems with programming. By night, I ponder the deeper questions that code can&rsquo;t quite answer. This corner of the internet is where I share my thoughts, learnings, and occasional musings on life, technology, and everything in between.</p>
      <p>I believe in the power of writing to clarify thought, and in sharing ideas openly. Whether it&rsquo;s a technical deep-dive, a philosophical tangent, or just a reflection on something I&rsquo;ve learned &mdash; you&rsquo;ll find it here.</p>
      <hr>
      <p class="find-me">Find me elsewhere</p>
      <div class="social-links">
        <a href="https://github.com/newts7">GitHub</a>
        <a href="https://www.linkedin.com/in/imnewts/">LinkedIn</a>
        <a href="https://x.com/__newts">X</a>
      </div>
    </div>
  </article>
</div>`;

  const notFoundTemplate = `
${masthead('compact')}
<div class="sheet sheet-single">
  <article class="post">
    <header class="post-head">
      <p class="post-kicker">Error 404</p>
      <h1 class="post-title">Page not found</h1>
    </header>
    <div class="post-content">
      <p>The page you&rsquo;re looking for doesn&rsquo;t exist &mdash; it may have been moved, or never existed at all.</p>
      <p><a href="/">Head back to the journal</a> and find something worth reading.</p>
    </div>
  </article>
</div>`;

  return {
    bodyClass: 'theme-press',
    head: `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..700&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&family=IBM+Plex+Mono:wght@400;500&display=swap">`,
    shell: (content) => `<div class="paper">
    <div class="container">
      ${content}
    </div>
    <footer class="colophon">
      <div class="colophon-rule"></div>
      <p class="footer-text">Written with love &amp; curiosity</p>
      <p class="footer-quote">&ldquo;A tiny dot in the cosmos, programming when not doing philosophy&rdquo;</p>
      <p class="footer-meta">&copy; ${new Date().getFullYear()} ${esc(SITE.author)} &middot; <a href="/feed.xml">RSS</a></p>
    </footer>
  </div>`,
    indexTemplate,
    postTemplate,
    aboutTemplate,
    notFoundTemplate,
  };
}
