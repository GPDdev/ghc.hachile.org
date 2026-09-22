const app = document.querySelector('#app');
const dialog = document.querySelector('#search-dialog');
const searchInput = document.querySelector('#search-input');
const searchResults = document.querySelector('#search-results');
const themeToggle = document.querySelector('#theme-toggle');
let archive;
let eventArchive;

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const entryUrl = (entry) => `#/entry/${encodeURIComponent(entry.slug)}`;
const eventUrl = (event) => `#/event/${encodeURIComponent(event.id)}`;
const confidenceClass = (confidence) => ({ 正史: 'verified', 较可信: 'likely', 有争议: 'disputed', 待考: 'unverified' })[confidence] || 'note';
const confidenceBadge = (item) => `<span class="confidence ${confidenceClass(item.confidence)}">${escapeHtml(item.confidence)}</span>`;
const formatDate = (date) => new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(`${date}T00:00:00+08:00`));

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
  const dark = theme === 'dark' || theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches;
  themeToggle.textContent = dark ? '☀' : '☾';
  themeToggle.setAttribute('aria-label', dark ? '切换到亮色模式' : '切换到暗色模式');
  document.querySelector('meta[name="theme-color"]').content = dark ? '#16131a' : '#f4f0e8';
}

themeToggle.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme === 'dark'
    || document.documentElement.dataset.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(dark ? 'light' : 'dark');
});
setTheme(document.documentElement.dataset.theme || 'auto');

function entryCard(entry, className = 'archive-card') {
  return `<a class="${className}" href="${entryUrl(entry)}">
    <span class="card-top">${confidenceBadge(entry)}<span>${escapeHtml(entry.label)}</span></span>
    <h3>${escapeHtml(entry.title)}</h3>
    <p>${escapeHtml(entry.summary)}</p>
    <span class="card-foot">${entry.year ? `${entry.year}年` : '站务'} <b aria-hidden="true">→</b></span>
  </a>`;
}

function eventCard(event) {
  return `<article class="event-card">
    <time datetime="${event.date}"><strong>${event.date.slice(8)}</strong><span>${event.date.slice(0, 7)}</span></time>
    <div>
      <div class="event-meta">${confidenceBadge(event)}<span>${escapeHtml(event.category)}</span></div>
      <h3><a href="${eventUrl(event)}">${escapeHtml(event.title)}</a></h3>
      ${event.summary ? `<p>${escapeHtml(event.summary)}</p>` : ''}
    </div>
    <a class="event-arrow" href="${eventUrl(event)}" aria-label="查看${escapeHtml(event.title)}">→</a>
  </article>`;
}

function renderHome() {
  const entries = archive.entries.filter((entry) => entry.year);
  const wild = entries.filter((entry) => entry.kind === '校园野史' || entry.kind === '轶事');
  const milestones = archive.timeline.map((slug) => archive.entries.find((entry) => entry.slug === slug));
  const featured = archive.featured.map((slug) => archive.entries.find((entry) => entry.slug === slug));
  const categoryCounts = Object.entries(eventArchive.events.reduce((counts, event) => {
    counts[event.category] = (counts[event.category] || 0) + 1;
    return counts;
  }, {})).sort((a, b) => b[1] - a[1]);

  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <div class="eyebrow">同济大学 · 国豪书院 · 民间资料站</div>
        <h1>国豪<span>野史</span></h1>
        <p>独立于官方，兼收史实、人物与校园轶事。凡述必溯源，每条记录标注置信度。</p>
        <div class="hero-actions">
          <a class="button primary" href="#/archive">浏览 ${eventArchive.count} 条官方事件</a>
          <a class="button" href="#/wild">翻阅校园野史</a>
        </div>
      </div>
      <img class="hero-mark" src="favicon.png" alt="国豪书院手写标识">
    </section>

    <section class="stats" aria-label="站点统计">
      <div><strong>${eventArchive.count}</strong><span>官网事件</span></div>
      <div><strong>${entries.length}</strong><span>专题条目</span></div>
      <div><strong>${wild.length}</strong><span>野史卷宗</span></div>
      <div><strong>4</strong><span>置信等级</span></div>
    </section>

    <section class="section">
      <div class="section-head"><div><span class="kicker">START HERE</span><h2>从这里开始</h2></div><p>四份短卷，认识书院、空间、毕业传统和未来技术班。</p></div>
      <div class="feature-grid">${featured.map((entry, index) => entryCard(entry, `feature-card feature-${index + 1}`)).join('')}</div>
    </section>

    <section class="section timeline-section">
      <div class="section-head"><div><span class="kicker">MILESTONES</span><h2>主要时间线</h2></div><p>时间线只保留改变书院形态的节点。日常活动全部进入事件库。</p></div>
      <div class="timeline">${milestones.map((entry) => `
        <a class="milestone" href="${entryUrl(entry)}">
          <time>${entry.year}</time><span class="timeline-dot"></span>
          <div>${confidenceBadge(entry)}<h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.summary)}</p></div>
        </a>`).join('')}</div>
    </section>

    <section class="section browse-section">
      <div class="section-head"><div><span class="kicker">BROWSE</span><h2>换一种方式逛</h2></div><a class="text-link" href="#/archive">打开完整事件库 →</a></div>
      <div class="topic-grid">${categoryCounts.map(([category, count]) => `<a href="#/archive?category=${encodeURIComponent(category)}"><strong>${escapeHtml(category)}</strong><span>${count} 条</span></a>`).join('')}</div>
    </section>

    <section class="section wild-section">
      <div class="section-head"><div><span class="kicker">WILD FILES</span><h2>校园野史</h2></div><p>外号、谐音梗、草坪歌会与一栋楼的生活史；有趣，但不牺牲可核验性。</p></div>
      <div class="archive-grid">${wild.slice(0, 6).map((entry) => entryCard(entry)).join('')}</div>
      <p class="section-more"><a class="button ink" href="#/wild">查看全部野史卷宗</a></p>
    </section>

    <section class="principle">
      <span class="kicker">EDITORIAL PRINCIPLE</span>
      <blockquote>“野史”可以有趣，事实必须有据。</blockquote>
      <p>正史、较可信、有争议、待考——让读者知道一段历史究竟站在什么证据上。</p>
    </section>`;
  document.title = '国豪野史｜国豪书院民间资料站';
}

function renderArchive() {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const years = [...new Set(eventArchive.events.map((event) => event.date.slice(0, 4)))].sort((a, b) => b - a);
  const categories = [...new Set(eventArchive.events.map((event) => event.category))].sort();
  app.innerHTML = `
    <div class="page-head"><span class="kicker">OFFICIAL EVENT INDEX</span><h1>书院事件库</h1><p>收录国豪书院官网“书院动态”全部 ${eventArchive.count} 条公开记录。这里只保存标题、日期、分类和来源链接，原文版权归发布者。</p></div>
    <section class="archive-shell">
      <div class="filters">
        <label>关键词<input id="archive-query" type="search" placeholder="搜索标题或摘要"></label>
        <label>年份<select id="archive-year"><option value="">全部年份</option>${years.map((year) => `<option>${year}</option>`).join('')}</select></label>
        <label>主题<select id="archive-category"><option value="">全部主题</option>${categories.map((category) => `<option${params.get('category') === category ? ' selected' : ''}>${escapeHtml(category)}</option>`).join('')}</select></label>
      </div>
      <div class="archive-summary" id="archive-summary"></div>
      <div class="event-list" id="event-list"></div>
      <p class="load-more-wrap" id="load-more-wrap"></p>
    </section>`;

  const query = document.querySelector('#archive-query');
  const year = document.querySelector('#archive-year');
  const category = document.querySelector('#archive-category');
  const list = document.querySelector('#event-list');
  const summary = document.querySelector('#archive-summary');
  const moreWrap = document.querySelector('#load-more-wrap');
  let limit = 40;

  const draw = () => {
    const needle = query.value.trim().toLocaleLowerCase('zh-CN');
    const filtered = eventArchive.events.filter((event) => (!needle || `${event.title} ${event.summary} ${event.category}`.toLocaleLowerCase('zh-CN').includes(needle))
      && (!year.value || event.date.startsWith(year.value))
      && (!category.value || event.category === category.value));
    summary.innerHTML = `找到 <strong>${filtered.length}</strong> 条记录 · 数据同步于 ${eventArchive.updated}`;
    list.innerHTML = filtered.slice(0, limit).map(eventCard).join('') || '<div class="empty-state">没有符合条件的事件。</div>';
    moreWrap.innerHTML = filtered.length > limit ? `<button class="button ink" id="load-more" type="button">再显示 ${Math.min(40, filtered.length - limit)} 条</button>` : '';
    document.querySelector('#load-more')?.addEventListener('click', () => { limit += 40; draw(); });
  };
  [query, year, category].forEach((control) => control.addEventListener('input', () => { limit = 40; draw(); }));
  draw();
  document.title = '书院事件库｜国豪野史';
}

function renderWild() {
  const entries = archive.entries.filter((entry) => entry.kind === '校园野史' || entry.kind === '轶事');
  app.innerHTML = `
    <div class="page-head"><span class="kicker">WILD FILES</span><h1>野史卷宗</h1><p>记录制度文件不会写下的校园语言、空间记忆和日常故事。每篇仍标明来源与置信度。</p></div>
    <section class="archive-shell">
      <div class="confidence-legend">
        <span>${confidenceBadge({ confidence: '正史' })} 官方材料可核验</span>
        <span>${confidenceBadge({ confidence: '较可信' })} 有公开记录但细节有限</span>
        <span>${confidenceBadge({ confidence: '有争议' })} 口径或解释存在分歧</span>
        <span>${confidenceBadge({ confidence: '待考' })} 仅作线索，不当作事实</span>
      </div>
      <div class="archive-grid large">${entries.map((entry) => entryCard(entry)).join('')}</div>
    </section>`;
  document.title = '野史卷宗｜国豪野史';
}

function renderEntry(slug) {
  const entry = archive.entries.find((item) => item.slug === slug);
  if (!entry) return renderNotFound();
  const sources = entry.sources.length ? `<section class="sources"><h2>参考资料</h2><ol>${entry.sources.map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a><span>${escapeHtml(source.publisher)}</span></li>`).join('')}</ol></section>` : '';
  const related = archive.entries.filter((item) => item.slug !== entry.slug && item.year && item.categories.some((category) => entry.categories.includes(category))).slice(0, 4);
  app.innerHTML = `
    <div class="article-wrap">
      <div class="breadcrumbs"><a href="#/">总目</a><span>/</span>${escapeHtml(entry.label)}</div>
      <div class="article-layout">
        <article>
          <header class="article-head">
            <div class="article-meta">${confidenceBadge(entry)}<span class="kind">${escapeHtml(entry.kind)}</span>${entry.year ? `<time>${entry.year}年</time>` : ''}</div>
            <span class="kicker">${escapeHtml(entry.label)}</span>
            <h1>${escapeHtml(entry.title)}</h1>
            <p>${escapeHtml(entry.summary)}</p>
          </header>
          ${entry.sections.map((section) => `<section class="article-section"><h2>${escapeHtml(section.title)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`).join('')}
          ${sources}
        </article>
        <aside class="article-aside">
          <div class="aside-box confidence-box"><span class="aside-label">史料置信度</span>${confidenceBadge(entry)}<p>${escapeHtml(entry.confidenceNote)}</p></div>
          ${entry.categories.length ? `<div class="aside-box"><span class="aside-label">主题</span><p>${entry.categories.map(escapeHtml).join(' · ')}</p></div>` : ''}
          ${related.length ? `<div class="aside-box"><span class="aside-label">继续翻阅</span><ul>${related.map((item) => `<li><a href="${entryUrl(item)}">${escapeHtml(item.title)}</a></li>`).join('')}</ul></div>` : ''}
        </aside>
      </div>
    </div>`;
  document.title = `${entry.title}｜国豪野史`;
}

function renderEvent(id) {
  const event = eventArchive.events.find((item) => item.id === id);
  if (!event) return renderNotFound();
  const related = eventArchive.events.filter((item) => item.id !== event.id && item.category === event.category).slice(0, 5);
  app.innerHTML = `
    <div class="article-wrap event-page">
      <div class="breadcrumbs"><a href="#/">总目</a><span>/</span><a href="#/archive">事件库</a><span>/</span>${escapeHtml(event.category)}</div>
      <div class="article-layout">
        <article>
          <header class="article-head">
            <div class="article-meta">${confidenceBadge(event)}<span class="kind">官网事件</span><time datetime="${event.date}">${formatDate(event.date)}</time></div>
            <span class="kicker">${escapeHtml(event.category)}</span>
            <h1>${escapeHtml(event.title)}</h1>
            <p>${escapeHtml(event.summary || '官网索引未提供摘要；请前往原文查看完整报道。')}</p>
          </header>
          <section class="article-section"><h2>记录说明</h2><p>此条目来自国豪书院官网“书院动态”索引。本站保存最小必要的书目资料，并链接至发布者原文，不复制完整报道。</p></section>
          <section class="sources"><h2>原始来源</h2><ol><li><a href="${escapeHtml(event.source)}" target="_blank" rel="noreferrer">查看官方原文</a><span>同济大学国豪书院，${formatDate(event.date)}</span></li></ol></section>
        </article>
        <aside class="article-aside">
          <div class="aside-box confidence-box"><span class="aside-label">史料置信度</span>${confidenceBadge(event)}<p>由国豪书院官网公开索引收录。</p></div>
          <div class="aside-box"><span class="aside-label">同类事件</span><ul>${related.map((item) => `<li><a href="${eventUrl(item)}">${escapeHtml(item.title)}</a></li>`).join('')}</ul></div>
        </aside>
      </div>
    </div>`;
  document.title = `${event.title}｜国豪野史`;
}

function renderNotFound() {
  app.innerHTML = `<div class="not-found"><strong>404</strong><h1>这页院史还没写</h1><p>它可能被移动了，也可能正等着有人记录。</p><a class="button ink" href="#/">返回总目</a></div>`;
  document.title = '未找到条目｜国豪野史';
}

function route() {
  const entryMatch = location.hash.match(/^#\/entry\/([^/?]+)/);
  const eventMatch = location.hash.match(/^#\/event\/([^/?]+)/);
  if (entryMatch) renderEntry(decodeURIComponent(entryMatch[1]));
  else if (eventMatch) renderEvent(decodeURIComponent(eventMatch[1]));
  else if (location.hash.startsWith('#/archive')) renderArchive();
  else if (location.hash.startsWith('#/wild')) renderWild();
  else renderHome();
  window.scrollTo(0, 0);
  app.focus({ preventScroll: true });
}

function renderSearch(query = '') {
  const normalized = query.trim().toLocaleLowerCase('zh-CN');
  const entryMatches = archive.entries.filter((entry) => entry.year && (!normalized || [entry.title, entry.summary, entry.label, ...entry.categories].join(' ').toLocaleLowerCase('zh-CN').includes(normalized))).slice(0, normalized ? 8 : 4);
  const eventMatches = eventArchive.events.filter((event) => !normalized || [event.title, event.summary, event.category, event.date].join(' ').toLocaleLowerCase('zh-CN').includes(normalized)).slice(0, normalized ? 8 : 4);
  const results = [
    ...entryMatches.map((entry) => ({ title: entry.title, summary: entry.summary, href: entryUrl(entry), meta: `${entry.confidence} · 专题` })),
    ...eventMatches.map((event) => ({ title: event.title, summary: event.summary || formatDate(event.date), href: eventUrl(event), meta: `正史 · ${event.category}` })),
  ].slice(0, 12);
  searchResults.innerHTML = results.length ? results.map((result) => `<a class="search-result" href="${result.href}"><span>${escapeHtml(result.meta)}</span><strong>${escapeHtml(result.title)}</strong><small>${escapeHtml(result.summary)}</small></a>`).join('') : '<div class="empty-state">没有找到相关记录。</div>';
}

function openSearch() {
  renderSearch();
  dialog.showModal();
  requestAnimationFrame(() => searchInput.focus());
}

document.querySelector('#open-search').addEventListener('click', openSearch);
searchInput.addEventListener('input', () => renderSearch(searchInput.value));
searchResults.addEventListener('click', () => dialog.close());
window.addEventListener('hashchange', route);
window.addEventListener('keydown', (event) => {
  if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') || (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName))) {
    event.preventDefault();
    if (!dialog.open) openSearch();
  }
});

Promise.all(['data.json', 'events.json'].map((url) => fetch(url).then((response) => {
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}))).then(([data, events]) => {
  archive = data;
  eventArchive = events;
  route();
}).catch(() => {
  app.innerHTML = '<div class="not-found"><strong>!</strong><h1>院史暂时打不开</h1><p>请稍后刷新页面重试。</p></div>';
});
