#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────
# PsyGames site — ПРАВИЛО СИНКА: один источник → 3 цели
#   ИСТОЧНИК ИСТИНЫ: эта папка (локалка) = git-репо donosov999-ai.github.io
#   1) GitHub Pages  — git push (авто-деплой)        → https://donosov999-ai.github.io/
#   2) Contabo       — lftp/SFTP в /public_html       → https://psy-games.pro/
#   (локалка — она же источник, всегда актуальна)
#
# Использование:  ./deploy.sh "коммит-сообщение"
# Контабо-креды:  contabo.local.sh (gitignored) — FTP_USER / FTP_PASS / FTP_HOST
# ─────────────────────────────────────────────────────────────────────────
set -uo pipefail
cd "$(dirname "$0")"
MSG="${1:-site update}"

echo "── 1/2 · GitHub Pages (git) ──"
git add -A
if git diff --cached --quiet; then
  echo "  (нет изменений — коммит пропущен)"
else
  git commit -q -m "$MSG"
fi
if git push origin main; then
  echo "  ✓ GitHub: https://donosov999-ai.github.io/"
else
  echo "  ✗ git push не прошёл (VPN/сеть?) — повтори позже"
fi

echo "── 2/2 · Contabo (psy-games.pro) ──"
if [ -f contabo.local.sh ]; then
  # shellcheck disable=SC1091
  source contabo.local.sh
  # ГЕНТЛ-режим: 1 коннект (fail2ban-дружелюбно), без --parallel.
  # Льём только статику сайта; служебное исключаем.
  if lftp -u "$FTP_USER","$FTP_PASS" "$FTP_HOST" -e "
        set ftp:ssl-allow no;
        set net:timeout 20; set net:max-retries 2; set net:connection-limit 1;
        mirror -R --no-perms --delete \
          --exclude '\.git/' --exclude 'deploy\.sh' --exclude 'contabo\.local\.sh' \
          --exclude 'SYNC\.md' --exclude '\.gitignore' \
          ./ /public_html/;
        bye"; then
    echo "  ✓ Contabo: https://psy-games.pro/"
  else
    echo "  ✗ Contabo не залился (FTP 530/таймаут? — нужен доступ/SFTP от Сергея)"
  fi
else
  echo "  ⚠ нет contabo.local.sh — Contabo пропущен."
  echo "    создай: FTP_USER=admin_ftp; FTP_PASS=...; FTP_HOST=5.189.130.76"
fi
echo "── готово ──"
