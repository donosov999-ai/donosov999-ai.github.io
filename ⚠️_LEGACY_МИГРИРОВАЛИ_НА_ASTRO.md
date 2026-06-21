# ⚠️ ЭТОТ РЕПО — LEGACY. Сайт переехал на Astro (21.06.2026)

**НЕ деплой отсюда `./deploy.sh`** — затрёшь живой сайт старым тёмным (клоббер).

- ✅ Новый источник сайта: `/Users/denisonosov/dev/psygames-astro/`
- 📄 Полный инструктаж: `/Users/denisonosov/dev/psygames-astro/HANDOFF_app-chat.md`

Этот каталог (`psygames-site`) теперь служит только **GitHub Pages зеркалом**: в него rsync-ят собранный Astro `dist/` и пушат. Старые `build-i18n.mjs` / `build-games*.mjs` / `deploy.sh` / `index.html`-исходники — НЕ использовать для правок контента.

Правки сайта → только в `psygames-astro` → `npm run build` → деплой (см. HANDOFF).
