# Cloudflare API Token — Required Permissions

The `Deploy (Cloudflare Pages)` GitHub Actions workflow authenticates to
Cloudflare with the `CLOUDFLARE_API_TOKEN` repository secret. If that token is
missing any of the scopes below, the deploy fails — often **late**, during the
`wrangler pages deploy` step, with a misleading error.

## Required scopes

| Scope | Type | Why it is needed |
|-------|------|------------------|
| **Cloudflare Pages → Edit** | Account | Create/update the `tripandtick` Pages project and upload the build. |
| **User Details → Read** | User | `wrangler` resolves the token owner's email before deploying. Missing this is the cause of `Authentication error [code: 10000]` / *"Unable to retrieve email for this user"*. |
| **Account Settings → Read** | Account | Resolve the account referenced by `CLOUDFLARE_ACCOUNT_ID`. |

## How to create the token

1. Cloudflare Dashboard → **My Profile → API Tokens → Create Token**.
2. Use the **`Edit Cloudflare Pages`** template (this grants *Cloudflare Pages: Edit*
   + *Account Settings: Read*).
3. **Add a permission row:** `User` → `User Details` → `Read`.
   The template does **not** include this, and it is the scope most often missing.
4. Account Resources → restrict to the account that owns `tripandtick`.
5. Create the token and copy it once.
6. GitHub → repo **Settings → Secrets and variables → Actions** → update
   `CLOUDFLARE_API_TOKEN`. Also confirm `CLOUDFLARE_ACCOUNT_ID` is set.

## Editing an existing token

Cloudflare Dashboard → My Profile → API Tokens → edit the deploy token →
add `User → User Details → Read` → save. No code change can fix this; the
permission lives only in the Cloudflare dashboard.

## Pre-flight check

`deploy.yml` runs a *Verify Cloudflare token permissions* step before building.
It calls:

- `GET /user/tokens/verify` → token is active.
- `GET /user` → returns `200` **only** when `User Details: Read` is present.
- `GET /accounts/<CLOUDFLARE_ACCOUNT_ID>/pages/projects` → returns `200` **only**
  when the token has `Cloudflare Pages: Edit` for this account (the exact endpoint
  `wrangler pages deploy` hits). Catches a missing Pages scope, an account-resource
  scope that excludes this account, or a wrong `CLOUDFLARE_ACCOUNT_ID`.

A non-200 from any probe fails the job early with an actionable message instead of
wasting a full build on a token that cannot deploy.
