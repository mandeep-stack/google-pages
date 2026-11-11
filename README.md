# lp.adcomp.xyz — Google Ads landing pages

One campaign, two ad groups, one conversion (the thank-you page).

| URL | File | Ad group | Conversion |
|---|---|---|---|
| `/speed` | `speed.html` | Speed | Successful ₹199 payment → `/thankyou?src=speed&pid=…` (value 199) |
| `/pixel` | `pixel.html` | Pixel | Successful ₹99 payment → `/thankyou?src=pixel` (value 99) |
| `/thankyou` | `thankyou.html` | — | Fires the single Google Ads conversion + TidyCal booking embed |

These are copies of the Meta pages with all Meta code removed (pixel, CAPI, GTM).

## Before going live
1. **Google Ads IDs** — done: tag `AW-319782139`, conversion label `UpmeCNG0r7YdEPv5vZgB` (in all 3 pages).
2. **Pixel payment link** — create a NEW Razorpay payment page for the Google copy, with post-payment redirect
   `https://lp.adcomp.xyz/thankyou?src=pixel`, and set as `PAY_URL` in `pixel.html` (done: `https://rzp.io/rzp/google-pixel`).
3. **audit-worker** — apply `docs/audit-worker-google-source.patch` to `adcomp-speed-funnel/audit-worker/worker.js`
   and redeploy `adcomp-audit-worker`. It (a) allows `https://lp.adcomp.xyz` through CORS and (b) stops Google-sourced
   payments being sent to Meta as Purchases.
4. **Turnstile** — add `lp.adcomp.xyz` to the allowed hostnames of the Turnstile widget used on the speed page.
5. **Speed API CORS** — `speed.html` calls `https://speed.adcomp.xyz/api/pagespeed` and `/api/submit-report`
   cross-origin. Confirm they answer with CORS for `https://lp.adcomp.xyz` (the Pages `_worker.js` does with `*`; the
   zone-level worker that currently intercepts those routes must too).
6. **Cloudflare Pages** — connect this repo, then add custom domain `lp.adcomp.xyz`.

## Test (before spending)
- `/speed`: check score → open the ₹199 popup → pay with a test payment → lands on `/thankyou?src=speed&pid=…`.
- `/thankyou?src=speed&pid=test1` in Google Tag Assistant: exactly one conversion event; reload = none; no `src` = none.
- TidyCal calendar (`mandeep2/adcomp-discovery-call`) loads on `/thankyou` (a fallback link sits under it).
- In Google Ads → Conversions, status becomes "Recording conversions".


## Score check
The live score check calls `GET /pagespeed` on the audit worker (`docs/audit-worker-with-pagespeed.js`). Add the secret `PAGESPEED_API_KEY` to that worker. This Cloudflare project is static-assets-only, so it cannot hold variables.
