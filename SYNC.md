# PsyGames site — правило синка (1 источник → 3 цели)

**Источник истины:** эта папка (локалка) = git-репо `donosov999-ai/donosov999-ai.github.io`.
Правишь ВСЕГДА здесь. Один источник — три места всегда одинаковые.

## Цели

| # | Цель | URL | Как доставляется |
|---|---|---|---|
| 1 | **Локалка** | `/Users/denisonosov/dev/psygames-site` | она же источник (всегда актуальна) |
| 2 | **GitHub Pages** | https://donosov999-ai.github.io/ | `git push` → авто-деплой |
| 3 | **Contabo** | https://psy-games.pro/ | `lftp/SFTP` в `/public_html` (в `deploy.sh`) |

## Команда синка (всё за раз)

```bash
cd /Users/denisonosov/dev/psygames-site
./deploy.sh "что поменял"
```
→ коммит+push (GitHub Pages) **и** заливка на Contabo. Локалка = источник.

## Структура (страницы)
`/` (index.html) · `/programs/` · `/games/` · `/benefits/` · `/about/` · `/download/` · `/privacy/`

## Важно
- **Контент идентичен на всех 3** (чистый синк). Установщики ведут на **GitHub Releases**,
  Play — на **psygames-web** (большие бинарники в Pages не хостим).
- Contabo-креды — в `contabo.local.sh` (gitignored). На 2026-06-03 FTP даёт **530**
  (ждём Сергея: актуальные креды или **SFTP+ключ** — тогда `deploy.sh` пойдёт на Contabo).
- Когда домен `psy-games.pro` наведут на GitHub Pages (1 DNS-запись в Cloudflare) —
  Contabo-шаг можно убрать: останется git push → домен. FTP больше не нужен.
- Ярлыки нав «Games/About» на главной пока англ. на всех языках (локализовать — 2 строки).

*Автор: Denis Onosov (ODV999) · ⚠️ конфиденциально*
