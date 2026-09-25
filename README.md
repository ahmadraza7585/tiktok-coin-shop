# TikTok Coin Shop (deployable)

A small Node.js + Express app: a TikTok coin shop storefront with a login
gate, TikTok username/profile-link search, coin bundles, a payment-method
page with styled cards, a coin-sending animation and a receipt page.

The profile lookup runs **server-side** (`GET /api/profile`), so the
visitor's browser never talks to TikTok directly.

## Run locally

```bash
npm install
node server.js
```

Then open http://localhost:3000

## Environment variables

| Var         | Default      | Purpose                              |
|-------------|--------------|--------------------------------------|
| `PORT`      | `3000`       | Port the server listens on           |
| `COIN_USER` | `admin`      | Username for the login gate          |
| `COIN_PASS` | `coinshop123`| Password for the login gate          |

Change `COIN_USER` / `COIN_PASS` in production (e.g. in the Render
dashboard under Environment). Passwords are compared with a
timing-safe hash comparison; successful logins get a random
in-memory session token.

## Deploy

See `DEPLOY-GUIDE.md` (Roman Urdu, step-by-step) for GitHub + Render.

## Notes

- TikTok sometimes blocks datacenter IP addresses, so the server-side
  profile lookup can fail intermittently on some hosts. There is no
  API key or paid service involved.
- Only dependency is `express`. Requires Node >= 18 (uses global `fetch`).
