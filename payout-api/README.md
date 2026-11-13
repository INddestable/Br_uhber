# Bruhber payout API (Cloudflare Free)

This Worker hosts only Mercado Pago OAuth and sandbox payouts. Firebase remains the source for authentication and completed trips. OAuth states, the verified Mercado Pago destination, and payout records are stored in Cloudflare D1 so Firebase can stay on Spark. The Worker validates Firebase ID tokens with Firebase Auth and reads the driver's trips through Firestore's REST API under the driver's existing Firestore rules.

Never put Mercado Pago secrets in the mobile app, `.env.local`, or `wrangler.toml`. Set them with `wrangler secret put`.

## First-time setup

1. Create a free Cloudflare account and enable a `workers.dev` subdomain in **Workers & Pages**. The Worker will use that public URL; no custom domain is needed.
2. In PowerShell, open this folder:

   `cd "C:\Users\kevin\Desktop\Yo\ING DE SOFTWARE TDEA\SEMESTRE 5\Desarrollo Movil\Bruhber\payout-api"`

3. Sign Wrangler into Cloudflare:

   `npx wrangler login`

4. Create the D1 database and copy the returned database ID into `wrangler.toml`, replacing `REPLACE_WITH_D1_DATABASE_ID`:

   `npx wrangler d1 create bruhber-payouts`

5. In `wrangler.toml`, replace `REPLACE_WITH_PUBLIC_FIREBASE_API_KEY` with the Firebase `apiKey` from `../src/config/firebase.js`. This Firebase web API key is public application configuration, not a Mercado Pago secret.
6. Create the D1 tables:

   `npx wrangler d1 migrations apply bruhber-payouts --remote`

7. Deploy once to obtain the Worker URL:

   `npx wrangler deploy`

8. Set the OAuth callback in `wrangler.toml` to the URL printed by Wrangler plus `/oauth/mercadopago/callback`. This project's deployed callback is:

   `MP_REDIRECT_URI = "https://bruhber-payout-api.kevinkarv77708.workers.dev/oauth/mercadopago/callback"`

9. From Mercado Pago Developers, use the app's Client ID and Client Secret, plus the Payouts test Access Token. Set each through the interactive prompts (do not put values after the command):

   `npx wrangler secret put MP_CLIENT_ID`

   `npx wrangler secret put MP_CLIENT_SECRET`

   `npx wrangler secret put MP_PAYOUTS_ACCESS_TOKEN`

10. In the Mercado Pago application's redirect URL list, register the exact callback URL from step 8 and enable OAuth PKCE S256. The OAuth exchange requests a sandbox seller token with `test_token: true`.
11. Deploy again so the callback URL change is active:

   `npx wrangler deploy`

12. In the project root, `.env.local` is configured to use `https://bruhber-payout-api.kevinkarv77708.workers.dev`. Restart Expo with `npx expo start -c`.

## Test flow

In the app, link a Colombian Mercado Pago seller test account using the Mercado Pago consent page. Payouts use the test Access Token as the source credential and the linked seller's verified email as recipient. The simulated trip balance is checked against the driver's own completed Firestore trips. Mercado Pago's asynchronous status is synchronized before the app labels a withdrawal as accredited.

The Free plan has quotas, including 100,000 Worker requests/day and D1 daily row limits. If a quota is exceeded, requests can fail until the quota resets. Review Cloudflare's current [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) before relying on the service.
