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
  : "${REMOTE_DIR:=/home/psygames/web/psy-games.pro/public_html}"
  # SFTP (порт 22) — FTP/21 забанен fail2ban. ГЕНТЛ: 1 коннект, без --parallel.
  # БЕЗ --delete: на Contabo есть /play (приложение) и og-cover.png — их НЕ трогаем.
  # Льём только маркетинг-статику; служебное + app-test/ + v2/ исключаем.
  if lftp -u "$SSH_USER","$SSH_PASS" "sftp://$SSH_HOST" -e "
        set sftp:auto-confirm yes;
        set net:timeout 25; set net:max-retries 2; set net:connection-limit 1;
        mirror -R --no-perms \
          --exclude '\.git/' --exclude 'deploy\.sh' --exclude 'deploy-downloads\.sh' --exclude 'contabo\.local\.sh' \
          --exclude 'SYNC\.md' --exclude '\.gitignore' --exclude '\.DS_Store' \
          --exclude 'app-test/' --exclude 'v2/' \
          ./ $REMOTE_DIR/;
        bye"; then
    echo "  ✓ Contabo (SFTP): https://psy-games.pro/"
  else
    echo "  ✗ Contabo SFTP не залился (проверь SSH-креды/сеть)"
  fi
else
  echo "  ⚠ нет contabo.local.sh — Contabo пропущен."
  echo "    создай: FTP_USER=admin_ftp; FTP_PASS=...; FTP_HOST=5.189.130.76"
fi
echo "── готово ──"
