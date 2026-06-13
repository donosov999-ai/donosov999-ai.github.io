// Единый «нормальный» футер на ВСЕ страницы (self-contained, формат-независимый).
// Содержит свой FOOTER_I18N (×7 яз) + window.renderFooter — не зависит от I18N/UI страниц
// (у которых ключи/конвенции разные: foot vs footer, data-i vs data-i18n).
// Статика пекётся через build-i18n (он вызовет renderFooter(lang) после apply) → футер
// локализован в каждом языковом HTML (SEO + no-JS). Клиент: рендер на загрузке + при смене языка.
// Идемпотентно: пропуск если уже есть id="psyft".
import { readFileSync, writeFileSync } from 'fs';

const PAGES = ['index.html','programs/index.html','games/index.html','benefits/index.html','about/index.html','download/index.html','privacy/index.html']
  .map(p => `/Users/denisonosov/dev/psygames-site/${p}`);

const CSS = `
  /* ── единый футер ── */
  footer.ft{text-align:left;padding:0;margin-top:56px;border-top:1px solid var(--line);background:rgba(255,255,255,.015)}
  .ft .ftin{max-width:1000px;margin:0 auto;padding:36px 20px 8px;display:grid;grid-template-columns:1.5fr 1fr 1.2fr;gap:30px}
  .ft .ftlogo{font-weight:800;font-size:17px;margin-bottom:9px}
  .ft .fttag{color:var(--mut);font-size:13px;line-height:1.55;max-width:300px;margin-bottom:13px}
  .ft .ftplat{color:var(--mut);font-size:12px;opacity:.85}
  .ft .fth{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--mut);margin-bottom:11px}
  .ft .ftc a{display:block;color:var(--txt);text-decoration:none;font-size:13.5px;margin:7px 0;opacity:.82;transition:.15s}
  .ft .ftc a:hover{opacity:1;color:var(--accent)}
  .ft .ftbar{max-width:1000px;margin:22px auto 0;padding:15px 20px 42px;border-top:1px solid var(--line);color:var(--mut);font-size:12.5px}
  @media(max-width:640px){.ft .ftin{grid-template-columns:1fr 1fr;gap:24px}.ft .ftc-brand{grid-column:1/-1}}
</style>`;

const HTML = `
<footer class="ft" id="psyft">
  <div class="ftin">
    <div class="ftc ftc-brand">
      <div class="ftlogo">🧠 PsyGames</div>
      <p class="fttag" data-f="tag"></p>
      <div class="ftplat">Mac · Windows · Android · Web</div>
    </div>
    <nav class="ftc">
      <div class="fth" data-f="h_product"></div>
      <a href="/programs/" data-f="programs"></a>
      <a href="/games/" data-f="trainers"></a>
      <a href="/benefits/" data-f="benefits"></a>
      <a href="/download/" data-f="download"></a>
    </nav>
    <nav class="ftc">
      <div class="fth" data-f="h_legal"></div>
      <a href="/privacy/" data-f="privacy"></a>
      <div class="fth" style="margin-top:18px" data-f="h_support"></div>
      <a href="mailto:info@psy-games.pro">info@psy-games.pro</a>
    </nav>
  </div>
  <div class="ftbar"><span data-f="copyright"></span></div>
</footer>`;

const F = {
 en:{tag:"Science-based cognitive training — free, no ads, no account.",h_product:"Product",programs:"Programs",trainers:"Trainers",benefits:"Benefits",download:"Download",h_legal:"Legal",privacy:"Privacy Policy",h_support:"Support",copyright:"© 2026 PsyGames · Denis Onosov (ODV999)"},
 ru:{tag:"Тренировка мозга на научной основе — бесплатно, без рекламы и регистрации.",h_product:"Продукт",programs:"Программы",trainers:"Тренажёры",benefits:"Польза",download:"Скачать",h_legal:"Правовое",privacy:"Политика конфиденциальности",h_support:"Поддержка",copyright:"© 2026 PsyGames · Denis Onosov (ODV999)"},
 es:{tag:"Entrenamiento cognitivo con base científica — gratis, sin anuncios ni cuenta.",h_product:"Producto",programs:"Programas",trainers:"Entrenadores",benefits:"Beneficios",download:"Descargar",h_legal:"Legal",privacy:"Política de privacidad",h_support:"Soporte",copyright:"© 2026 PsyGames · Denis Onosov (ODV999)"},
 pt:{tag:"Treino cognitivo com base científica — grátis, sem anúncios nem conta.",h_product:"Produto",programs:"Programas",trainers:"Treinadores",benefits:"Benefícios",download:"Baixar",h_legal:"Jurídico",privacy:"Política de Privacidade",h_support:"Suporte",copyright:"© 2026 PsyGames · Denis Onosov (ODV999)"},
 de:{tag:"Wissenschaftlich fundiertes Gehirntraining — kostenlos, ohne Werbung und Konto.",h_product:"Produkt",programs:"Programme",trainers:"Trainer",benefits:"Nutzen",download:"Download",h_legal:"Rechtliches",privacy:"Datenschutzerklärung",h_support:"Support",copyright:"© 2026 PsyGames · Denis Onosov (ODV999)"},
 zh:{tag:"基于科学的认知训练——免费、无广告、无需账户。",h_product:"产品",programs:"课程",trainers:"训练",benefits:"益处",download:"下载",h_legal:"法律",privacy:"隐私政策",h_support:"支持",copyright:"© 2026 PsyGames · Denis Onosov (ODV999)"},
 hi:{tag:"विज्ञान-आधारित संज्ञानात्मक प्रशिक्षण — मुफ़्त, बिना विज्ञापन व खाते के।",h_product:"उत्पाद",programs:"प्रोग्राम",trainers:"ट्रेनर",benefits:"लाभ",download:"डाउनलोड",h_legal:"कानूनी",privacy:"गोपनीयता नीति",h_support:"सहायता",copyright:"© 2026 PsyGames · Denis Onosov (ODV999)"},
};

const SCRIPT = `
<script>
(function(){var F=${JSON.stringify(F)};
function rf(l){var d=F[l]||F.en;var ft=document.getElementById('psyft');if(!ft)return;ft.querySelectorAll('[data-f]').forEach(function(e){var k=e.getAttribute('data-f');if(d[k]!=null)e.textContent=d[k];});}
window.renderFooter=rf;
try{rf(document.documentElement.lang||'en');}catch(e){}
try{if(window.apply){var _a=window.apply;window.apply=function(x){_a(x);try{rf(x)}catch(e){}};}}catch(e){}
})();
</script>`;

let done = 0;
for (const file of PAGES) {
  let html = readFileSync(file, 'utf8');
  if (html.includes('id="psyft"')) { console.log('skip (уже есть):', file.split('/').slice(-2).join('/')); continue; }
  // 1) удалить старый <footer>…</footer> (одно- и многострочный)
  html = html.replace(/<footer[\s\S]*?<\/footer>/i, '');
  // 2) CSS перед </style> (первый)
  html = html.replace('</style>', CSS);
  // 3) футер + скрипт перед </body>
  html = html.replace('</body>', HTML + '\n' + SCRIPT + '\n</body>');
  writeFileSync(file, html, 'utf8');
  done++;
  console.log('ok:', file.split('/').slice(-2).join('/'));
}
console.log(`\nфутер внедрён на ${done} страниц. Дальше: хук renderFooter в build-i18n → rebuild → deploy.`);
