const fs = require('fs');
const path = require('path');

const CHAPTERS_DATA = require('./chapters.js');
const docsDir = path.join(__dirname, 'docs');

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Strip HTML tags for clean Markdown export
function htmlToMarkdown(html) {
  let md = html;
  // Replace headings
  md = md.replace(/<h2>(.*?)<\/h2>/g, '\n## $1\n');
  md = md.replace(/<h3>(.*?)<\/h3>/g, '\n### $1\n');
  // Replace callouts
  md = md.replace(/<div class="callout callout-(\w+)">([\s\S]*?)<\/div>/g, (m, type, content) => {
    const alertType = type === 'warning' ? 'WARNING' : type === 'tip' ? 'TIP' : 'NOTE';
    const cleanContent = content.replace(/<[^>]+>/g, '').trim().split('\n').map(l => `> ${l.trim()}`).join('\n');
    return `\n> [!${alertType}]\n${cleanContent}\n`;
  });
  // Replace paragraphs
  md = md.replace(/<p>([\s\S]*?)<\/p>/g, '\n$1\n');
  // Replace lists
  md = md.replace(/<ul>([\s\S]*?)<\/ul>/g, '$1');
  md = md.replace(/<ol>([\s\S]*?)<\/ol>/g, '$1');
  md = md.replace(/<li>(.*?)<\/li>/g, '- $1');
  // Replace emphasis
  md = md.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/g, '*$1*');
  // Replace links
  md = md.replace(/<a href="(.*?)"[^>]*>(.*?)<\/a>/g, '[$2]($1)');
  // Strip remaining tags
  md = md.replace(/<table[\s\S]*?<\/table>/g, (tableHtml) => {
    // Basic table parser
    const rows = [];
    const rowMatches = tableHtml.match(/<tr>[\s\S]*?<\/tr>/g) || [];
    rowMatches.forEach((row, rIdx) => {
      const cells = [];
      const cellMatches = row.match(/<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/g) || [];
      cellMatches.forEach(c => {
        let text = c.replace(/<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/, '$1');
        text = text.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').trim();
        cells.push(text);
      });
      rows.push(cells);
    });
    if (rows.length === 0) return '';
    let tableMd = '\n| ' + rows[0].join(' | ') + ' |\n';
    tableMd += '| ' + rows[0].map(() => '---').join(' | ') + ' |\n';
    for (let i = 1; i < rows.length; i++) {
      tableMd += '| ' + rows[i].join(' | ') + ' |\n';
    }
    return tableMd + '\n';
  });
  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/\n{3,}/g, '\n\n').trim();
  return md;
}

CHAPTERS_DATA.forEach((ch, idx) => {
  const prevCh = idx > 0 ? CHAPTERS_DATA[idx - 1] : null;
  const nextCh = idx < CHAPTERS_DATA.length - 1 ? CHAPTERS_DATA[idx + 1] : null;
  const htmlFilename = `${ch.num}_${ch.slug}.html`;
  const mdFilename = `${ch.num}_${ch.slug}.md`;

  // 1. Generate HTML file
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ch.title.en} | Fishing in Finland</title>
  <meta name="description" content="${ch.subtitle.en}">
  <link rel="stylesheet" href="../styles.css?v=20260912">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎣</text></svg>">
</head>
<body>

  <div class="wrap">
    <!-- Top Navigation -->
    <nav class="top-nav" aria-label="Breadcrumb Navigation">
      <a href="../index.html" class="brand-badge">
        <span>←</span>
        <span>Guide Index</span>
      </a>

      <div class="top-controls">
        <div class="lang-switcher" role="group" aria-label="Language Mode">
          <button class="lang-btn active" data-mode="dual">Dual</button>
          <button class="lang-btn" data-mode="en">English</button>
          <button class="lang-btn" data-mode="zh">中文</button>
          <button class="lang-btn" data-mode="fi">Suomi</button>
        </div>
        <button id="theme-toggle-btn" class="theme-btn" title="Toggle Theme" aria-label="Toggle Theme">🌙</button>
      </div>
    </nav>

    <!-- Chapter Header -->
    <header class="chapter-header">
      <span class="chapter-num">Chapter ${ch.num} • ${ch.icon} • ${ch.readTime}</span>
      <h1 id="chapter-title" class="chapter-title">
        <div>${ch.title.en}</div>
        <div style="font-size: 0.78em; color: var(--muted); font-weight: 500; margin-top: 0.25rem;">${ch.title.zh}</div>
      </h1>
      <p id="chapter-subtitle" class="chapter-subtitle">
        <div>${ch.subtitle.en}</div>
        <div style="font-size: 0.9em; margin-top: 0.25rem;">${ch.subtitle.zh}</div>
      </p>
    </header>

    <!-- Chapter Content Body -->
    <main id="chapter-body">
      <div class="dual-container">
        <div class="dual-lang-block">
          <span class="dual-lang-label">🇬🇧 English</span>
          <div class="content">${ch.content.en}</div>
        </div>
        <div class="dual-lang-block">
          <span class="dual-lang-label">🇨🇳 中文</span>
          <div class="content">${ch.content.zh}</div>
        </div>
      </div>
    </main>

    <!-- Prev / Next Navigation -->
    <nav class="doc-nav-bar" aria-label="Chapter Pagination">
      ${prevCh ? `<a href="${prevCh.num}_${prevCh.slug}.html" class="doc-nav-link">← ${prevCh.num}. ${prevCh.title.en}</a>` : '<span></span>'}
      ${nextCh ? `<a href="${nextCh.num}_${nextCh.slug}.html" class="doc-nav-link">${nextCh.num}. ${nextCh.title.en} →</a>` : '<span></span>'}
    </nav>

    <!-- Footer -->
    <footer class="site-footer">
      <h3 class="footer-ecosystem-title">Living Field Guides & Philosophy Ecosystem</h3>
      <ul class="footer-links">
        <li>🌌 <a href="https://powerpig99.github.io/not-a-toe/" target="_blank" rel="noopener"><strong>Not a ToE (Author Blog)</strong> — First-person living philosophy & ontological clarity</a></li>
        <li>🍄 <a href="https://powerpig99.github.io/helsinki-mushroom-guide/" target="_blank" rel="noopener"><strong>Helsinki Wild Mushroom Guide</strong> — Trilingual foraging, 22 species, HSL spots & recipes</a></li>
        <li>🌲 <a href="https://powerpig99.github.io/hunting-in-finland/" target="_blank" rel="noopener"><strong>Hunting in Finland: Resident Field Guide</strong> — Game management, exams, firearms & public forests</a></li>
        <li>🎹 <a href="https://powerpig99.github.io/adult-piano-guide/" target="_blank" rel="noopener"><strong>The Adult Piano Companion</strong> — Self-directed adult piano mastery</a></li>
      </ul>
      <div class="footer-meta">
        <p><a href="../index.html">← Back to Complete Fishing in Finland Handbook</a></p>
      </div>
    </footer>
  </div>

  <script>
    (function () {
      const chapter = ${JSON.stringify(ch)};
      let currentMode = localStorage.getItem('fishing_lang_mode') || 'dual';
      let currentTheme = localStorage.getItem('fishing_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

      const htmlEl = document.documentElement;
      const titleEl = document.getElementById('chapter-title');
      const subEl = document.getElementById('chapter-subtitle');
      const bodyEl = document.getElementById('chapter-body');
      const langBtns = document.querySelectorAll('.lang-btn');
      const themeBtn = document.getElementById('theme-toggle-btn');

      function initTheme() {
        htmlEl.setAttribute('data-theme', currentTheme);
        if (themeBtn) themeBtn.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
      }

      function toggleTheme() {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', currentTheme);
        localStorage.setItem('fishing_theme', currentTheme);
        if (themeBtn) themeBtn.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
      }

      function updateLanguage(mode) {
        currentMode = mode;
        localStorage.setItem('fishing_lang_mode', mode);

        langBtns.forEach(btn => {
          if (btn.dataset.mode === mode) btn.classList.add('active');
          else btn.classList.remove('active');
        });

        if (mode === 'dual') {
          titleEl.innerHTML = '<div>' + chapter.title.en + '</div><div style="font-size: 0.78em; color: var(--muted); font-weight: 500; margin-top: 0.25rem;">' + chapter.title.zh + '</div>';
          subEl.innerHTML = '<div>' + chapter.subtitle.en + '</div><div style="font-size: 0.9em; margin-top: 0.25rem;">' + chapter.subtitle.zh + '</div>';
          bodyEl.innerHTML = '<div class="dual-container"><div class="dual-lang-block"><span class="dual-lang-label">🇬🇧 English</span><div class="content">' + chapter.content.en + '</div></div><div class="dual-lang-block"><span class="dual-lang-label">🇨🇳 中文</span><div class="content">' + chapter.content.zh + '</div></div></div>';
        } else {
          titleEl.innerHTML = chapter.title[mode] || chapter.title.en;
          subEl.innerHTML = chapter.subtitle[mode] || chapter.subtitle.en;
          bodyEl.innerHTML = '<div class="content">' + (chapter.content[mode] || chapter.content.en) + '</div>';
        }
      }

      langBtns.forEach(btn => {
        btn.addEventListener('click', () => updateLanguage(btn.dataset.mode));
      });

      if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

      initTheme();
      updateLanguage(currentMode);
    })();
  </script>
</body>
</html>
`;

  fs.writeFileSync(path.join(docsDir, htmlFilename), htmlContent, 'utf8');

  // 2. Generate Markdown file
  const mdContent = `# ${ch.title.en}
*${ch.title.zh} • ${ch.title.fi}*

> **Reading Time**: ${ch.readTime}  
> **Sub-topics**: ${ch.subtitle.en}

---

## English Version

${htmlToMarkdown(ch.content.en)}

---

## 中文版 (Chinese Version)

${htmlToMarkdown(ch.content.zh)}

---

## Suomeksi (Finnish Version)

${htmlToMarkdown(ch.content.fi)}

---

## Navigation & Links
- [← Back to Fishing in Finland Guide Index](../README.md)
- Live Web Version: [https://powerpig99.github.io/fishing-in-finland/](https://powerpig99.github.io/fishing-in-finland/)
`;

  fs.writeFileSync(path.join(docsDir, mdFilename), mdContent, 'utf8');
});

console.log(`Generated ${CHAPTERS_DATA.length} HTML documents and ${CHAPTERS_DATA.length} Markdown documents in docs/`);
