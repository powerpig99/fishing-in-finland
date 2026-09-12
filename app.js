/**
 * Fishing in Finland: Complete Beginner & Resident Field Guide
 * Lightweight Vanilla JavaScript Application
 * Minimal blog-post style presentation, trilingual switching & search.
 */

(function () {
  'use strict';

  let currentMode = localStorage.getItem('fishing_lang_mode') || 'dual';
  let currentTheme = localStorage.getItem('fishing_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  // DOM Elements
  const htmlEl = document.documentElement;
  const chaptersContainer = document.getElementById('chapters-container');
  const tocList = document.getElementById('toc-list');
  const searchInput = document.getElementById('search-input');
  const langBtns = document.querySelectorAll('.lang-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const siteTitleEl = document.getElementById('site-title');
  const siteSubtitleEl = document.getElementById('site-subtitle');

  // UI Strings for UI elements across languages
  const I18N_UI = {
    dual: {
      siteTitle: "Fishing in Finland: Complete Beginner & Resident Field Guide<br><span style='font-size: 0.85em; font-weight: normal; color: var(--muted);'>芬兰垂钓与路亚全景指南 • Kalastus Suomessa</span>",
      siteSubtitle: "An authoritative, trilingual field companion covering Finnish fishing laws, Everyman's rights, the National Fisheries Management Fee (Kalastonhoitomaksu), seasonal techniques, Helsinki public-transit spots, and traditional Nordic culinary recipes.",
      tocTitle: "Table of Contents / 目录导航",
      searchPlaceholder: "Search species, laws, spots, gear, recipes (e.g., Ahven, Kuha, Eräluvat, Vanhankaupunginkoski, Lohikeitto)...",
      noResults: "No matching sections found. Try another keyword like 'Kuha', 'Ahven', or 'permit'."
    },
    en: {
      siteTitle: "Fishing in Finland: The Complete Resident & Beginner Guide",
      siteSubtitle: "A definitive, practical field companion to angling in Finland. Understanding Everyman's rights, the Fisheries Management Fee, species regulations, seasonal tactics, Helsinki spots, and authentic fish cooking.",
      tocTitle: "Guide Chapters",
      searchPlaceholder: "Search species, laws, spots, gear, recipes...",
      noResults: "No matching sections found."
    },
    zh: {
      siteTitle: "芬兰垂钓与路亚全景实战指南",
      siteSubtitle: "专为在芬常住居民与零基础钓友打造的全景户外实战指南：涵盖自然民权免费渔权、国家渔业管理费、42cm梭鲈生态红线、赫尔辛基公交直达钓点与北欧经典料理全谱。",
      tocTitle: "章节目录",
      searchPlaceholder: "搜索鱼种、法规、钓点、装备、食谱（如：梭鲈、古城急流、三文鱼汤）...",
      noResults: "未找到匹配章节，请尝试其他关键词。"
    },
    fi: {
      siteTitle: "Kalastus Suomessa: Aloittelijan ja asukkaan opas",
      siteSubtitle: "Kattava opas vapaa-ajankalastukseen Suomessa: yleiskalastusoikeudet, kalastonhoitomaksu, alamitat, rauhoitusajat, parhaat kalapaikat ja perinteiset kalaruoat.",
      tocTitle: "Sisällysluettelo",
      searchPlaceholder: "Hae lajia, lupaa, paikkaa tai välinettä...",
      noResults: "Ei hakutuloksia."
    }
  };

  // Initialize theme
  function initTheme() {
    htmlEl.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
  }

  function updateThemeIcon() {
    if (!themeToggleBtn) return;
    themeToggleBtn.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
    themeToggleBtn.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', currentTheme);
    localStorage.setItem('fishing_theme', currentTheme);
    updateThemeIcon();
  }

  // Get localized string helper
  function getLoc(obj, mode) {
    if (!obj) return '';
    if (mode === 'dual') {
      return `${obj.en} <span style="display:block; font-size: 0.88em; color: var(--muted); font-weight: normal; margin-top: 2px;">${obj.zh}</span>`;
    }
    return obj[mode] || obj.en;
  }

  // Render Table of Contents
  function renderTOC(filterText = '') {
    if (!tocList) return;
    tocList.innerHTML = '';
    const query = filterText.toLowerCase().trim();

    const filtered = CHAPTERS_DATA.filter(ch => {
      if (!query) return true;
      const haystack = (
        ch.title.en + ' ' + ch.title.zh + ' ' + ch.title.fi + ' ' +
        ch.subtitle.en + ' ' + ch.subtitle.zh + ' ' + ch.subtitle.fi + ' ' +
        ch.content.en + ' ' + ch.content.zh + ' ' + ch.content.fi
      ).toLowerCase();
      return haystack.includes(query);
    });

    if (filtered.length === 0) {
      tocList.innerHTML = `<li style="color: var(--muted); padding: 0.5rem 0;">${I18N_UI[currentMode].noResults}</li>`;
      return;
    }

    filtered.forEach(ch => {
      const li = document.createElement('li');
      li.className = 'toc-item';

      let titleText = '';
      if (currentMode === 'dual') {
        titleText = `${ch.num}. ${ch.title.en} <span style="font-size: 0.85em; color: var(--muted);">/ ${ch.title.zh.replace(/^\\d+\\.\\s*/, '')}</span>`;
      } else {
        titleText = ch.title[currentMode] || ch.title.en;
      }

      li.innerHTML = `
        <a href="#${ch.id}" class="toc-link">
          <span>${ch.icon}</span>
          <span>${titleText}</span>
        </a>
        <span class="toc-meta">${ch.readTime}</span>
      `;
      tocList.appendChild(li);
    });
  }

  // Render Chapter Articles
  function renderArticles(filterText = '') {
    if (!chaptersContainer) return;
    chaptersContainer.innerHTML = '';
    const query = filterText.toLowerCase().trim();

    const filtered = CHAPTERS_DATA.filter(ch => {
      if (!query) return true;
      const haystack = (
        ch.title.en + ' ' + ch.title.zh + ' ' + ch.title.fi + ' ' +
        ch.subtitle.en + ' ' + ch.subtitle.zh + ' ' + ch.subtitle.fi + ' ' +
        ch.content.en + ' ' + ch.content.zh + ' ' + ch.content.fi
      ).toLowerCase();
      return haystack.includes(query);
    });

    filtered.forEach(ch => {
      const article = document.createElement('article');
      article.className = 'chapter-article';
      article.id = ch.id;

      let titleHtml = '';
      let subtitleHtml = '';
      let bodyHtml = '';

      if (currentMode === 'dual') {
        titleHtml = `
          <h1 class="chapter-title">
            <div>${ch.title.en}</div>
            <div style="font-size: 0.78em; color: var(--muted); font-weight: 500; margin-top: 0.25rem;">${ch.title.zh}</div>
          </h1>
        `;
        subtitleHtml = `
          <p class="chapter-subtitle">
            <div>${ch.subtitle.en}</div>
            <div style="font-size: 0.9em; margin-top: 0.25rem;">${ch.subtitle.zh}</div>
          </p>
        `;
        bodyHtml = `
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
        `;
      } else {
        const langLabel = currentMode === 'zh' ? '🇨🇳 中文' : currentMode === 'fi' ? '🇫🇮 Suomi' : '🇬🇧 English';
        titleHtml = `<h1 class="chapter-title">${ch.title[currentMode] || ch.title.en}</h1>`;
        subtitleHtml = `<p class="chapter-subtitle">${ch.subtitle[currentMode] || ch.subtitle.en}</p>`;
        bodyHtml = `<div class="content">${ch.content[currentMode] || ch.content.en}</div>`;
      }

      article.innerHTML = `
        <header class="chapter-header">
          <span class="chapter-num">Chapter ${ch.num} • ${ch.icon} • ${ch.readTime}</span>
          ${titleHtml}
          ${subtitleHtml}
        </header>
        ${bodyHtml}
      `;
      chaptersContainer.appendChild(article);
    });
  }

  // Update Language Mode
  function setLanguageMode(mode) {
    currentMode = mode;
    localStorage.setItem('fishing_lang_mode', mode);

    langBtns.forEach(btn => {
      if (btn.dataset.mode === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const ui = I18N_UI[mode] || I18N_UI.en;
    if (siteTitleEl) siteTitleEl.innerHTML = ui.siteTitle;
    if (siteSubtitleEl) siteSubtitleEl.textContent = ui.siteSubtitle;
    if (searchInput) searchInput.placeholder = ui.searchPlaceholder;

    const tocTitleEl = document.getElementById('toc-title');
    if (tocTitleEl) tocTitleEl.textContent = ui.tocTitle;

    const currentQuery = searchInput ? searchInput.value : '';
    renderTOC(currentQuery);
    renderArticles(currentQuery);
  }

  // Setup Event Listeners
  function initEvents() {
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        setLanguageMode(btn.dataset.mode);
      });
    });

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', toggleTheme);
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        renderTOC(query);
        renderArticles(query);
      });
    }
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setLanguageMode(currentMode);
    initEvents();
  });

})();
