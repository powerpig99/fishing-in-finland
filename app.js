/**
 * Fishing in Finland: Complete Beginner & Resident Field Guide
 * Lightweight Vanilla JavaScript Application
 * Supports Primary Language + Optional Secondary Comparison (Mushroom Guide Model)
 */

(function () {
  'use strict';

  let currentLang = localStorage.getItem('fishing_lang') || 'en';
  let secondaryLang = localStorage.getItem('fishing_lang2') || null;
  let currentTheme = localStorage.getItem('fishing_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  // If secondary matches primary, clear secondary
  if (secondaryLang === currentLang) {
    secondaryLang = null;
    localStorage.removeItem('fishing_lang2');
  }

  // DOM Elements
  const htmlEl = document.documentElement;
  const chaptersContainer = document.getElementById('chapters-container');
  const tocList = document.getElementById('toc-list');
  const searchInput = document.getElementById('search-input');
  const primaryBtns = document.querySelectorAll('.primary-lang-row .lang-btn, [data-lang]');
  const secondaryBtns = document.querySelectorAll('.secondary-lang-row .lang-btn, [data-lang2]');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const siteTitleEl = document.getElementById('site-title');
  const siteSubtitleEl = document.getElementById('site-subtitle');
  const tocTitleEl = document.getElementById('toc-title');

  const I18N_UI = {
    en: {
      siteTitle: "Fishing in Finland: The Complete Resident & Beginner Guide",
      siteSubtitle: "A definitive, practical field companion to angling in Finland. Understanding Everyman's rights, the Fisheries Management Fee, species regulations, seasonal tactics, Helsinki transit spots, and authentic fish cooking.",
      tocTitle: "Guide Chapters",
      searchPlaceholder: "Search species, laws, spots, gear, recipes (e.g., Ahven, Kuha, Eräluvat, Vanhankaupunginkoski, Lohikeitto)...",
      noResults: "No matching sections found. Try another keyword like 'Kuha', 'Ahven', or 'permit'.",
      langLabel: "🇬🇧 English"
    },
    zh: {
      siteTitle: "芬兰垂钓与路亚全景实战指南",
      siteSubtitle: "专为在芬常住居民与零基础钓友打造的全景户外实战指南：涵盖自然民权免费渔权、国家渔业管理费、42cm梭鲈生态红线、赫尔辛基公交直达钓点与北欧经典料理全谱。",
      tocTitle: "章节目录",
      searchPlaceholder: "搜索鱼种、法规、钓点、装备、食谱（如：梭鲈、古城急流、三文鱼汤）...",
      noResults: "未找到匹配章节，请尝试其他关键词。",
      langLabel: "🇨🇳 中文"
    },
    fi: {
      siteTitle: "Kalastus Suomessa: Aloittelijan ja asukkaan opas",
      siteSubtitle: "Kattava opas vapaa-ajankalastukseen Suomessa: yleiskalastusoikeudet, kalastonhoitomaksu, alamitat, rauhoitusajat, parhaat kalapaikat ja perinteiset kalaruoat.",
      tocTitle: "Sisällysluettelo",
      searchPlaceholder: "Hae lajia, lupaa, paikkaa tai välinettä...",
      noResults: "Ei hakutuloksia.",
      langLabel: "🇫🇮 Suomi"
    }
  };

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

  function updateLanguageButtonsUI() {
    primaryBtns.forEach(btn => {
      if (btn.dataset.lang === currentLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
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

    const ui = I18N_UI[currentLang] || I18N_UI.en;
    if (siteTitleEl) {
      if (secondaryLang) {
        const ui2 = I18N_UI[secondaryLang];
        siteTitleEl.innerHTML = `${ui.siteTitle}<br><span style="font-size: 0.8em; font-weight: normal; color: var(--muted);">${ui2.siteTitle}</span>`;
      } else {
        siteTitleEl.innerHTML = ui.siteTitle;
      }
    }

    if (siteSubtitleEl) {
      if (secondaryLang) {
        const ui2 = I18N_UI[secondaryLang];
        siteSubtitleEl.innerHTML = `<div>${ui.siteSubtitle}</div><div style="margin-top: 0.35rem; font-size: 0.9em; opacity: 0.9;">${ui2.siteSubtitle}</div>`;
      } else {
        siteSubtitleEl.innerHTML = ui.siteSubtitle;
      }
    }

    if (searchInput) searchInput.placeholder = ui.searchPlaceholder;
    if (tocTitleEl) {
      if (secondaryLang) {
        tocTitleEl.innerHTML = `${ui.tocTitle} / ${I18N_UI[secondaryLang].tocTitle}`;
      } else {
        tocTitleEl.innerHTML = ui.tocTitle;
      }
    }
  }

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
      tocList.innerHTML = `<li style="color: var(--muted); padding: 0.5rem 0;">${I18N_UI[currentLang].noResults}</li>`;
      return;
    }

    filtered.forEach(ch => {
      const li = document.createElement('li');
      li.className = 'toc-item';

      let titleText = '';
      if (secondaryLang) {
        const t1 = ch.title[currentLang] || ch.title.en;
        const t2 = ch.title[secondaryLang] || ch.title.en;
        titleText = `${ch.num}. ${t1} <span style="font-size: 0.85em; color: var(--muted);">/ ${t2.replace(/^\\d+\\.\\s*/, '')}</span>`;
      } else {
        titleText = ch.title[currentLang] || ch.title.en;
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

      const t1 = ch.title[currentLang] || ch.title.en;
      const sub1 = ch.subtitle[currentLang] || ch.subtitle.en;
      const content1 = ch.content[currentLang] || ch.content.en;

      if (secondaryLang) {
        const t2 = ch.title[secondaryLang] || ch.title.en;
        const sub2 = ch.subtitle[secondaryLang] || ch.subtitle.en;
        const content2 = ch.content[secondaryLang] || ch.content.en;

        const label1 = I18N_UI[currentLang].langLabel;
        const label2 = I18N_UI[secondaryLang].langLabel;

        titleHtml = `
          <h1 class="chapter-title">
            <div>${t1}</div>
            <div style="font-size: 0.78em; color: var(--muted); font-weight: 500; margin-top: 0.25rem;">${t2}</div>
          </h1>
        `;
        subtitleHtml = `
          <p class="chapter-subtitle">
            <div>${sub1}</div>
            <div style="font-size: 0.9em; margin-top: 0.25rem;">${sub2}</div>
          </p>
        `;
        bodyHtml = `
          <div class="dual-container">
            <div class="dual-lang-block">
              <span class="dual-lang-label">${label1} (Primary)</span>
              <div class="content">${content1}</div>
            </div>
            <div class="dual-lang-block">
              <span class="dual-lang-label">${label2} (Comparison)</span>
              <div class="content">${content2}</div>
            </div>
          </div>
        `;
      } else {
        // Single Language Default Mode
        titleHtml = `<h1 class="chapter-title">${t1}</h1>`;
        subtitleHtml = `<p class="chapter-subtitle">${sub1}</p>`;
        bodyHtml = `<div class="content">${content1}</div>`;
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

  function setPrimaryLanguage(lang) {
    if (!lang || !['en', 'zh', 'fi'].includes(lang)) return;
    currentLang = lang;
    localStorage.setItem('fishing_lang', lang);

    // If secondary matches new primary, reset secondary
    if (secondaryLang === lang) {
      secondaryLang = null;
      localStorage.removeItem('fishing_lang2');
    }

    updateLanguageButtonsUI();
    const query = searchInput ? searchInput.value : '';
    renderTOC(query);
    renderArticles(query);
  }

  function toggleSecondaryLanguage(candidateLang) {
    if (!candidateLang || candidateLang === currentLang) return;
    if (secondaryLang === candidateLang) {
      // Toggle off!
      secondaryLang = null;
      localStorage.removeItem('fishing_lang2');
    } else {
      secondaryLang = candidateLang;
      localStorage.setItem('fishing_lang2', candidateLang);
    }

    updateLanguageButtonsUI();
    const query = searchInput ? searchInput.value : '';
    renderTOC(query);
    renderArticles(query);
  }

  function initEvents() {
    primaryBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setPrimaryLanguage(btn.dataset.lang);
      });
    });

    secondaryBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSecondaryLanguage(btn.dataset.lang2);
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

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateLanguageButtonsUI();
    const query = searchInput ? searchInput.value : '';
    renderTOC(query);
    renderArticles(query);
    initEvents();
  });

})();
