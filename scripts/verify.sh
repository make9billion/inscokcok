#!/usr/bin/env bash
set -euo pipefail

run_if_exists() {
  local description="$1"
  local path="$2"
  shift 2

  if [[ -e "$path" ]]; then
    echo "==> $description"
    "$@"
  else
    echo "==> Skipping $description; missing $path"
  fi
}

run_if_exists "PHP dependency check" "composer.json" composer validate --strict
run_if_exists "Laravel tests" "artisan" php artisan test
run_if_exists "Frontend build" "package.json" npm run build

if [[ -e "playwright.config.ts" || -e "playwright.config.js" ]]; then
  echo "==> Playwright tests"
  npx playwright test
else
  echo "==> Skipping Playwright tests; missing playwright config"
fi

