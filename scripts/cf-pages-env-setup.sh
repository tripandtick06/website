#!/usr/bin/env bash
# CF Pages env-var bulk-set via wrangler CLI.
#
# Usage:
#   1. cp .env.local .env.prod   (sonra .env.prod'i live degerlerle doldur)
#   2. export $(grep -v '^#' .env.prod | xargs -d '\n')   (env-var'lari shell'e yukle)
#   3. bash scripts/cf-pages-env-setup.sh
#
# Pre-req:
#   - wrangler login  (ilk kez)
#   - CF Pages project name: tripandtick (degisiklikse PROJECT degisken)
#
# NOT: Bu script tek-tek `wrangler pages secret put` komutu calistirir.
# Her komut interactive deger sorar — STDIN'e env-var'dan deger pipe edilir.

set -euo pipefail

PROJECT="${CF_PAGES_PROJECT:-tripandtick}"

# Plain (encrypt YOK)
PLAIN_KEYS=(
  "NEXT_PUBLIC_SITE_URL"
  "NEXT_PUBLIC_DEFAULT_LOCALE"
  "NEXT_PUBLIC_IYZICO_ENABLED"
  "NEXT_PUBLIC_ADMIN_TOKEN"
  "BREVO_FROM_EMAIL"
  "BREVO_FROM_NAME"
  "BREVO_TO_EMAIL"
  "ADMIN_EMAIL"
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SEO_AGENT_CRON"
  "SEO_AGENT_AUTO_PUBLISH"
  "IYZICO_BASE_URL"
  "INDEXNOW_KEY"
  "NEXT_PUBLIC_GA_ID"
  "NEXT_PUBLIC_GSC_VERIFICATION"
  "NEXT_PUBLIC_BING_VERIFICATION"
  "NEXT_PUBLIC_YANDEX_VERIFICATION"
)

# Secret (encrypted)
SECRET_KEYS=(
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "IYZICO_API_KEY"
  "IYZICO_SECRET"
  "ADMIN_API_TOKEN"
  "RESCHEDULE_SECRET"
  "BREVO_API_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "CRON_SECRET"
  "ANTHROPIC_API_KEY"
  "GOOGLE_AI_API_KEY"
)

echo "== CF Pages env-var bulk-set =="
echo "Project: ${PROJECT}"
echo "Environment: production"
echo

set_value() {
  local key="$1"
  local val="${!key:-}"
  if [[ -z "${val}" ]]; then
    echo "  [skip] ${key} (env-var lokal yuklu degil)"
    return
  fi
  echo "  [set]  ${key}"
  printf '%s' "${val}" | npx wrangler pages secret put "${key}" --project-name="${PROJECT}" >/dev/null 2>&1 || {
    echo "  [FAIL] ${key} — wrangler hata"
  }
}

echo "-- Plain (Pages dashboard'da Encrypted yapilmayan) --"
for k in "${PLAIN_KEYS[@]}"; do
  set_value "${k}"
done

echo
echo "-- Secret (Encrypted) --"
for k in "${SECRET_KEYS[@]}"; do
  set_value "${k}"
done

echo
echo "Bitti. Dashboard'da verify: dash.cloudflare.com -> Workers & Pages -> ${PROJECT} -> Settings -> Environment Variables"
