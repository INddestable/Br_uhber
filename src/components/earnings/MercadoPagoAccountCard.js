import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MercadoPagoAccountCard({ account, busy, error, onLink, colors, typography, t }) {
    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.heading}>
                <View style={[styles.icon, { backgroundColor: colors.surface }]}><Ionicons name="card-outline" size={20} color={colors.primary} /></View>
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
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {account?.linked ? <Text style={[styles.helper, { color: colors.secondaryText }]}>{t("earnings.payout.directPayment")}</Text> : null}
            <Pressable accessibilityRole="button" disabled={busy} onPress={onLink} style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 }]}>
                {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[styles.buttonText, { fontFamily: typography.bold }]}>{t(account?.linked ? "earnings.payout.relinkAccount" : "earnings.payout.linkAccount")}</Text>}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { borderWidth: 1, borderRadius: 18, padding: 15, marginTop: 12 },
    heading: { flexDirection: "row", alignItems: "center", gap: 10 },
    icon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 15 },
    caption: { fontSize: 11, marginTop: 3 },
    accountRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 11, borderRadius: 13, marginTop: 13 },
    accountLabel: { fontSize: 12 },
    accountEmail: { fontSize: 11, marginTop: 2 },
    primaryButton: { minHeight: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, marginTop: 12 },
    buttonText: { color: "#FFFFFF", fontSize: 13, textAlign: "center" },
    error: { color: "#B42332", fontSize: 11, marginTop: 8 },
    helper: { fontSize: 11, marginTop: 12, lineHeight: 16 },
});
