import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WorkHeader({ online, busy, paymentPending, loading, colors, typography, t, onToggle }) {
    const status = paymentPending ? t("work.waitingForPayment") : busy ? t("work.tripInProgress") : online ? t("work.searching") : t("work.disconnected");
    const blocked = busy || paymentPending;

    return (
        <View style={[styles.card, { backgroundColor: colors.card || colors.surface }]}>
            <View style={styles.copy}>
                <View style={styles.statusRow}>
                    <View style={[styles.dot, { backgroundColor: online ? "#23A675" : colors.secondaryText }]} />
                    <Text style={[styles.status, { color: colors.text, fontFamily: typography.bold }]}>{status}</Text>
                </View>
                <Text style={[styles.caption, { color: colors.secondaryText, fontFamily: typography.regular }]}>
                    {blocked ? t("work.keepGoing") : online ? t("work.waitingForRide") : t("work.connectPrompt")}
                </Text>
            </View>
            <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: online, disabled: loading || blocked }}
                accessibilityLabel={online ? t("work.goOffline") : t("work.goOnline")}
                disabled={loading || blocked}
                onPress={onToggle}
                style={[styles.button, { backgroundColor: online ? "#E8EDF7" : colors.primary, opacity: loading || blocked ? 0.55 : 1 }]}
            >
                <Ionicons name={online ? "pause" : "power"} size={18} color={online ? colors.text : "#FFFFFF"} />
                <Text style={[styles.buttonText, { color: online ? colors.text : "#FFFFFF", fontFamily: typography.bold }]}>
                    {online ? t("work.disconnect") : t("work.connect")}
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { minHeight: 86, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between", elevation: 5, shadowColor: "#111827", shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
    copy: { flex: 1, paddingRight: 10 },
    statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    dot: { width: 9, height: 9, borderRadius: 5 },
    status: { fontSize: 15 },
    caption: { fontSize: 12, marginTop: 5 },
    button: { height: 44, minWidth: 105, paddingHorizontal: 14, borderRadius: 14, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
    buttonText: { fontSize: 13 },
});
