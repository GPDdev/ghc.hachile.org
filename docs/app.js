const app = document.querySelector('#app');
const dialog = document.querySelector('#search-dialog');
const searchInput = document.querySelector('#search-input');
const searchResults = document.querySelector('#search-results');
let archive;

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const entryUrl = (entry) => `#/entry/${encodeURIComponent(entry.slug)}`;
const badge = (entry) => `<span class="tag ${entry.kind === '轶事' ? 'story' : ''}">${escapeHtml(entry.kind)}</span>`;

function renderHome() {
  const historical = archive.entries.filter((entry) => entry.year);
  const sourceCount = new Set(historical.flatMap((entry) => entry.sources.map((source) => source.url))).size;
  const years = [...new Set(historical.map((entry) => entry.year))].sort((a, b) => b - a);
  const timeline = years.map((year) => `
    <div class="year-row">
      <div class="year-label">${year}</div>
      <div class="year-entries">
        ${historical.filter((entry) => entry.year === year).map((entry) => `
          <a class="timeline-card" href="${entryUrl(entry)}">
            ${badge(entry)}
            <span><strong>${escapeHtml(entry.title)}</strong><small>${escapeHtml(entry.summary)}</small></span>
            <span class="arrow" aria-hidden="true">→</span>
          </a>`).join('')}
      </div>
    </div>`).join('');

  const featured = archive.featured.map((slug, index) => {
    const entry = archive.entries.find((item) => item.slug === slug);
    return `
      <a class="feature-card" href="${entryUrl(entry)}">
        <span class="number">0${index + 1} · ${escapeHtml(entry.label)}</span>
        <h3>${escapeHtml(entry.title)}</h3>
        <p>${escapeHtml(entry.summary)}</p>
      </a>`;
  }).join('');

  app.innerHTML = `
    <section class="hero">
      <div class="hero-inner">
        <div>
          <div class="eyebrow">Tongji · Guohao College · Since 2022</div>
          <h1>国豪野史</h1>
          <p class="hero-lead">记录国豪书院的正史、轶事与共同记忆。让值得记住的制度、人物和校园瞬间，都有迹可循。</p>
          <div class="hero-actions">
            <a class="button primary" href="#timeline">翻阅编年</a>
            <a class="button" href="#/entry/rules">参与记录</a>
          </div>
        </div>
        <div class="seal" aria-hidden="true">国豪</div>
      </div>
    </section>

    <div class="stats" aria-label="站点统计">
      <div class="stat"><strong>${historical.length}</strong><span>初始条目</span></div>
      <div class="stat"><strong>${years.length}</strong><span>年份切片</span></div>
      <div class="stat"><strong>${sourceCount}</strong><span>公开来源</span></div>
    </div>

    <section class="section" id="timeline">
      <div class="section-head">
        <h2>国豪编年</h2>
        <p>仿照校史编年的阅读方式，从最近的记忆向书院起点回溯。每一条记录都标明证据状态和公开来源。</p>
      </div>
      <div class="timeline">${timeline}</div>
    </section>

    <div class="feature-wrap">
      <section class="section">
        <div class="section-head"><h2>从这里开始</h2><p>理解书院的三个入口：它是什么、从何处来、为何得名。</p></div>
        <div class="feature-grid">${featured}</div>
      </section>
    </div>

    <section class="section principle">
      <div class="eyebrow">OUR EDITORIAL PRINCIPLE</div>
      <blockquote>“野史”可以有趣，事实必须有据。</blockquote>
      <p>未经证实的传闻不写成事实；涉及普通个人时，隐私比猎奇更重要。</p>
    </section>`;
  document.title = '国豪野史｜记录国豪书院的共同记忆';
}

function renderEntry(slug) {
  const entry = archive.entries.find((item) => item.slug === slug);
  if (!entry) return renderNotFound();

  const sections = entry.sections.map((section) => `
    <section class="article-section">
      <h2>${escapeHtml(section.title)}</h2>
      ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
    </section>`).join('');

  const sources = entry.sources.length ? `
    <section class="sources">
      <h2>参考资料</h2>
      <ol>${entry.sources.map((source) => `
        <li><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a>，${escapeHtml(source.publisher)}。</li>`).join('')}
      </ol>
    </section>` : '';

  const related = archive.entries
    .filter((item) => item.slug !== entry.slug && item.year && (item.year === entry.year || item.kind === entry.kind))
    .slice(0, 4);

  app.innerHTML = `
    <div class="article-wrap">
      <div class="breadcrumbs"><a href="#/">首页</a>　/　${escapeHtml(entry.label)}</div>
      <div class="article-layout">
        <article>
          <header class="article-head">
            <div class="article-meta">${badge(entry)}${entry.year ? `<time>${entry.year}年</time>` : ''}</div>
            <div class="eyebrow">${escapeHtml(entry.label)}</div>
            <h1>${escapeHtml(entry.title)}</h1>
            <p class="article-summary">${escapeHtml(entry.summary)}</p>
          </header>
          ${sections}
          ${sources}
        </article>
        <aside class="article-aside">
          <div class="aside-box">
            <strong>史料状态</strong>
            <p>${entry.kind === '正史' ? '有公开、可核验的机构来源。' : entry.kind === '轶事' ? '由公开报道记录的校园故事。' : '站点说明与编辑规则。'}</p>
          </div>
          ${entry.categories.length ? `<div class="aside-box"><strong>分类</strong><p>${entry.categories.map(escapeHtml).join(' · ')}</p></div>` : ''}
          ${related.length ? `<div class="aside-box"><strong>继续翻阅</strong><ul>${related.map((item) => `<li><a href="${entryUrl(item)}">${escapeHtml(item.title)}</a></li>`).join('')}</ul></div>` : ''}
        </aside>
      </div>
    </div>`;
  document.title = `${entry.title}｜国豪野史`;
}

function renderNotFound() {
  app.innerHTML = `<div class="not-found"><strong>404</strong><h1>这页院史还没写</h1><p>它可能被移动了，也可能正等着有人记录。</p><a class="button primary" href="#/">返回编年</a></div>`;
  document.title = '未找到条目｜国豪野史';
}

function route() {
  const match = location.hash.match(/^#\/entry\/([^/?]+)/);
  if (match) renderEntry(decodeURIComponent(match[1]));
  else renderHome();
  window.scrollTo(0, 0);
  app.focus({ preventScroll: true });
}

function renderSearch(query = '') {
  const normalized = query.trim().toLocaleLowerCase('zh-CN');
  const matches = normalized
    ? archive.entries.filter((entry) => [entry.title, entry.summary, entry.label, ...entry.categories]
      .join(' ').toLocaleLowerCase('zh-CN').includes(normalized))
    : archive.entries.filter((entry) => entry.year).slice(0, 6);

  searchResults.innerHTML = matches.length
    ? matches.map((entry) => `<a class="search-result" href="${entryUrl(entry)}"><strong>${escapeHtml(entry.title)}</strong><small>${escapeHtml(entry.summary)}</small></a>`).join('')
    : '<div class="search-empty">没有找到相关条目。</div>';
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
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' || event.key === '/' && document.activeElement.tagName !== 'INPUT') {
    event.preventDefault();
    if (!dialog.open) openSearch();
  }
});

fetch('data.json')
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((data) => {
    archive = data;
    route();
  })
  .catch(() => {
    app.innerHTML = '<div class="not-found"><strong>!</strong><h1>院史暂时打不开</h1><p>请稍后刷新页面重试。</p></div>';
  });

