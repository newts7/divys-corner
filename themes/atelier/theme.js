// Theme: "Atelier" — modern minimal, product-grade.
// Reference points: Josh Comeau, Lee Robinson, Brian Lovin, Linear's marketing site.
// Light-first with a real dark toggle, big confident sans type, a card grid index,
// sticky reading header, and restrained motion.

export function createTheme(ctx) {
  const { SITE, esc, formatDate, isoDate, slugify, shareTemplate, shareScript } = ctx;

  const toggle = `
<button class="theme-toggle" id="theme-toggle" type="button" aria-label="Toggle colour theme">
  <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.4v2M12 19.6v2M2.4 12h2M19.6 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/></svg>
  <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.6A8.6 8.6 0 1 1 9.4 3.5a6.9 6.9 0 0 0 11.1 11.1Z"/></svg>
</button>`;

  const nav = (active = 'writing') => `
<header class="nav">
  <div class="nav-inner">
    <a class="logo" href="/">
      <span class="logo-dot"></span>
      <span class="logo-text">Divy&rsquo;s</span>
    </a>
    <nav class="nav-links">
      <a href="/" class="${active === 'writing' ? 'active' : ''}">Writing</a>
      <a href="/about" class="${active === 'about' ? 'active' : ''}">About</a>
      <a href="/feed.xml">RSS</a>
      ${toggle}
    </nav>
  </div>
</header>`;

  const hero = () => `
<section class="hero">
  <p class="eyebrow"><span class="pulse"></span>Personal journal</p>
  <h1 class="hero-title">Notes on building software<br><span class="grad">and thinking clearly.</span></h1>
  <p class="hero-sub">
    I&rsquo;m <strong>Divyanshu</strong> &mdash; an engineer writing about distributed systems,
    cloud economics, the craft of code, and the questions code can&rsquo;t answer.
  </p>
  <div class="hero-actions">
    <a class="btn btn-primary" href="#writing">Read the latest</a>
    <a class="btn" href="/about">About me</a>
  </div>
</section>`;

  const card = (post, i) => `
<article class="card ${i === 0 ? 'card-feature' : ''}">
  <a class="card-link" href="/${post.slug}">
    <div class="card-top">
      <span class="card-date"><time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time></span>
      ${post.tags && post.tags.length ? `<span class="pill">${post.tags[0]}</span>` : ''}
    </div>
    <h3 class="card-title">${post.title}</h3>
    <p class="card-excerpt">${post.excerpt || ''}</p>
    <span class="card-cta">Read <span class="arrow" aria-hidden="true">&rarr;</span></span>
  </a>
</article>`;

  const filters = (tags, years, activeTag, activeYear) => `
<div class="filters">
  <div class="filter-group">
    <span class="filter-label">Topics</span>
    <div class="filter-pills">
      <a href="/" class="pill ${!activeTag && !activeYear ? 'active' : ''}">All</a>
      ${tags.map(t => `<a href="/tag-${t.slug}" class="pill ${activeTag === t.slug ? 'active' : ''}">${t.name} <em>${t.count}</em></a>`).join('')}
    </div>
  </div>
  <div class="filter-group">
    <span class="filter-label">Years</span>
    <div class="filter-pills">
      ${years.map(y => `<a href="/year-${y.year}" class="pill ${activeYear === y.year ? 'active' : ''}">${y.year} <em>${y.count}</em></a>`).join('')}
    </div>
  </div>
</div>`;

  const indexTemplate = (posts, tags, years, title = null, activeTag = null, activeYear = null) => `
${nav('writing')}
${title
  ? `<section class="page-head">
       <p class="eyebrow">Filtered</p>
       <h1 class="page-title">${title}</h1>
       <p class="page-sub">${posts.length} ${posts.length === 1 ? 'post' : 'posts'}</p>
     </section>`
  : hero()}
${filters(tags, years, activeTag, activeYear)}
<main class="wrap" id="writing">
  <div class="section-head">
    <h2 class="section-title">${title ? 'Results' : 'All writing'}</h2>
    <span class="section-count">${posts.length}</span>
  </div>
  <div class="cards">
    ${posts.map(card).join('')}
  </div>
  ${posts.length === 0 ? '<p class="empty">Nothing here yet.</p>' : ''}
</main>`;

  const postTemplate = (post, tags, years) => `
<div class="progress"><span class="progress-bar"></span></div>
${nav()}
<article class="article">
  <header class="article-head">
    <a href="/" class="back-link"><span aria-hidden="true">&larr;</span> All writing</a>
    <h1 class="article-title">${post.title}</h1>
    <p class="article-sub">${esc(post.excerpt || '')}</p>
    <div class="article-meta">
      <span class="avatar">D</span>
      <div class="meta-lines">
        <span class="meta-name">${esc(SITE.author)}</span>
        <span class="meta-detail">
          <time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>
          <span class="dot">&middot;</span>
          <span id="readtime"></span>
        </span>
      </div>
      ${post.tags && post.tags.length ? `<div class="meta-pills">${post.tags.map(t => `<a href="/tag-${slugify(t)}" class="pill">${t}</a>`).join('')}</div>` : ''}
    </div>
  </header>
  <div class="post-content" id="post-content">
    ${post.content}
  </div>
  ${shareTemplate(post)}
  <div class="article-foot">
    <p class="foot-note">Thanks for reading. If this was useful, share it or <a href="https://x.com/__newts">say hello</a>.</p>
    <a class="btn" href="/">&larr; Back to all writing</a>
  </div>
</article>
${shareScript}
<script>
(function () {
  var bar = document.querySelector('.progress-bar');
  var content = document.getElementById('post-content');
  function onScroll() {
    if (!bar || !content) return;
    var h = content.offsetHeight - window.innerHeight;
    var p = h > 0 ? (window.scrollY - content.offsetTop) / h : 0;
    bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var rt = document.getElementById('readtime');
  if (rt && content) {
    var words = content.innerText.trim().split(/\\s+/).length;
    rt.textContent = Math.max(1, Math.round(words / 220)) + ' min read';
  }
})();
</script>`;

  const aboutTemplate = `
${nav('about')}
<article class="article">
  <header class="article-head">
    <a href="/" class="back-link"><span aria-hidden="true">&larr;</span> All writing</a>
    <h1 class="article-title">About</h1>
    <p class="article-sub">A curious soul navigating the intersection of code and cosmos.</p>
  </header>
  <div class="post-content">
    <p>Hello, I&rsquo;m <strong>Divyanshu</strong> &mdash; a curious soul navigating the intersection of code and cosmos.</p>
    <p>By day, I solve problems with programming. By night, I ponder the deeper questions that code can&rsquo;t quite answer. This corner of the internet is where I share my thoughts, learnings, and occasional musings on life, technology, and everything in between.</p>
    <p>I believe in the power of writing to clarify thought, and in sharing ideas openly. Whether it&rsquo;s a technical deep-dive, a philosophical tangent, or just a reflection on something I&rsquo;ve learned &mdash; you&rsquo;ll find it here.</p>
  </div>
  <div class="article-foot">
    <p class="foot-note">Find me elsewhere</p>
    <div class="social-links">
      <a href="https://github.com/newts7" class="btn">GitHub</a>
      <a href="https://www.linkedin.com/in/imnewts/" class="btn">LinkedIn</a>
      <a href="https://x.com/__newts" class="btn">X</a>
    </div>
  </div>
</article>`;

  const notFoundTemplate = `
${nav()}
<article class="article">
  <header class="article-head">
    <p class="eyebrow">Error 404</p>
    <h1 class="article-title">Page not found</h1>
    <p class="article-sub">This page doesn&rsquo;t exist &mdash; it may have moved, or never existed at all.</p>
  </header>
  <div class="article-foot">
    <a class="btn btn-primary" href="/">Back to all writing</a>
  </div>
</article>`;

  return {
    bodyClass: 'theme-atelier',
    head: `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap">
  <script>
    // Set the theme before first paint so there is no flash of the wrong palette.
    (function () {
      try {
        var saved = localStorage.getItem('divys-theme');
        var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (dark) document.documentElement.setAttribute('data-theme', 'dark');
      } catch (e) {}
    })();
  </script>`,
    shell: (content) => `<div class="glow" aria-hidden="true"></div>
  <div class="container">
    ${content}
    <footer class="foot">
      <div class="foot-inner">
        <div>
          <p class="footer-text">Written with love &amp; curiosity</p>
          <p class="footer-quote">&ldquo;A tiny dot in the cosmos, programming when not doing philosophy&rdquo;</p>
        </div>
        <div class="foot-links">
          <a href="/">Writing</a>
          <a href="/about">About</a>
          <a href="/feed.xml">RSS</a>
          <a href="https://github.com/newts7">GitHub</a>
        </div>
      </div>
      <p class="footer-meta">&copy; ${new Date().getFullYear()} ${esc(SITE.author)}</p>
    </footer>
  </div>`,
    bodyEnd: `
  <script>
    (function () {
      var btn = document.getElementById('theme-toggle');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var dark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (dark) document.documentElement.removeAttribute('data-theme');
        else document.documentElement.setAttribute('data-theme', 'dark');
        try { localStorage.setItem('divys-theme', dark ? 'light' : 'dark'); } catch (e) {}
      });
    })();
  </script>`,
    indexTemplate,
    postTemplate,
    aboutTemplate,
    notFoundTemplate,
  };
}
