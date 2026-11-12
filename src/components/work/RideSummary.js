import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RideSummary({ request, colors, typography, t, onClose }) {
    return (
        <View style={[styles.card, { backgroundColor: colors.card || colors.surface }]}>
            <View style={[styles.icon, { backgroundColor: "#E7F6EE" }]}><Ionicons name="checkmark" size={25} color="#23A675" /></View>
            <Text style={[styles.title, { color: colors.text, fontFamily: typography.bold }]}>{t("work.rideCompleted")}</Text>
            <Text style={[styles.caption, { color: colors.secondaryText }]}>{request.passenger?.name || request.passengerName} · {t("work.tripDistance", { distance: request.distanceKm })} · {t("work.duration", { duration: request.durationMin })}</Text>
            <Text style={[styles.earnings, { color: colors.primary, fontFamily: typography.bold }]}>{t("work.earnings", { amount: request.fare.toLocaleString("es-CO") })}</Text>
            <Text style={[styles.caption, { color: colors.secondaryText }]}>{t("earnings.net")}: {t("work.earnings", { amount: request.driverEarnings.toLocaleString("es-CO") })}</Text>
            <Pressable onPress={onClose} style={[styles.button, { backgroundColor: colors.primary }]}><Text style={[styles.buttonText, { fontFamily: typography.bold }]}>{t("work.continueSearching")}</Text></Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 22, padding: 18, alignItems: "center", elevation: 7, shadowColor: "#111827", shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
    icon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", marginBottom: 8 },
    title: { fontSize: 18 },
    caption: { fontSize: 12, marginTop: 6, textAlign: "center" },
    earnings: { fontSize: 22, marginTop: 10 },
    button: { width: "100%", height: 44, borderRadius: 14, marginTop: 14, alignItems: "center", justifyContent: "center" },
    buttonText: { color: "#FFFFFF", fontSize: 14 },
});
