import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import {
    createMercadoPagoCheckout,
    createMercadoPagoReturnUrl,
    refreshMercadoPagoPayment,
} from "../../services/mercadoPagoService";

async function openPaymentBrowser(url, returnUrl) {
    if (!returnUrl) return WebBrowser.openBrowserAsync(url);
    return WebBrowser.openAuthSessionAsync(url, returnUrl);
}

export default function RidePaymentCard({ request, colors, typography, t, onPaid, onCancel, onError }) {
    const [checkoutUrl, setCheckoutUrl] = useState(null);
    const [status, setStatus] = useState("starting");
    const [paymentId, setPaymentId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const startedRef = useRef(false);
    const verifyingRef = useRef(false);
    const paidHandledRef = useRef(false);
    const returnUrlRef = useRef(null);

    const verifyPayment = useCallback(async () => {
        if (verifyingRef.current) return;
        verifyingRef.current = true;
        setBusy(true);
        setError(null);
        try {
            for (let attempt = 0; attempt < 20; attempt += 1) {
                const result = await refreshMercadoPagoPayment(request.id);
                setStatus(result.status);
                setPaymentId(result.paymentId || null);
                if (result.status === "paid") {
                    if (!paidHandledRef.current) {
                        paidHandledRef.current = true;
                        onPaid(request.id);
                    }
                    return;
                }
                if (result.status === "failed") {
                    setError(t("work.paymentFailed"));
                    return;
                }
                await new Promise((resolve) => setTimeout(resolve, 1500));
            }
            setError(t("work.paymentStillPending"));
        } catch (verificationError) {
            setError(verificationError.message || t("work.checkoutError"));
        } finally {
            verifyingRef.current = false;
            setBusy(false);
        }
    }, [onPaid, request.id, t]);

    const openCheckout = useCallback(async () => {
        setBusy(true);
        setError(null);
        setStatus("starting");
        let preferenceCreated = false;
        try {
            const returnUrl = createMercadoPagoReturnUrl();
            returnUrlRef.current = returnUrl;
            const checkout = await createMercadoPagoCheckout(request, returnUrl);
            preferenceCreated = true;
            setCheckoutUrl(checkout.checkoutUrl);
            setStatus("pending");
            await openPaymentBrowser(checkout.checkoutUrl, returnUrl);
            await verifyPayment();
        } catch (checkoutError) {
            const message = checkoutError.message || t("work.checkoutError");
            setError(message);
            if (!preferenceCreated) {
                setStatus("failed");
                onError(request.id, message);
            }
        } finally {
            setBusy(false);
        }
    }, [onError, request, t, verifyPayment]);

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;
        void openCheckout();
    }, [openCheckout]);

    useEffect(() => {
        if (!checkoutUrl || status !== "pending") return undefined;
        let active = true;
        const checkStatus = async () => {
            if (verifyingRef.current || paidHandledRef.current) return;
            verifyingRef.current = true;
            try {
                const result = await refreshMercadoPagoPayment(request.id);
                if (!active) return;
                setStatus(result.status);
                setPaymentId(result.paymentId || null);
                if (result.status === "paid") {
                    paidHandledRef.current = true;
                    setCheckoutUrl(null);
                    onPaid(request.id);
                } else if (result.status === "failed") {
                    setCheckoutUrl(null);
                    setError(t("work.paymentFailed"));
                }
            } catch {
                // Keep Checkout Pro open while the network or provider is slow.
            } finally {
                verifyingRef.current = false;
            }
        };
        const timer = setInterval(checkStatus, 5000);
        return () => {
            active = false;
            clearInterval(timer);
        };
    }, [checkoutUrl, onPaid, request.id, status, t]);

    const reopenCheckout = useCallback(async () => {
        if (!checkoutUrl || busy) return;
        setBusy(true);
        setError(null);
        try {
            const returnUrl = returnUrlRef.current || createMercadoPagoReturnUrl();
            returnUrlRef.current = returnUrl;
            await openPaymentBrowser(checkoutUrl, returnUrl);
            await verifyPayment();
        } catch (browserError) {
            setError(browserError.message || t("work.checkoutError"));
        } finally {
            setBusy(false);
        }
    }, [busy, checkoutUrl, t, verifyPayment]);

    async function handleCancel() {
        setBusy(true);
        setError(null);
        try {
            const result = await refreshMercadoPagoPayment(request.id);
            setStatus(result.status);
            setPaymentId(result.paymentId || null);
            if (result.status === "paid") {
                if (!paidHandledRef.current) {
                    paidHandledRef.current = true;
                    onPaid(request.id);
                }
                return;
            }
            if (result.paymentId && result.status !== "failed") {
                setError(t("work.paymentStillPending"));
                return;
            }
            onCancel();
        } catch (cancelError) {
            setError(cancelError.message || t("work.checkoutError"));
        } finally {
            setBusy(false);
        }
    }

    return (
        <View style={[styles.card, { backgroundColor: colors.card || colors.surface }]}>
            <View style={[styles.icon, { backgroundColor: colors.surface }]}>
                <Ionicons name="card-outline" size={23} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text, fontFamily: typography.bold }]}>
                {t("work.paymentRequired")}
            </Text>
            <Text style={[styles.caption, { color: colors.secondaryText }]}>
                {t("work.paymentBeforeTrip", { passenger: request.passengerName })}
            </Text>
            <Text style={[styles.amount, { color: colors.primary, fontFamily: typography.bold }]}>
                {t("work.earnings", { amount: (request.fare + (request.tip || 0)).toLocaleString("es-CO") })}
            </Text>
            <Text style={[styles.status, { color: status === "failed" ? (colors.danger || "#B42332") : colors.secondaryText }]}>
                {status === "starting" ? t("work.startingCheckout") : status === "paid" ? t("earnings.paymentStatus.paid") : status === "failed" ? t("work.paymentFailed") : t("work.waitingForPayment")}
            </Text>
            {status !== "paid" ? <Text style={[styles.checkoutHint, { color: colors.secondaryText }]}>{t("work.checkoutTestBuyerHint")}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {status !== "paid" ? (
                <View style={styles.actions}>
                    {status === "pending" ? (
                        <>
                            {checkoutUrl ? <Pressable disabled={busy} onPress={reopenCheckout} style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 }]}>
                                {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[styles.primaryText, { fontFamily: typography.bold }]}>{t("work.openCheckout")}</Text>}
                            </Pressable> : null}
                            <Pressable disabled={busy} onPress={verifyPayment} style={[styles.secondaryButton, { borderColor: colors.border, opacity: busy ? 0.6 : 1 }]}>
                                <Text style={[styles.secondaryText, { color: colors.text, fontFamily: typography.bold }]}>{t("work.verifyPayment")}</Text>
                            </Pressable>
                        </>
                    ) : (
                        <Pressable disabled={busy} onPress={openCheckout} style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 }]}>
                            {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[styles.primaryText, { fontFamily: typography.bold }]}>{t("work.retryPayment")}</Text>}
                        </Pressable>
                    )}
                    <Pressable disabled={busy || (status === "pending" && Boolean(paymentId))} onPress={handleCancel} style={[styles.cancelButton, (busy || (status === "pending" && Boolean(paymentId))) && styles.disabled]}>
                        <Text style={[styles.cancelText, { color: colors.secondaryText, fontFamily: typography.medium }]}>{t("work.cancelPayment")}</Text>
                    </Pressable>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 22, padding: 18, alignItems: "center", elevation: 7, shadowColor: "#111827", shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
    icon: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center", marginBottom: 8 },
    title: { fontSize: 17 },
    caption: { fontSize: 12, marginTop: 6, textAlign: "center" },
    amount: { fontSize: 22, marginTop: 10 },
    status: { fontSize: 12, marginTop: 9, textAlign: "center" },
    error: { color: "#B42332", fontSize: 11, marginTop: 7, textAlign: "center" },
    actions: { width: "100%", alignItems: "center", marginTop: 5 },
    primaryButton: { width: "100%", height: 44, borderRadius: 14, marginTop: 10, alignItems: "center", justifyContent: "center" },
    primaryText: { color: "#FFFFFF", fontSize: 14 },
    secondaryButton: { width: "100%", height: 42, borderWidth: 1, borderRadius: 14, marginTop: 10, alignItems: "center", justifyContent: "center" },
    secondaryText: { fontSize: 13 },
    cancelButton: { padding: 10, marginTop: 2 },
    disabled: { opacity: 0.45 },
    cancelText: { fontSize: 12 },
    checkoutHint: { fontSize: 11, marginTop: 8, lineHeight: 16, textAlign: "center" },
});
