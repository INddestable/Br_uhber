const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-max-age": "86400",
};
const RESERVED_WITHDRAWALS = ["processing", "approved", "review_required", "paid"];
const STATE_TTL_SECONDS = 600;
const FIRESTORE_RUN_QUERY = "https://firestore.googleapis.com/v1/projects/{project}/databases/(default)/documents:runQuery";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...CORS_HEADERS } });
}

function html(message, status = 200) {
  const safeMessage = String(message).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return new Response(`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Bruhber</title><body style="font:16px system-ui;max-width:34rem;margin:15vh auto;padding:1.5rem;color:#18202d"><h1>Bruhber</h1><p>${safeMessage}</p><p>Ya puedes regresar a la aplicación.</p></body></html>`, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'" },
  });
}

async function getFirebaseUser(request, env) {
  const authorization = request.headers.get("authorization") || "";
  const idToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!idToken) throw new ApiError(401, "Inicia sesión para continuar.");
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) throw new ApiError(401, "La sesión de Firebase no es válida.");
  const result = await response.json();
  const user = result.users?.[0];
  if (!user?.localId) throw new ApiError(401, "La sesión de Firebase no es válida.");
  return { uid: user.localId, idToken };
}

class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

async function mercadopagoFetch(path, options = {}) {
  const response = await fetch(`https://api.mercadopago.com${path}`, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error("MERCADOPAGO_API_ERROR");
    error.providerStatus = response.status;
    throw error;
  }
  return body;
}

async function createLink(request, env) {
  const user = await getFirebaseUser(request, env);
  const state = crypto.randomUUID() + crypto.randomUUID().replaceAll("-", "");
  const verifier = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
    .replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  await env.DB.prepare("INSERT INTO oauth_states (state, driver_uid, code_verifier, created_at) VALUES (?, ?, ?, ?)")
    .bind(state, user.uid, verifier, Math.floor(Date.now() / 1000)).run();
  const params = new URLSearchParams({
    client_id: env.MP_CLIENT_ID,
    response_type: "code",
    platform_id: "mp",
    redirect_uri: env.MP_REDIRECT_URI,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return json({ url: `https://auth.mercadopago.com/authorization?${params.toString()}` });
}

async function oauthCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (url.searchParams.has("error")) return html("No se autorizó el acceso a Mercado Pago. Puedes regresar a Bruhber e intentarlo de nuevo.", 400);
  if (!code || !state) return html("La solicitud de vinculación está incompleta.", 400);

  const stateRow = await env.DB.prepare("SELECT driver_uid, code_verifier, created_at FROM oauth_states WHERE state = ?")
    .bind(state).first();
  await env.DB.prepare("DELETE FROM oauth_states WHERE state = ?").bind(state).run();
  const now = Math.floor(Date.now() / 1000);
  if (!stateRow || stateRow.created_at + STATE_TTL_SECONDS < now) return html("Este enlace venció. Regresa a Bruhber e inicia la vinculación otra vez.", 400);

  try {
    const token = await mercadopagoFetch("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_id: env.MP_CLIENT_ID,
        client_secret: env.MP_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        code_verifier: stateRow.code_verifier,
        redirect_uri: env.MP_REDIRECT_URI,
        test_token: "true",
      }),
    });
    const profile = await mercadopagoFetch("/users/me", { headers: { authorization: `Bearer ${token.access_token}` } });
    const email = String(profile.email || "").trim().toLowerCase();
    if (!profile.id || !email || !token.access_token) throw new Error("INCOMPLETE_MP_ACCOUNT");
    await env.DB.prepare(`INSERT INTO payment_accounts (driver_uid, provider, account_email, mp_user_id, linked_at)
      VALUES (?, 'mercadopago', ?, ?, ?)
      ON CONFLICT(driver_uid) DO UPDATE SET account_email = excluded.account_email, mp_user_id = excluded.mp_user_id, linked_at = excluded.linked_at`)
      .bind(stateRow.driver_uid, email, String(profile.id), now).run();
    return html("Cuenta de Mercado Pago vinculada correctamente.");
  } catch (error) {
    console.error("Mercado Pago OAuth callback error", error.providerStatus || "unknown");
    return html("No pudimos vincular la cuenta. Revisa la configuración de OAuth y vuelve a intentarlo desde Bruhber.", 502);
  }
}

async function getData(request, env) {
  const user = await getFirebaseUser(request, env);
  const [account, result] = await Promise.all([
    env.DB.prepare("SELECT provider, account_email, mp_user_id, linked_at FROM payment_accounts WHERE driver_uid = ?").bind(user.uid).first(),
    env.DB.prepare("SELECT id, amount, currency, account_email, status, mode, created_at, provider_status, status_detail FROM withdrawals WHERE driver_uid = ? ORDER BY created_at DESC").bind(user.uid).all(),
  ]);
  return json({
    account: account ? { provider: account.provider, linked: true, accountEmail: account.account_email, mpUserId: account.mp_user_id, mode: "test", linkedAt: account.linked_at } : null,
    withdrawals: (result.results || []).map((row) => ({
      id: row.id, amount: row.amount, currency: row.currency, accountEmail: row.account_email,
      status: row.status, mode: row.mode, createdAt: row.created_at * 1000,
      providerStatus: row.provider_status, statusDetail: row.status_detail,
    })),
  });
}

function readField(fields, name) {
  const field = fields?.[name];
  if (!field) return null;
  if (Object.hasOwn(field, "stringValue")) return field.stringValue;
  if (Object.hasOwn(field, "integerValue")) return Number(field.integerValue);
  if (Object.hasOwn(field, "doubleValue")) return field.doubleValue;
  if (Object.hasOwn(field, "booleanValue")) return field.booleanValue;
  return null;
}

async function getDriverTrips(uid, idToken, env) {
  const endpoint = FIRESTORE_RUN_QUERY.replace("{project}", encodeURIComponent(env.FIREBASE_PROJECT_ID));
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { authorization: `Bearer ${idToken}`, "content-type": "application/json" },
    body: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: "trips" }],
      where: { fieldFilter: { field: { fieldPath: "driverId" }, op: "EQUAL", value: { stringValue: uid } } },
    } }),
  });
  if (!response.ok) throw new ApiError(502, "No se pudo consultar el saldo de viajes en Firebase.");
  const rows = await response.json();
  return rows.filter((row) => row.document).map((row) => {
    const fields = row.document.fields;
    return {
      status: readField(fields, "status"),
      paymentMethod: readField(fields, "paymentMethod"),
      paymentStatus: readField(fields, "paymentStatus"),
      payoutStatus: readField(fields, "payoutStatus"),
      commissionStatus: readField(fields, "commissionStatus"),
      driverEarnings: readField(fields, "driverEarnings"),
      commission: readField(fields, "commission"),
    };
  }).filter((trip) => trip.status === "completed");
}

async function payoutBalance(uid, idToken, env) {
  const [trips, result] = await Promise.all([
    getDriverTrips(uid, idToken, env),
    env.DB.prepare("SELECT amount, status FROM withdrawals WHERE driver_uid = ?").bind(uid).all(),
  ]);
  const earned = trips.reduce((sum, trip) => {
    if (trip.paymentMethod === "electronic" && trip.payoutStatus !== "paid") return sum + (Number.isSafeInteger(trip.driverEarnings) ? trip.driverEarnings : 0);
    if (trip.paymentMethod === "cash" && trip.commissionStatus !== "paid") return sum - (Number.isSafeInteger(trip.commission) ? trip.commission : 0);
    return sum;
  }, 0);
  const reserved = (result.results || []).filter((row) => RESERVED_WITHDRAWALS.includes(row.status))
    .reduce((sum, row) => sum + row.amount, 0);
  return Math.max(0, earned - reserved);
}

async function requestPayout(request, env) {
  const user = await getFirebaseUser(request, env);
  const input = await request.json().catch(() => ({}));
  const amount = input.amount;
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new ApiError(400, "El valor del retiro no es válido.");
  const account = await env.DB.prepare("SELECT account_email FROM payment_accounts WHERE driver_uid = ?").bind(user.uid).first();
  if (!account?.account_email) throw new ApiError(409, "Vincula primero tu cuenta de Mercado Pago.");

  const now = Math.floor(Date.now() / 1000);
  const lockId = crypto.randomUUID();
  const locked = await env.DB.prepare(`INSERT INTO payout_locks (driver_uid, locked_at) VALUES (?, ?)
    ON CONFLICT(driver_uid) DO UPDATE SET locked_at = excluded.locked_at WHERE payout_locks.locked_at < ?`)
    .bind(user.uid, now, now - 120).run();
  if (!locked.meta?.changes) throw new ApiError(409, "Ya hay un retiro procesándose. Espera un momento y vuelve a actualizar.");

  const withdrawalId = crypto.randomUUID();
  const idempotencyKey = crypto.randomUUID();
  try {
    const available = await payoutBalance(user.uid, user.idToken, env);
    if (amount > available) throw new ApiError(409, "El retiro supera tu saldo disponible.");
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO withdrawals (id, driver_uid, amount, currency, account_email, status, mode, idempotency_key, created_at, updated_at)
        VALUES (?, ?, ?, 'COP', ?, 'processing', 'test', ?, ?, ?)`)
        .bind(withdrawalId, user.uid, amount, account.account_email, idempotencyKey, now, now),
      env.DB.prepare("DELETE FROM payout_locks WHERE driver_uid = ?").bind(user.uid),
    ]);
  } catch (error) {
    await env.DB.prepare("DELETE FROM payout_locks WHERE driver_uid = ?").bind(user.uid).run();
    throw error;
  }

  try {
    const result = await mercadopagoFetch("/v1/payouts", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.MP_PAYOUTS_ACCESS_TOKEN}`,
        "content-type": "application/json",
        "X-test-token": "true",
        "X-Idempotency-Key": idempotencyKey,
        "X-enforce-signature": "false",
      },
      body: JSON.stringify({ external_reference: withdrawalId, transactions: [{
        type: "account", account: { email: account.account_email },
        amount: { currency: "COP", value: amount }, external_reference: withdrawalId,
      }] }),
    });
    if (!result.id) throw new Error("MISSING_PROVIDER_PAYOUT_ID");
    await env.DB.prepare(`UPDATE withdrawals SET provider_payout_id = ?, provider_transaction_id = ?, provider_status = ?, updated_at = ? WHERE id = ?`)
      .bind(String(result.id), result.transactions?.[0]?.id || null, result.status || "created", Math.floor(Date.now() / 1000), withdrawalId).run();
    return json({ id: withdrawalId, status: "processing" }, 202);
  } catch (error) {
    const definitive = error.providerStatus >= 400 && error.providerStatus < 500;
    await env.DB.prepare("UPDATE withdrawals SET status = ?, failure_code = ?, updated_at = ? WHERE id = ?")
      .bind(definitive ? "failed" : "review_required", definitive ? "provider_rejected" : "provider_response_unknown", Math.floor(Date.now() / 1000), withdrawalId).run();
    console.error("Mercado Pago payout request error", error.providerStatus || "unknown");
    throw new ApiError(502, definitive
      ? "Mercado Pago rechazó la solicitud. El saldo se liberó; revisa la configuración e inténtalo de nuevo."
      : "No pudimos confirmar el resultado. El importe queda reservado mientras verificas el estado del retiro.");
  }
}

async function syncPayouts(request, env) {
  const user = await getFirebaseUser(request, env);
  const result = await env.DB.prepare("SELECT id, provider_payout_id FROM withdrawals WHERE driver_uid = ? AND status = 'processing' LIMIT 10").bind(user.uid).all();
  for (const row of result.results || []) {
    if (!row.provider_payout_id) continue;
    try {
      const response = await mercadopagoFetch(`/v1/payouts/${encodeURIComponent(row.provider_payout_id)}/transactions`, {
        headers: { authorization: `Bearer ${env.MP_PAYOUTS_ACCESS_TOKEN}`, "X-test-token": "true" },
      });
      const transaction = response.transactions?.find((item) => item.external_reference === row.id) || response.transactions?.[0];
      if (!transaction) continue;
      const status = transaction.status === "success" ? "paid"
        : ["error", "failed", "cancelled"].includes(transaction.status) ? "failed" : "processing";
      await env.DB.prepare("UPDATE withdrawals SET status = ?, provider_status = ?, status_detail = ?, updated_at = ? WHERE id = ?")
        .bind(status, transaction.status || null, transaction.status_detail || null, Math.floor(Date.now() / 1000), row.id).run();
    } catch (error) {
      console.error("Payout status check failed", error.providerStatus || "unknown");
    }
  }
  return json({ checked: result.results?.length || 0 });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
    const url = new URL(request.url);
    try {
      if (request.method === "GET" && url.pathname === "/health") return json({ ok: true });
      if (request.method === "GET" && url.pathname === "/oauth/mercadopago/callback") return await oauthCallback(request, env);
      if (request.method === "POST" && url.pathname === "/v1/mercadopago/link") return await createLink(request, env);
      if (request.method === "GET" && url.pathname === "/v1/me") return await getData(request, env);
      if (request.method === "POST" && url.pathname === "/v1/payouts") return await requestPayout(request, env);
      if (request.method === "POST" && url.pathname === "/v1/payouts/sync") return await syncPayouts(request, env);
      return json({ error: "NOT_FOUND" }, 404);
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 500;
      if (!(error instanceof ApiError)) console.error("Payout API error", error?.message || "unknown");
      return json({ error: error.message || "INTERNAL_ERROR" }, status);
    }
  },
};
