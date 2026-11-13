import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const money = (amount) => `$${Math.max(0, amount).toLocaleString("es-CO")} COP`;

export default function PayoutCard({ account, withdrawals, availableBalance, busy, error, onLink, onWithdraw, colors, typography, t }) {
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [localError, setLocalError] = useState(null);

    async function linkAccount() {
        setLocalError(null);
        try { await onLink(); }
        catch { setLocalError(t("earnings.payout.linkError")); }
    }

    async function confirmWithdrawal() {
        setLocalError(null);
        try {
            await onWithdraw(availableBalance);
            setConfirmVisible(false);
        } catch {
            setLocalError(t("earnings.payout.withdrawError"));
        }
    }

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.heading}>
                <View style={[styles.icon, { backgroundColor: colors.surface }]}><Ionicons name="wallet-outline" size={20} color={colors.primary} /></View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: colors.text, fontFamily: typography.bold }]}>{t("earnings.payout.title")}</Text>
                    <Text style={[styles.caption, { color: colors.secondaryText }]}>{t("earnings.payout.testMode")}</Text>
                </View>
            </View>

            {account?.linked ? (
                <View style={[styles.accountRow, { backgroundColor: colors.surface }]}>
                    <Ionicons name="checkmark-circle" size={18} color="#1B9A67" />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.accountLabel, { color: colors.text, fontFamily: typography.medium }]}>{t("earnings.payout.linkedAccount")}</Text>
                        <Text numberOfLines={1} style={[styles.accountEmail, { color: colors.secondaryText }]}>{account.accountEmail}</Text>
                    </View>
                </View>
            ) : null}

            {error || localError ? <Text style={styles.error}>{localError || error}</Text> : null}
            <Pressable accessibilityRole="button" disabled={busy || Boolean(account?.linked && availableBalance <= 0)}
                onPress={() => account?.linked ? setConfirmVisible(true) : linkAccount()}
                style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: busy || Boolean(account?.linked && availableBalance <= 0) ? 0.55 : 1 }]}>
                {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[styles.buttonText, { fontFamily: typography.bold }]}>{account?.linked ? (availableBalance > 0 ? t("earnings.payout.withdraw") : t("earnings.payout.noBalance")) : t("earnings.payout.linkAccount")}</Text>}
            </Pressable>

            {withdrawals.length ? (
                <View style={[styles.recent, { borderTopColor: colors.border }]}>
                    <Text style={[styles.recentTitle, { color: colors.secondaryText }]}>{t("earnings.payout.recent")}</Text>
                    {withdrawals.slice(0, 3).map((withdrawal) => (
                        <View key={withdrawal.id} style={styles.recentRow}>
                            <Text style={[styles.recentDate, { color: colors.secondaryText }]}>{new Date(withdrawal.createdAt).toLocaleDateString()}</Text>
                            <Text style={[styles.recentAmount, { color: colors.text, fontFamily: typography.bold }]}>{money(withdrawal.amount)}</Text>
                            <Text style={styles.statusTag}>{t(`earnings.payout.status.${withdrawal.status}`, { defaultValue: withdrawal.status })}</Text>
                        </View>
                    ))}
                </View>
            ) : null}

            <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
                <View style={styles.backdrop}>
                    <View style={[styles.modal, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.bold }]}>{t("earnings.payout.confirmTitle")}</Text>
                        <Text style={[styles.confirmAmount, { color: colors.primary, fontFamily: typography.bold }]}>{money(availableBalance)}</Text>
                        <Text style={[styles.modalCopy, { color: colors.secondaryText }]}>{t("earnings.payout.confirmDescription", { amount: money(availableBalance), email: account?.accountEmail })}</Text>
                        <Text style={styles.demoWarning}>{t("earnings.payout.testWarning")}</Text>
                        {localError ? <Text style={styles.error}>{localError}</Text> : null}
                        <View style={styles.modalActions}>
                            <Pressable onPress={() => setConfirmVisible(false)} style={[styles.secondaryButton, { borderColor: colors.border }]}><Text style={{ color: colors.secondaryText }}>{t("earnings.payout.cancel")}</Text></Pressable>
                            <Pressable disabled={busy} onPress={confirmWithdrawal} style={[styles.primaryButton, { backgroundColor: colors.primary, flex: 1 }]}>
                                {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[styles.buttonText, { fontFamily: typography.bold }]}>{t("earnings.payout.confirmWithdraw")}</Text>}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { borderWidth: 1, borderRadius: 18, padding: 15, marginTop: 12 },
    heading: { flexDirection: "row", alignItems: "center", gap: 10 },
    icon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 15 }, caption: { fontSize: 11, marginTop: 3 },
    accountRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 11, borderRadius: 13, marginTop: 13 },
    accountLabel: { fontSize: 12 }, accountEmail: { fontSize: 11, marginTop: 2 },
    primaryButton: { minHeight: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, marginTop: 12 },
    buttonText: { color: "#FFFFFF", fontSize: 13, textAlign: "center" },
    recent: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 12, paddingTop: 10 }, recentTitle: { fontSize: 10, marginBottom: 6 },
    recentRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 5 }, recentDate: { flex: 1, fontSize: 10 }, recentAmount: { fontSize: 11 },
    statusTag: { color: "#895A08", backgroundColor: "#FFF2CC", overflow: "hidden", borderRadius: 7, paddingHorizontal: 6, paddingVertical: 3, fontSize: 9 },
    error: { color: "#B42332", fontSize: 11, marginTop: 8 }, backdrop: { flex: 1, backgroundColor: "#00000077", justifyContent: "center", padding: 20 },
    modal: { padding: 18, borderRadius: 18 }, modalTitle: { fontSize: 18 }, modalCopy: { fontSize: 13, lineHeight: 19, marginTop: 8 },
    modalActions: { flexDirection: "row", gap: 9, alignItems: "center", marginTop: 12 }, secondaryButton: { minHeight: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, justifyContent: "center", alignItems: "center" },
    confirmAmount: { fontSize: 25, marginTop: 10 }, demoWarning: { color: "#895A08", backgroundColor: "#FFF2CC", borderRadius: 10, padding: 10, fontSize: 11, lineHeight: 16, marginTop: 12 },
});
