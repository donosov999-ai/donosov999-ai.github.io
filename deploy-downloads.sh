#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────
# PsyGames — синк бинарников на наш хостинг (psy-games.pro/downloads/).
# Тянет артефакты ПОСЛЕДНЕГО релиза donosov999-ai/psygames-native с GitHub
# и заливает на Contabo под СТАБИЛЬНЫМИ именами (кнопки на download/ не правим).
#
# Запускать ПОСЛЕ каждого релиза:  ./deploy-downloads.sh
# Креды: contabo.local.sh (SSH_USER/SSH_PASS/SSH_HOST/REMOTE_DIR).
# Требует: gh (авторизован), lftp.
# ─────────────────────────────────────────────────────────────────────────
set -uo pipefail
cd "$(dirname "$0")"
# shellcheck disable=SC1091
source contabo.local.sh
: "${REMOTE_DIR:=/home/psygames/web/psy-games.pro/public_html}"
REPO="donosov999-ai/psygames-native"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "── 1/2 · тяну артефакты последнего релиза ($REPO) ──"
gh release download --repo "$REPO" --dir "$TMP" --clobber \
  --pattern "PsyGames-macos-arm64.tar.gz" \
  --pattern "PsyGames-android.apk" \
  --pattern "PsyGames_*_x64-setup.exe" \
  --pattern "PsyGames_*_x64_en-US.msi"

# стабильные имена (ссылки на странице download/ постоянны)
for f in "$TMP"/PsyGames_*_x64-setup.exe;  do [ -e "$f" ] && mv -f "$f" "$TMP/PsyGames-windows-x64-setup.exe"; done
for f in "$TMP"/PsyGames_*_x64_en-US.msi;  do [ -e "$f" ] && mv -f "$f" "$TMP/PsyGames-windows-x64.msi"; done
echo "  файлы:"; ls -1sh "$TMP"

echo "── 2/2 · SFTP → $REMOTE_DIR/downloads/ ──"
if lftp -u "$SSH_USER","$SSH_PASS" "sftp://$SSH_HOST" -e "
      set sftp:auto-confirm yes; set net:timeout 60; set net:max-retries 2; set net:connection-limit 1;
      mkdir -f $REMOTE_DIR/downloads;
      mirror -R --no-perms $TMP/ $REMOTE_DIR/downloads/;
      bye"; then
  echo "  ✓ синхронизировано → https://psy-games.pro/downloads/"
else
  echo "  ✗ SFTP не прошёл — проверь SSH-креды/сеть"; exit 1
fi
