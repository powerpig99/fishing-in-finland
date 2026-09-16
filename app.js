/**
 * Fishing in Finland: Complete Beginner & Resident Field Guide
 * Lightweight Vanilla JavaScript Application
 * Multi-Page Hub with Realtime Live Filter & Trilingual Dual Comparison
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
  const spotlightWrap = document.getElementById('seasonal-spotlight-banner-wrap');
  const directoryContainer = document.getElementById('chapter-directory');
  const directoryTitleEl = document.getElementById('directory-title');
  const directorySubtitleEl = document.getElementById('directory-subtitle');
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
      siteSubtitle: "An authoritative, trilingual field companion covering Finnish fishing laws, Everyman's rights, the National Fisheries Management Fee (Kalastonhoitomaksu), seasonal techniques, Helsinki public-transit spots, and traditional Nordic culinary recipes.",
      tocTitle: "Quick Chapter Index",
      directoryTitle: "Handbook Chapters",
      directorySubtitle: "Select any chapter below to explore comprehensive rules, spots, gear, and verified Finnish tutorial videos.",
      searchPlaceholder: "Search species, laws, spots, gear, recipes (e.g., Ahven, Kuha, Eräluvat, Vanhankaupunginkoski, Lohikeitto)...",
      noResults: "No matching sections found. Try another keyword like 'Kuha', 'Ahven', or 'permit'.",
      readChapterBtn: "Read Chapter",
      spotlightBadge: "🍂 September Feature",
      spotlightTitle: "September Autumn Fishing Master Guide",
      spotlightDesc: "Water temperatures dropping to ~12°C trigger aggressive pre-winter feeding for Perch and Pike. Master 10–15g bottom jigging (pohjajigaus), observe the Sept 1st trout river closed season, and prepare with our verified tackle checklist.",
      spotlightCta: "Open September Autumn Guide →",
      langLabel: "🇬🇧 English"
    },
    zh: {
      siteTitle: "芬兰垂钓与路亚全景实战指南",
      siteSubtitle: "专为在芬常住居民与零基础钓友打造的全景户外实战指南：涵盖自然民权免费渔权、国家渔业管理费、42cm梭鲈生态红线、赫尔辛基公交直达钓点与北欧经典料理全谱。",
      tocTitle: "章节快速索引",
      directoryTitle: "指南章节导览",
      directorySubtitle: "点击进入各章专属页面，查阅详实法规红线、实战装备、钓点航拍与芬兰语教学视频。",
      searchPlaceholder: "搜索鱼种、法规、钓点、装备、食谱（如：梭鲈、古城急流、三文鱼汤）...",
      noResults: "未找到匹配章节，请尝试其他关键词。",
      readChapterBtn: "进入本章指南",
      spotlightBadge: "🍂 9月秋季特辑",
      spotlightTitle: "9月秋季垂钓与路亚深度进阶指南",
      spotlightDesc: "水温降至约12°C激活了鲈鱼和白斑狗鱼越冬前最凶猛的摄食窗口。掌握10–15克底跳软饵（pohjajigaus）搜索节奏、坚守9月1日溪流鳟鱼产卵禁渔红线，并备齐专业采购清单。",
      spotlightCta: "立即查阅9月完整实战指南 →",
      langLabel: "🇨🇳 中文"
    },
    fi: {
      siteTitle: "Kalastus Suomessa: Aloittelijan ja asukkaan opas",
      siteSubtitle: "Kattava opas vapaa-ajankalastukseen Suomessa: yleiskalastusoikeudet, kalastonhoitomaksu, alamitat, rauhoitusajat, parhaat kalapaikat ja perinteiset kalaruoat.",
      tocTitle: "Lukujen pikahaku",
      directoryTitle: "Käsikirjan luvut",
      directorySubtitle: "Valitse luku alta tutustuaksesi kattaviin ohjeisiin, sääntöihin, ottipaikkoihin ja opetusvideoihin.",
      searchPlaceholder: "Hae lajia, lupaa, paikkaa tai välinettä...",
      noResults: "Ei hakutuloksia.",
      readChapterBtn: "Lue luku",
      spotlightBadge: "🍂 Syyskauden erikoisopas",
      spotlightTitle: "Syyskuun ahvenen ja hauen kalastusopas",
      spotlightDesc: "Veden viiletessä n. 12 asteeseen petokalat tankkaavat raivokkaasti talvea varten. Opi 10–15g pohjajigaus, huomioi virtavesien 1.9. taimenen kuturauhoitus ja hanki oikeat täsmävälineet.",
      spotlightCta: "Avaa syyskuun täsmäopas →",
      langLabel: "🇫🇮 Suomi"
    }
  };

  const CHAPTER_TAGS = {
    ch1: ["Everyman's Rights", "Kalastonhoitomaksu", "Permits", "Kalastusrajoitus.fi"],
    ch2: ["Perch (Ahven)", "Zander (Kuha 42cm)", "Pike (Hauki)", "Regulations"],
    ch3: ["Spinning", "Bottom Jigging", "Float Angling", "Ice Fishing"],
    ch4: ["Vanhankaupunginkoski", "Lauttasaari", "Ruoholahti", "HSL Transit"],
    ch5: ["Motonet & Ruoto", "Rod & Reel Setup", "Line & Knots", "Budget Kits"],
    ch6: ["Bleeding (Verestys)", "Lohikeitto Recipe", "Smoking (Savustus)", "Ethics"],
    ch7: ["Finnish Glossary", "Tackle Terms", "Swedish Names", "Reference"],
    ch8: ["Activity Calendar", "Seasonal Tactics", "Ice-out to Winter", "Timing"],
    ch9: ["September Guide", "10-15g Jigging", "Trout Closed Season", "Tackle List"]
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

    if (directoryTitleEl) {
      if (secondaryLang) {
        directoryTitleEl.innerHTML = `${ui.directoryTitle} / ${I18N_UI[secondaryLang].directoryTitle}`;
      } else {
        directoryTitleEl.innerHTML = ui.directoryTitle;
      }
    }

    if (directorySubtitleEl) {
      if (secondaryLang) {
        directorySubtitleEl.innerHTML = `<div>${ui.directorySubtitle}</div><div style="margin-top: 0.25rem; font-size: 0.9em; opacity: 0.9;">${I18N_UI[secondaryLang].directorySubtitle}</div>`;
      } else {
        directorySubtitleEl.innerHTML = ui.directorySubtitle;
      }
    }
  }

  function renderSpotlight() {
    if (!spotlightWrap) return;
    const ui = I18N_UI[currentLang] || I18N_UI.en;
    let badgeHtml = ui.spotlightBadge;
    let titleHtml = ui.spotlightTitle;
    let descHtml = ui.spotlightDesc;
    let ctaHtml = ui.spotlightCta;

    if (secondaryLang) {
      const ui2 = I18N_UI[secondaryLang] || I18N_UI.en;
      titleHtml += ` <span style="font-size: 0.8em; font-weight: normal; color: var(--muted);">/ ${ui2.spotlightTitle}</span>`;
      descHtml += `<div style="margin-top: 0.4rem; font-size: 0.9em; opacity: 0.9;">${ui2.spotlightDesc}</div>`;
    }

    spotlightWrap.innerHTML = `
      <a href="docs/09_september_autumn_fishing_guide.html" class="seasonal-spotlight-banner">
        <span class="spotlight-badge">${badgeHtml}</span>
        <h3 class="spotlight-title">${titleHtml}</h3>
        <p class="spotlight-desc">${descHtml}</p>
        <span class="spotlight-cta">${ctaHtml}</span>
      </a>
    `;
  }

  function stripChapterNum(str) {
    return (str || '').replace(/^\d+\.\s*/, '');
  }

  function renderTOC(filterText = '') {
    if (!tocList) return;
    tocList.innerHTML = '';
    const query = filterText.toLowerCase().trim();

    const filtered = CHAPTERS_DATA.filter(ch => {
      if (!query) return true;
      const tags = (CHAPTER_TAGS[ch.id] || []).join(' ');
      const haystack = (
        ch.num + ' ' +
        ch.title.en + ' ' + ch.title.zh + ' ' + ch.title.fi + ' ' +
        ch.subtitle.en + ' ' + ch.subtitle.zh + ' ' + ch.subtitle.fi + ' ' +
        ch.content.en + ' ' + ch.content.zh + ' ' + ch.content.fi + ' ' +
        tags
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

      const t1 = stripChapterNum(ch.title[currentLang] || ch.title.en);
      let titleText = '';
      if (secondaryLang) {
        const t2 = stripChapterNum(ch.title[secondaryLang] || ch.title.en);
        titleText = `${ch.num}. ${t1} <span style="font-size: 0.85em; color: var(--muted);">/ ${t2}</span>`;
      } else {
        titleText = `${ch.num}. ${t1}`;
      }

      li.innerHTML = `
        <a href="docs/${ch.num}_${ch.slug}.html" class="toc-link">
          <span>${ch.icon}</span>
          <span>${titleText}</span>
        </a>
        <span class="toc-meta">${ch.readTime}</span>
      `;
      tocList.appendChild(li);
    });
  }

  function renderDirectory(filterText = '') {
    if (!directoryContainer) return;
    directoryContainer.innerHTML = '';
    const query = filterText.toLowerCase().trim();

    const filtered = CHAPTERS_DATA.filter(ch => {
      if (!query) return true;
      const tags = (CHAPTER_TAGS[ch.id] || []).join(' ');
      const haystack = (
        ch.num + ' ' +
        ch.title.en + ' ' + ch.title.zh + ' ' + ch.title.fi + ' ' +
        ch.subtitle.en + ' ' + ch.subtitle.zh + ' ' + ch.subtitle.fi + ' ' +
        ch.content.en + ' ' + ch.content.zh + ' ' + ch.content.fi + ' ' +
        tags
      ).toLowerCase();
      return haystack.includes(query);
    });

    if (filtered.length === 0) {
      directoryContainer.innerHTML = `<div style="grid-column: 1 / -1; color: var(--muted); padding: 2.5rem 1rem; text-align: center;">${I18N_UI[currentLang].noResults}</div>`;
      return;
    }

    const ui = I18N_UI[currentLang] || I18N_UI.en;

    filtered.forEach(ch => {
      const card = document.createElement('a');
      card.className = 'chapter-card';
      card.href = `docs/${ch.num}_${ch.slug}.html`;

      const t1 = stripChapterNum(ch.title[currentLang] || ch.title.en);
      const sub1 = ch.subtitle[currentLang] || ch.subtitle.en;

      let titleHtml = t1;
      let subHtml = sub1;

      if (secondaryLang) {
        const t2 = stripChapterNum(ch.title[secondaryLang] || ch.title.en);
        const sub2 = ch.subtitle[secondaryLang] || ch.subtitle.en;
        titleHtml = `<div>${t1}</div><div style="font-size: 0.8em; font-weight: 500; color: var(--muted); margin-top: 0.2rem;">${t2}</div>`;
        subHtml = `<div>${sub1}</div><div style="font-size: 0.9em; margin-top: 0.25rem;">${sub2}</div>`;
      }

      const tags = CHAPTER_TAGS[ch.id] || [];
      const tagsHtml = tags.map(t => `<span class="badge">${t}</span>`).join('');

      card.innerHTML = `
        <div>
          <div class="chapter-card-top">
            <span class="chapter-card-num">Chapter ${ch.num} • ${ch.icon}</span>
            <span class="chapter-card-time">${ch.readTime}</span>
          </div>
          <h3 class="chapter-card-title">${titleHtml}</h3>
          <p class="chapter-card-sub">${subHtml}</p>
        </div>
        <div>
          <div class="chapter-card-tags">
            ${tagsHtml}
          </div>
          <div class="chapter-card-footer">
            <span>${ui.readChapterBtn}</span>
            <span>→</span>
          </div>
        </div>
      `;

      directoryContainer.appendChild(card);
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
    renderSpotlight();
    const query = searchInput ? searchInput.value : '';
    renderTOC(query);
    renderDirectory(query);
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
    renderSpotlight();
    const query = searchInput ? searchInput.value : '';
    renderTOC(query);
    renderDirectory(query);
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
        renderDirectory(query);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateLanguageButtonsUI();
    renderSpotlight();
    const query = searchInput ? searchInput.value : '';
    renderTOC(query);
    renderDirectory(query);
    initEvents();
  });

})();

