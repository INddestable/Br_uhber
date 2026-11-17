import { AppState, Platform } from "react-native";
import * as Linking from "expo-linking";
import { auth } from "../config/firebase";

const API_BASE_URL = (process.env.EXPO_PUBLIC_PAYOUT_API_URL || "").replace(/\/$/, "");

async function request(path, { method = "GET", body } = {}) {
    if (!API_BASE_URL) throw new Error("PAYOUT_API_NOT_CONFIGURED");
    const user = auth.currentUser;
    if (!user) throw new Error("PAYOUT_DRIVER_REQUIRED");
    const token = await user.getIdToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
            authorization: `Bearer ${token}`,
            "content-type": "application/json",
            "ngrok-skip-browser-warning": "true",
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "PAYOUT_API_ERROR");
    return payload;
}

export async function startMercadoPagoLink() {
    return request("/v1/mercadopago/link", { method: "POST", body: {} });
}

export async function refreshMercadoPagoData() {
    return request("/v1/me");
}

export function createMercadoPagoReturnUrl() {
    return Platform.OS === "web" ? null : Linking.createURL("checkout/return");
}

export async function createMercadoPagoCheckout(trip, returnUrl = createMercadoPagoReturnUrl()) {
    return request("/v1/checkout", {
        method: "POST",
        body: {
            tripId: trip.id,
            distanceKm: trip.tripDistance,
            durationMin: trip.estimatedDuration,
            category: trip.category,
            tip: trip.tip || 0,
            returnUrl,
        },
    });
}

export async function refreshMercadoPagoPayment(tripId) {
    return request(`/v1/payments/status?tripId=${encodeURIComponent(tripId)}`);
}

export async function refreshMercadoPagoPayments() {
    return request("/v1/payments");
}

export function subscribeToMercadoPagoPayments(uid, onPayments, onError) {
    if (!uid) return () => {};
    let active = true;
    let timer;
    const load = () => refreshMercadoPagoPayments().then(({ payments }) => {
        if (active) onPayments(payments || []);
    }).catch((error) => {
        if (active) onError(error);
    });
    load();
    timer = setInterval(load, 15_000);
    const appStateSubscription = AppState.addEventListener("change", (state) => {
        if (state === "active") load();
    });
    return () => {
        active = false;
        clearInterval(timer);
        appStateSubscription.remove();
    };
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
