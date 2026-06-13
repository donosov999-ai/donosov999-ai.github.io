// Пре-рендер мультиязычных статических страниц psy-games.pro для индексации.
// Подход: грузим каждую страницу источника в jsdom, вызываем её РОДНУЮ apply(lang)
// (рендерит статику + динамику), снимаем DOM, патчим <head> (hreflang/canonical/
// og:locale/локализ. title) и переписываем навигацию на языковой префикс /{lang}/.
// EN остаётся в корне (x-default), остальные → /{lang}/<page>/.
// Запуск: node build-i18n.mjs   → вывод в ./dist-i18n/  (НЕ деплоит; деплой ./deploy.sh вручную)
import { JSDOM } from 'jsdom';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const SRC = '/Users/denisonosov/dev/psygames-site';
const OUT = '/Users/denisonosov/dev/psygames-site-i18n/dist-i18n';
const BASE = 'https://psy-games.pro';
const LANGS = ['en','ru','es','pt','hi','zh','de'];
const LOCALE = { en:'en_US', ru:'ru_RU', es:'es_ES', pt:'pt_BR', hi:'hi_IN', zh:'zh_CN', de:'de_DE' };
// page key '' = главная (index.html в корне); остальные — подпапки
const PAGES = ['', 'programs', 'games', 'benefits', 'about', 'download', 'privacy'];

const pageUrl = (lang, page) => {
  const seg = page ? `${page}/` : '';
  return lang === 'en' ? `${BASE}/${seg}` : `${BASE}/${lang}/${seg}`;
};
const srcPath = (page) => page ? `${SRC}/${page}/index.html` : `${SRC}/index.html`;
const outPath = (lang, page) => {
  const dir = [OUT, lang === 'en' ? '' : lang, page].filter(Boolean).join('/');
  return { dir, file: `${dir}/index.html` };
};

function hreflangBlock(page) {
  let t = LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${pageUrl(l, page)}">`).join('\n');
  t += `\n<link rel="alternate" hreflang="x-default" href="${pageUrl('en', page)}">`;
  return t;
}

// переписать внутренние ссылки на языковой префикс (для не-en)
function localizeLinks(html, lang) {
  if (lang === 'en') return html;
  // href="/", "/programs/", "/games/" … → "/{lang}/…"   (внутренние абсолютные пути)
  return html.replace(/href="\/(programs\/|games\/|benefits\/|about\/|download\/|privacy\/)?"/g,
    (_m, p) => `href="/${lang}/${p || ''}"`);
}

// локализованный <title>/<description> из отрендеренного DOM (H1/tag/intro)
function localizedMeta(doc, page, lang) {
  const h1 = doc.querySelector('h1')?.textContent?.trim();
  const tag = doc.querySelector('.tag,.intro')?.textContent?.trim();
  const brand = 'PsyGames';
  // главная: бренд + слоган; внутренние: заголовок + бренд
  const title = page === '' ? `${brand} — ${tag ? tag.split('.')[0] : 'Cognitive Training'}` : `${brand} — ${h1 || ''}`.trim();
  const desc = (tag || h1 || '').slice(0, 180);
  return { title: title.slice(0, 70), desc };
}

let count = 0;
const sitemapUrls = [];

for (const page of PAGES) {
  const srcHtml = readFileSync(srcPath(page), 'utf8');
  for (const lang of LANGS) {
    // свежий jsdom на каждый язык (изоляция состояния/localStorage)
    const dom = new JSDOM(srcHtml, {
      runScripts: 'dangerously',
      url: pageUrl('en', page),    // даёт работающий localStorage
      pretendToBeVisual: true,
    });
    const { window } = dom;
    const doc = window.document;
    try {
      if (typeof window.apply === 'function') window.apply(lang);
    } catch (e) {
      console.error(`apply(${lang}) на ${page||'index'}:`, e.message);
    }
    doc.documentElement.setAttribute('lang', lang);
    // select#lang: jsdom уже наполнил опции через ORDER.forEach; клиентский JS наполнит
    // ПОВТОРНО → дубль (×14). Очищаем — клиент заполнит один раз.
    const langSel = doc.getElementById('lang'); if (langSel) langSel.innerHTML = '';

    // ── патч <head> ──
    const head = doc.querySelector('head');
    // убрать старые canonical/hreflang/og:locale/og:url чтобы не дублировать
    head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang], meta[property="og:locale"], meta[property="og:url"]').forEach(n => n.remove());
    const { title, desc } = localizedMeta(doc, page, lang);
    // локализ title + description
    let titleEl = doc.querySelector('title'); if (!titleEl) { titleEl = doc.createElement('title'); head.appendChild(titleEl); }
    titleEl.textContent = title;
    let descEl = doc.querySelector('meta[name="description"]'); if (descEl) descEl.setAttribute('content', desc);
    // вставка нового SEO-блока
    const seo = doc.createElement('div'); // временный контейнер
    seo.innerHTML =
      `<link rel="canonical" href="${pageUrl(lang, page)}">\n` +
      hreflangBlock(page) + '\n' +
      `<meta property="og:locale" content="${LOCALE[lang]}">\n` +
      `<meta property="og:url" content="${pageUrl(lang, page)}">`;
    [...seo.childNodes].forEach(n => head.appendChild(n));

    // ── сериализация + постобработка ссылок ──
    let out = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
    out = localizeLinks(out, lang);
    // КРИТИЧНО: родной скрипт вызывает apply(init), где init=navigator.language → у
    // Googlebot (navigator=en, без localStorage) ЭТО ПЕРЕРЕНДЕРИТ /ru/ обратно в EN.
    // Форсим язык страницы при клиентском рендере, чтобы статический язык не перебивался.
    out = out.replace(/apply\(init\)\s*;/, `apply(${JSON.stringify(lang)});`);
    // переключатель языка → переход на языковой URL (а не JS-подмена без смены URL)
    out = out.replace(/sel\.onchange\s*=\s*\(\)\s*=>\s*apply\(sel\.value\)\s*;/,
      `sel.onchange=()=>{var m={en:'/',ru:'/ru/',es:'/es/',pt:'/pt/',hi:'/hi/',zh:'/zh/',de:'/de/'};var seg=location.pathname.replace(/^\\/(en|ru|es|pt|hi|zh|de)\\//,'/').replace(/^\\//,'');location.href=(m[sel.value]||'/')+seg;};`);

    const { dir, file } = outPath(lang, page);
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, out, 'utf8');
    count++;
    dom.window.close();
  }
  // sitemap: одна запись на (page) с alternates — добавим по en-URL
  sitemapUrls.push(page);
}

// ── sitemap.xml ──
const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapUrls.flatMap(page => LANGS.map(lang => `  <url>
    <loc>${pageUrl(lang, page)}</loc>
${LANGS.map(a => `    <xhtml:link rel="alternate" hreflang="${a}" href="${pageUrl(a, page)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl('en', page)}"/>
  </url>`)).join('\n')}
</urlset>`;
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/sitemap.xml`, sm, 'utf8');
writeFileSync(`${OUT}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`, 'utf8');

console.log(`готово: ${count} страниц (${PAGES.length} × ${LANGS.length}) + sitemap (${sitemapUrls.length*LANGS.length} URL) + robots`);
