#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/bohumcc}"
PHP_BIN="${PHP_BIN:-php}"
NODE_ENV="${NODE_ENV:-production}"

log() {
    printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1"
}

if [ ! -d "$APP_DIR" ]; then
    echo "배포 경로를 찾을 수 없습니다: $APP_DIR"
    echo "예: APP_DIR=/var/www/bohumcc bash scripts/deploy.sh"
    exit 1
fi

cd "$APP_DIR"

log "최신 코드 가져오기"
git pull

log "PHP 패키지 설치"
composer install --no-dev --optimize-autoloader

log "Node 패키지 설치"
npm ci

log "프론트엔드 빌드"
NODE_ENV="$NODE_ENV" npm run build

log "DB 마이그레이션"
"$PHP_BIN" artisan migrate --force

log "기본 이벤트 데이터 동기화"
"$PHP_BIN" artisan db:seed --class=EventSeeder --force

log "스토리지 링크 확인"
"$PHP_BIN" artisan storage:link || true

log "Laravel 캐시 초기화"
"$PHP_BIN" artisan optimize:clear

log "Laravel 운영 캐시 생성"
"$PHP_BIN" artisan config:cache
"$PHP_BIN" artisan route:cache
"$PHP_BIN" artisan view:cache

log "권한 정리"
if command -v sudo >/dev/null 2>&1; then
    sudo chown -R www-data:www-data storage bootstrap/cache
else
    chown -R www-data:www-data storage bootstrap/cache
fi

log "배포 완료"
