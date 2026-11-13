import { AppState } from "react-native";
import { auth } from "../config/firebase";

const API_BASE_URL = (process.env.EXPO_PUBLIC_PAYOUT_API_URL || "").replace(/\/$/, "");

async function request(path, { method = "GET", body } = {}) {
    if (!API_BASE_URL) throw new Error("PAYOUT_API_NOT_CONFIGURED");
    const user = auth.currentUser;
    if (!user) throw new Error("PAYOUT_DRIVER_REQUIRED");
    const token = await user.getIdToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "PAYOUT_API_ERROR");
    return payload;
}

export async function startMercadoPagoLink() {
    const result = await request("/v1/mercadopago/link", { method: "POST", body: {} });
    return result.url;
}

export async function requestMercadoPagoPayout(amount) {
    return request("/v1/payouts", { method: "POST", body: { amount } });
}

export async function refreshMercadoPagoData() {
    return request("/v1/me");
}

export async function syncMercadoPagoPayouts() {
    return request("/v1/payouts/sync", { method: "POST", body: {} });
}

export function subscribeToMercadoPagoData(uid, onData, onError) {
    if (!uid) return () => {};
    let active = true;
    const load = () => refreshMercadoPagoData().then((data) => {
        if (active) onData(data);
    }).catch((error) => {
        if (active) onError(error);
    });
    load();
    const appStateSubscription = AppState.addEventListener("change", (state) => {
        if (state === "active") load();
    });
    return () => {
        active = false;
        appStateSubscription.remove();
    };
}
