# go.adcomp.xyz — Google Ads landing pages

One campaign, two ad groups, one conversion (the thank-you page).

| URL | File | Ad group | Conversion |
|---|---|---|---|
| `/speed` | `speed.html` | Speed | Successful ₹199 payment → `/thankyou?src=speed&pid=…` (value 199) |
| `/pixel` | `pixel.html` | Pixel | Successful ₹99 payment → `/thankyou?src=pixel` (value 99) |
| `/thankyou` | `thankyou.html` | — | Fires the single Google Ads conversion + NeetoCal booking embed |

These are copies of the Meta pages with all Meta code removed (pixel, CAPI, GTM).

## Before going live
1. **Google Ads IDs** — replace `AW-XXXXXXXXX` (all 3 pages) and `YOUR_LABEL` (`thankyou.html`).
2. **Pixel payment link** — create a NEW Razorpay payment page for the Google copy, with post-payment redirect
   `https://go.adcomp.xyz/thankyou?src=pixel`, and set it as `PAY_URL` in `pixel.html`. Don't edit the Meta one.
3. **audit-worker** — apply `docs/audit-worker-google-source.patch` to `adcomp-speed-funnel/audit-worker/worker.js`
   and redeploy `adcomp-audit-worker`. It (a) allows `https://go.adcomp.xyz` through CORS and (b) stops Google-sourced
   payments being sent to Meta as Purchases.
4. **Turnstile** — add `go.adcomp.xyz` to the allowed hostnames of the Turnstile widget used on the speed page.
5. **Speed API CORS** — `speed.html` calls `https://speed.adcomp.xyz/api/pagespeed` and `/api/submit-report`
   cross-origin. Confirm they answer with CORS for `https://go.adcomp.xyz` (the Pages `_worker.js` does with `*`; the
   zone-level worker that currently intercepts those routes must too).
6. **Cloudflare Pages** — connect this repo, then add custom domain `go.adcomp.xyz`.

## Test (before spending)
- `/speed`: check score → open the ₹199 popup → pay with a test payment → lands on `/thankyou?src=speed&pid=…`.
- `/thankyou?src=speed&pid=test1` in Google Tag Assistant: exactly one conversion event; reload = none; no `src` = none.
- Calendar iframe loads on `/thankyou` (fallback link is under it if NeetoCal blocks framing).
- In Google Ads → Conversions, status becomes "Recording conversions".
