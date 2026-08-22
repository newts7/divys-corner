// Theme: "Terminal" — dark-first, technical, built for long code-heavy reads.
// Reference points: Vercel/Linear dark UI, gwern-style sidebars, LessWrong's
// dual rails (TOC left / content right), Maxime Heckel's polished dark palette.
// Adds: sticky auto-generated table of contents + reading progress bar.

export function createTheme(ctx) {
  const { SITE, esc, formatDate, isoDate, slugify, shareTemplate, shareScript } = ctx;

  const nav = (active = 'journal') => `
<header class="topbar">
  <a class="brand" href="/">
    <span class="brand-mark">~/</span><span class="brand-name">divys</span><span class="brand-caret">&#9608;</span>
  </a>
  <nav class="topnav">
    <a href="/" class="${active === 'journal' ? 'active' : ''}">journal</a>
    <a href="/about" class="${active === 'about' ? 'active' : ''}">about</a>
    <a href="/feed.xml">rss</a>
  </nav>
</header>`;

  const hero = () => `
<section class="hero">
  <p class="prompt-line"><span class="prompt">$</span> whoami</p>
  <h1 class="hero-title">Divyanshu</h1>
  <p class="hero-desc">
    Engineer. Occasional philosopher. I write about distributed systems, cloud
    economics, the craft of software, and the questions code can&rsquo;t answer.
  </p>
  <div class="hero-tags">
    <span class="chip">programming</span>
    <span class="chip">philosophy</span>
    <span class="chip">life</span>
  </div>
</section>`;

  const rail = (tags, years, activeTag, activeYear) => `
<aside class="rail">
  <section class="rail-section">
    <h3 class="rail-title"><span class="hash">#</span> years</h3>
    <ul class="rail-list">
      ${years.map(y => `<li><a href="/year-${y.year}" class="${activeYear === y.year ? 'active' : ''}"><span>${y.year}</span><em>${String(y.count).padStart(2, '0')}</em></a></li>`).join('')}
    </ul>
  </section>
  <section class="rail-section">
    <h3 class="rail-title"><span class="hash">#</span> topics</h3>
    <ul class="rail-list">
      ${tags.map(t => `<li><a href="/tag-${t.slug}" class="${activeTag === t.slug ? 'active' : ''}"><span>${t.name}</span><em>${String(t.count).padStart(2, '0')}</em></a></li>`).join('')}
    </ul>
  </section>
</aside>`;

  const row = (post, i) => `
<li class="row" style="--i:${i}">
  <a class="row-link" href="/${post.slug}">
    <span class="row-date"><time datetime="${isoDate(post.date)}">${isoDate(post.date)}</time></span>
    <span class="row-main">
      <span class="row-title">${post.title}</span>
      <span class="row-excerpt">${post.excerpt || ''}</span>
      ${post.tags && post.tags.length ? `<span class="row-tags">${post.tags.map(t => `<span class="chip small">${t}</span>`).join('')}</span>` : ''}
    </span>
    <span class="row-arrow" aria-hidden="true">&rarr;</span>
  </a>
</li>`;

  const indexTemplate = (posts, tags, years, title = null, activeTag = null, activeYear = null) => `
${nav('journal')}
${title
  ? `<section class="filter-head">
       <p class="prompt-line"><span class="prompt">$</span> grep -ri "${esc(title)}" ./posts</p>
       <h2 class="filter-title">${title}</h2>
       <p class="filter-count">${posts.length} match${posts.length === 1 ? '' : 'es'}</p>
     </section>`
  : hero()}
<div class="layout">
  <main class="feed">
    <div class="feed-head">
      <span class="feed-label">${title ? 'results' : 'all posts'}</span>
      <span class="feed-count">${String(posts.length).padStart(2, '0')}</span>
    </div>
    <ul class="rows">
      ${posts.map(row).join('')}
    </ul>
    ${posts.length === 0 ? '<p class="empty">// no posts matched</p>' : ''}
  </main>
  ${rail(tags, years, activeTag, activeYear)}
</div>`;

  const postTemplate = (post, tags, years) => `
<div class="progress"><span class="progress-bar"></span></div>
${nav()}
<div class="article-layout">
  <aside class="toc" id="toc">
    <h3 class="rail-title"><span class="hash">#</span> contents</h3>
    <nav class="toc-list" id="toc-list"></nav>
    <div class="toc-foot">
      <a href="/" class="back-link">&larr; all posts</a>
    </div>
  </aside>
  <article class="post">
    <header class="post-head">
      <p class="prompt-line"><span class="prompt">$</span> cat ${esc(post.slug)}.md</p>
      <h1 class="post-title">${post.title}</h1>
      <p class="post-standfirst">${esc(post.excerpt || '')}</p>
      <div class="post-meta">
        <time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>
        <span class="dot">/</span>
        <span class="readtime" id="readtime"></span>
        ${post.tags && post.tags.length ? `<span class="dot">/</span><span class="meta-tags">${post.tags.map(t => `<a href="/tag-${slugify(t)}" class="chip small">${t}</a>`).join('')}</span>` : ''}
      </div>
    </header>
    <div class="post-content" id="post-content">
      ${post.content}
    </div>
    ${shareTemplate(post)}
  </article>
  ${rail(tags, years, null, null)}
</div>
${shareScript}
<script>
(function () {
  // Reading progress
  var bar = document.querySelector('.progress-bar');
  var content = document.getElementById('post-content');
  function onScroll() {
    if (!bar || !content) return;
    var top = content.offsetTop;
    var h = content.offsetHeight - window.innerHeight;
    var p = h > 0 ? (window.scrollY - top) / h : 0;
    bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Read time
  var rt = document.getElementById('readtime');
  if (rt && content) {
    var words = content.innerText.trim().split(/\\s+/).length;
    rt.textContent = Math.max(1, Math.round(words / 220)) + ' min read';
  }

  // Build the table of contents from h2/h3 in the rendered markdown
  var list = document.getElementById('toc-list');
  var heads = content ? content.querySelectorAll('h2, h3') : [];
  if (list && heads.length) {
    var used = {};
    Array.prototype.forEach.call(heads, function (h) {
      if (!h.id) {
        var base = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
        used[base] = (used[base] || 0) + 1;
        h.id = used[base] > 1 ? base + '-' + used[base] : base;
      }
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      a.className = 'toc-link toc-' + h.tagName.toLowerCase();
      list.appendChild(a);
    });
    var links = list.querySelectorAll('.toc-link');
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        Array.prototype.forEach.call(links, function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-10% 0px -75% 0px' });
    Array.prototype.forEach.call(heads, function (h) { obs.observe(h); });
  } else if (list) {
    list.innerHTML = '<span class="toc-empty">// no headings</span>';
  }
})();
</script>`;

  const aboutTemplate = `
${nav('about')}
<div class="single">
  <article class="post">
    <header class="post-head">
      <p class="prompt-line"><span class="prompt">$</span> cat about.md</p>
      <h1 class="post-title">About</h1>
      <p class="post-standfirst">A curious soul navigating the intersection of code and cosmos.</p>
    </header>
    <div class="post-content">
      <p>Hello, I&rsquo;m <strong>Divyanshu</strong> &mdash; a curious soul navigating the intersection of code and cosmos.</p>
      <p>By day, I solve problems with programming. By night, I ponder the deeper questions that code can&rsquo;t quite answer. This corner of the internet is where I share my thoughts, learnings, and occasional musings on life, technology, and everything in between.</p>
      <p>I believe in the power of writing to clarify thought, and in sharing ideas openly. Whether it&rsquo;s a technical deep-dive, a philosophical tangent, or just a reflection on something I&rsquo;ve learned &mdash; you&rsquo;ll find it here.</p>
      <hr>
      <p class="prompt-line"><span class="prompt">$</span> ls ./elsewhere</p>
      <div class="social-links">
        <a href="https://github.com/newts7">github</a>
        <a href="https://www.linkedin.com/in/imnewts/">linkedin</a>
        <a href="https://x.com/__newts">x</a>
      </div>
    </div>
  </article>
</div>`;

  const notFoundTemplate = `
${nav()}
<div class="single">
  <article class="post">
    <header class="post-head">
      <p class="prompt-line"><span class="prompt">$</span> cd /the-void</p>
      <h1 class="post-title">404 &mdash; not found</h1>
    </header>
    <div class="post-content">
      <p><code>Error: no such file or directory</code></p>
      <p>The page you&rsquo;re looking for doesn&rsquo;t exist &mdash; it may have been moved, or never existed at all.</p>
      <p><a href="/">cd ~</a> and find something worth reading.</p>
    </div>
  </article>
</div>`;

  return {
    bodyClass: 'theme-terminal',
    head: `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap">`,
    shell: (content) => `<div class="grid-bg" aria-hidden="true"></div>
  <div class="container">
    ${content}
    <footer class="foot">
      <div class="foot-rule"></div>
      <p class="footer-text"><span class="prompt">$</span> echo "written with love &amp; curiosity"</p>
      <p class="footer-quote">// &ldquo;A tiny dot in the cosmos, programming when not doing philosophy&rdquo;</p>
      <p class="footer-meta">&copy; ${new Date().getFullYear()} ${esc(SITE.author)} &middot; <a href="/feed.xml">rss</a> &middot; <a href="https://github.com/newts7">github</a></p>
    </footer>
  </div>`,
    indexTemplate,
    postTemplate,
    aboutTemplate,
    notFoundTemplate,
  };
}
