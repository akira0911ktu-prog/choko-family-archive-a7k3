/* =====================================================
   チョコの72時間 ── 共通ナビゲーション
   - Topbar (sticky)
   - Article TOC (sidebar desktop / collapsible mobile)
   - Breadcrumb + reading time
   - Prev/next cards (article footer)
   - Scroll reveal + back-to-top
   ===================================================== */
(function(){
  var PAGES = [
    { href: 'index.html',    title: 'マガジン目次',                          short: 'トップ',    isIndex: true },
    { href: 'note.html',     title: '公開用『まだ、諦めないで。』',          short: '★ 公開用', featured: true, time: 15 },
    { href: 'honpen.html',   title: '本編『チョコの72時間』',                short: '本編',      time: 18 },
    { href: 'bouken.html',   title: '別編1『チョコの大冒険』',               short: '別編1',     time: 4  },
    { href: 'kousatsu.html', title: '別編2『あの3日間から学んだこと』',      short: '別編2',     time: 10 },
    { href: 'story.html',    title: '別編3『その人の名前を、まだ知らない』', short: '別編3',     time: 12 }
  ];

  var path = (location.pathname.split('/').pop() || 'index.html');
  if (path === '') path = 'index.html';
  var currentIdx = -1;
  for (var i = 0; i < PAGES.length; i++) {
    if (PAGES[i].href === path) { currentIdx = i; break; }
  }
  var current = PAGES[currentIdx] || PAGES[0];
  var isIndex = current.isIndex === true;

  /* ==== Topbar ==== */
  var topbar = document.createElement('nav');
  topbar.className = 'topbar';
  var linksHtml = '';
  for (var j = 1; j < PAGES.length; j++) {
    var p = PAGES[j];
    var cls = 'topbar-link';
    if (p.featured) cls += ' featured';
    if (p.href === current.href) cls += ' active';
    linksHtml += '<a href="' + p.href + '" class="' + cls + '">' + p.short + '</a>';
  }
  topbar.innerHTML =
    '<div class="topbar-inner">' +
      '<a href="index.html" class="topbar-brand' + (isIndex ? ' active' : '') + '">' +
        '<span class="topbar-brand-mark">72h</span>' +
        '<span class="topbar-brand-text">チョコの72時間</span>' +
      '</a>' +
      '<button class="topbar-toggle" aria-label="メニュー" aria-expanded="false">' +
        '<span></span><span></span><span></span>' +
      '</button>' +
      '<div class="topbar-links">' + linksHtml + '</div>' +
    '</div>';
  document.body.insertBefore(topbar, document.body.firstChild);

  var toggleBtn = topbar.querySelector('.topbar-toggle');
  var linksEl = topbar.querySelector('.topbar-links');
  toggleBtn.addEventListener('click', function(){
    var open = linksEl.classList.toggle('open');
    toggleBtn.classList.toggle('open', open);
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // Close on link click (mobile)
  linksEl.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      linksEl.classList.remove('open');
      toggleBtn.classList.remove('open');
    });
  });

  /* ==== Article-only features ==== */
  var container = document.querySelector('.container');

  if (!isIndex && container) {
    var h2s = container.querySelectorAll('h2');
    var chapters = [];
    h2s.forEach(function(h, k){
      var id = 'ch-' + (k + 1);
      h.id = id;
      chapters.push({ id: id, text: h.textContent.trim() });
    });

    // Reading time (based on text length: ~500字/min JP)
    var txt = container.textContent || '';
    var mins = current.time || Math.max(1, Math.ceil(txt.length / 500));

    // Breadcrumb + reading time (top of container)
    var meta = document.createElement('div');
    meta.className = 'article-meta-bar';
    meta.innerHTML =
      '<div class="breadcrumb">' +
        '<a href="index.html">マガジン目次</a>' +
        '<span class="breadcrumb-sep">›</span>' +
        '<span class="breadcrumb-current">' + current.short + '</span>' +
      '</div>' +
      '<div class="reading-time">📖 約' + mins + '分</div>';
    container.insertBefore(meta, container.firstChild);

    // Sidebar TOC (if 3+ chapters)
    if (chapters.length >= 3) {
      var toc = document.createElement('aside');
      toc.className = 'article-toc';
      var liHtml = '';
      for (var c = 0; c < chapters.length; c++) {
        liHtml += '<li><a href="#' + chapters[c].id + '">' + chapters[c].text + '</a></li>';
      }
      toc.innerHTML =
        '<div class="article-toc-header">' +
          '<span class="article-toc-label">目次</span>' +
          '<span class="article-toc-count">' + chapters.length + '章</span>' +
          '<button class="article-toc-toggle" aria-label="開閉">▾</button>' +
        '</div>' +
        '<ol class="article-toc-list">' + liHtml + '</ol>';

      // Insert into container before first h2 (or subtitle end)
      var anchor = container.querySelector('h2');
      if (anchor) container.insertBefore(toc, anchor);
      else container.appendChild(toc);

      var tocToggle = toc.querySelector('.article-toc-toggle');
      tocToggle.addEventListener('click', function(){
        toc.classList.toggle('collapsed');
      });

      // Scrollspy
      if ('IntersectionObserver' in window) {
        var tocLinks = toc.querySelectorAll('a');
        var spy = new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if (entry.isIntersecting) {
              var id = entry.target.id;
              tocLinks.forEach(function(a){
                a.classList.toggle('active', a.getAttribute('href') === '#' + id);
              });
            }
          });
        }, { rootMargin: '-15% 0px -70% 0px' });
        h2s.forEach(function(h){ spy.observe(h); });
      }

      // Close mobile TOC on link tap
      toc.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', function(){
          if (window.innerWidth < 1200) toc.classList.add('collapsed');
        });
      });
    }

    // Article footer (prev/next + back home)
    var prev = PAGES[currentIdx - 1];
    var next = PAGES[currentIdx + 1];
    if (prev && prev.isIndex) prev = null;

    var footer = document.createElement('footer');
    footer.className = 'article-footer';
    var html = '<div class="nav-cards">';
    if (prev) {
      html +=
        '<a href="' + prev.href + '" class="nav-card nav-prev">' +
          '<span class="nav-card-label">← 前の作品</span>' +
          '<span class="nav-card-title">' + prev.title + '</span>' +
          '<span class="nav-card-time">📖 約' + prev.time + '分</span>' +
        '</a>';
    } else {
      html += '<span class="nav-card nav-card-empty"></span>';
    }
    if (next) {
      html +=
        '<a href="' + next.href + '" class="nav-card nav-next">' +
          '<span class="nav-card-label">次の作品 →</span>' +
          '<span class="nav-card-title">' + next.title + '</span>' +
          '<span class="nav-card-time">📖 約' + next.time + '分</span>' +
        '</a>';
    } else {
      html += '<span class="nav-card nav-card-empty"></span>';
    }
    html += '</div>';
    html += '<a href="index.html" class="back-home">↩ マガジン目次へ戻る</a>';
    footer.innerHTML = html;

    var oldNav = document.querySelector('nav.site-nav');
    if (oldNav) oldNav.parentNode.replaceChild(footer, oldNav);
    else document.body.appendChild(footer);
  }

  /* ==== Scroll reveal ==== */
  var revealTargets = document.querySelectorAll('.toc-card, .stats-strip, h2, h3, blockquote, .note-box, .you-box, .action-block, .final-lines, table, .refrain, .nav-card');
  revealTargets.forEach(function(el){ el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function(el){ io.observe(el); });
  } else {
    revealTargets.forEach(function(el){ el.classList.add('visible'); });
  }

  /* ==== Back to top ==== */
  var back = document.querySelector('.back-to-top');
  if (!back) {
    back = document.createElement('button');
    back.className = 'back-to-top';
    back.setAttribute('aria-label', 'トップへ戻る');
    back.innerHTML = '↑';
    document.body.appendChild(back);
  }
  window.addEventListener('scroll', function(){
    if (window.scrollY > 400) back.classList.add('visible');
    else back.classList.remove('visible');
  }, { passive: true });
  back.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
