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
  // Replace media grid & cards with clean markdown image + descriptions
  md = md.replace(/<div class="media-card">[\s\S]*?<img src="([^"]+)" alt="([^"]+)"[^>]*>[\s\S]*?<h3[^>]*>(.*?)<\/h3>[\s\S]*?<div class="media-card-subtitle">(.*?)<\/div>[\s\S]*?<div class="media-card-desc">(.*?)<\/div>[\s\S]*?<\/div>/g, 
    '\n### $3\n![$2](../$1)\n*$4*\n\n$5\n'
  );
  // Replace figures
  md = md.replace(/<figure class="media-figure">[\s\S]*?<img src="([^"]+)" alt="([^"]+)"[^>]*>[\s\S]*?<figcaption>(.*?)<\/figcaption>[\s\S]*?<\/figure>/g,
    '\n![$2](../$1)\n*$3*\n'
  );
  // Replace video cards
  md = md.replace(/<div class="video-card">[\s\S]*?<iframe src="([^"]+)"[^>]*>[\s\S]*?<div class="video-meta-title">(.*?)<\/div>[\s\S]*?<div>(.*?)<\/div>[\s\S]*?<a href="([^"]+)"[^>]*>.*?<\/a>[\s\S]*?<\/div>/g,
    '\n> 🎬 **[$2]($4)**\n> $3\n> [Watch on YouTube]($4)\n'
  );
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
  // Tables
  md = md.replace(/<table[\s\S]*?<\/table>/g, (tableHtml) => {
    const rows = [];
    const rowMatches = tableHtml.match(/<tr>[\s\S]*?<\/tr>/g) || [];
    rowMatches.forEach((row) => {
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

  // Fix image paths for subfolder docs/
  const adjustPaths = (str) => str.replace(/src="images\//g, 'src="../images/');
  const contentEn = adjustPaths(ch.content.en);
  const contentZh = adjustPaths(ch.content.zh);
  const contentFi = adjustPaths(ch.content.fi);

  // 1. Generate HTML file
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ch.title.en} | Fishing in Finland</title>
  <meta name="description" content="${ch.subtitle.en}">
  <link rel="stylesheet" href="../styles.css?v=20260912_2">
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
        <div class="lang-switcher-wrapper" aria-label="Select Language">
          <div class="lang-row primary-lang-row" aria-label="Primary Language">
            <span class="lang-row-label">Main:</span>
            <button class="lang-btn active" data-lang="en" title="English" aria-label="English">🇬🇧 EN</button>
            <button class="lang-btn" data-lang="zh" title="中文" aria-label="中文">🇨🇳 中文</button>
            <button class="lang-btn" data-lang="fi" title="Suomi" aria-label="Suomi">🇫🇮 FI</button>
          </div>
          <div class="lang-row secondary-lang-row" aria-label="Secondary Language (Optional)">
            <span class="lang-row-label">Compare:</span>
            <button class="lang-btn secondary-btn disabled-lang" data-lang2="en" title="Compare English" aria-label="Compare English">🇬🇧 EN</button>
            <button class="lang-btn secondary-btn" data-lang2="zh" title="与中文对照" aria-label="与中文对照">🇨🇳 中文</button>
            <button class="lang-btn secondary-btn" data-lang2="fi" title="Vertaa suomeksi" aria-label="Vertaa suomeksi">🇫🇮 FI</button>
          </div>
        </div>

        <button id="theme-toggle-btn" class="theme-btn" title="Toggle Theme" aria-label="Toggle Theme">🌙</button>
      </div>
    </nav>

    <!-- Chapter Header -->
    <header class="chapter-header">
      <span class="chapter-num">Chapter ${ch.num} • ${ch.icon} • ${ch.readTime}</span>
      <h1 id="chapter-title" class="chapter-title">${ch.title.en}</h1>
      <p id="chapter-subtitle" class="chapter-subtitle">${ch.subtitle.en}</p>
    </header>

    <!-- Chapter Content Body -->
    <main id="chapter-body">
      <div class="content">${contentEn}</div>
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
      chapter.content.en = ${JSON.stringify(contentEn)};
      chapter.content.zh = ${JSON.stringify(contentZh)};
      chapter.content.fi = ${JSON.stringify(contentFi)};

      let currentLang = localStorage.getItem('fishing_lang') || 'en';
      let secondaryLang = localStorage.getItem('fishing_lang2') || null;
      let currentTheme = localStorage.getItem('fishing_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

      if (secondaryLang === currentLang) secondaryLang = null;

      const htmlEl = document.documentElement;
      const titleEl = document.getElementById('chapter-title');
      const subEl = document.getElementById('chapter-subtitle');
      const bodyEl = document.getElementById('chapter-body');
      const primaryBtns = document.querySelectorAll('.primary-lang-row .lang-btn, [data-lang]');
      const secondaryBtns = document.querySelectorAll('.secondary-lang-row .lang-btn, [data-lang2]');
      const themeBtn = document.getElementById('theme-toggle-btn');

      const LABELS = {
        en: "🇬🇧 English",
        zh: "🇨🇳 中文",
        fi: "🇫🇮 Suomi"
      };

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

      function render() {
        primaryBtns.forEach(btn => {
          if (btn.dataset.lang === currentLang) btn.classList.add('active');
          else btn.classList.remove('active');
        });

        secondaryBtns.forEach(btn => {
          const l2 = btn.dataset.lang2;
          btn.classList.remove('active-secondary', 'disabled-lang');
          if (l2 === currentLang) {
            btn.classList.add('disabled-lang');
          } else if (l2 === secondaryLang) {
            btn.classList.add('active-secondary');
          }
        });

        const t1 = chapter.title[currentLang] || chapter.title.en;
        const sub1 = chapter.subtitle[currentLang] || chapter.subtitle.en;
        const c1 = chapter.content[currentLang] || chapter.content.en;

        if (secondaryLang) {
          const t2 = chapter.title[secondaryLang] || chapter.title.en;
          const sub2 = chapter.subtitle[secondaryLang] || chapter.subtitle.en;
          const c2 = chapter.content[secondaryLang] || chapter.content.en;

          titleEl.innerHTML = '<div>' + t1 + '</div><div style="font-size: 0.78em; color: var(--muted); font-weight: 500; margin-top: 0.25rem;">' + t2 + '</div>';
          subEl.innerHTML = '<div>' + sub1 + '</div><div style="font-size: 0.9em; margin-top: 0.25rem;">' + sub2 + '</div>';
          bodyEl.innerHTML = '<div class="dual-container"><div class="dual-lang-block"><span class="dual-lang-label">' + LABELS[currentLang] + ' (Primary)</span><div class="content">' + c1 + '</div></div><div class="dual-lang-block"><span class="dual-lang-label">' + LABELS[secondaryLang] + ' (Comparison)</span><div class="content">' + c2 + '</div></div></div>';
        } else {
          titleEl.innerHTML = t1;
          subEl.innerHTML = sub1;
          bodyEl.innerHTML = '<div class="content">' + c1 + '</div>';
        }
      }

      function setPrimary(lang) {
        currentLang = lang;
        localStorage.setItem('fishing_lang', lang);
        if (secondaryLang === lang) {
          secondaryLang = null;
          localStorage.removeItem('fishing_lang2');
        }
        render();
      }

      function toggleSecondary(candidate) {
        if (candidate === currentLang) return;
        if (secondaryLang === candidate) {
          secondaryLang = null;
          localStorage.removeItem('fishing_lang2');
        } else {
          secondaryLang = candidate;
          localStorage.setItem('fishing_lang2', candidate);
        }
        render();
      }

      primaryBtns.forEach(btn => btn.addEventListener('click', () => setPrimary(btn.dataset.lang)));
      secondaryBtns.forEach(btn => btn.addEventListener('click', () => toggleSecondary(btn.dataset.lang2)));
      if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

      initTheme();
      render();
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

${htmlToMarkdown(contentEn)}

---

## 中文版 (Chinese Version)

${htmlToMarkdown(contentZh)}

---

## Suomeksi (Finnish Version)

${htmlToMarkdown(contentFi)}

---

## Navigation & Links
- [← Back to Fishing in Finland Guide Index](../README.md)
- Live Web Version: [https://powerpig99.github.io/fishing-in-finland/](https://powerpig99.github.io/fishing-in-finland/)
`;

  fs.writeFileSync(path.join(docsDir, mdFilename), mdContent, 'utf8');
});

console.log(`Successfully compiled ${CHAPTERS_DATA.length} HTML docs and ${CHAPTERS_DATA.length} Markdown docs with rich media.`);
