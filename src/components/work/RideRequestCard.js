import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function Detail({ icon, value, colors, typography }) {
    return <View style={styles.detail}><Ionicons name={icon} size={16} color={colors.primary} /><Text style={[styles.detailText, { color: colors.text, fontFamily: typography.medium }]}>{value}</Text></View>;
}

export default function RideRequestCard({ request, seconds, colors, typography, t, onAccept, onReject }) {
    return (
        <View style={[styles.card, { backgroundColor: colors.card || colors.surface }]}>
            <View style={styles.heading}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}><Ionicons name="person" size={20} color="#FFFFFF" /></View>
                <View style={styles.passenger}>
                    <Text style={[styles.title, { color: colors.text, fontFamily: typography.bold }]}>{request.passengerName}</Text>
                    <Text style={[styles.rating, { color: colors.secondaryText }]}><Ionicons name="star" size={13} color="#F2AF28" /> {request.passengerRating.toFixed(1)} · {t(`work.payment.${request.paymentMethod}`)} · {t(`vehicle.categories.${request.category}`)}</Text>
                </View>
                <View style={[styles.timer, { backgroundColor: colors.surface }]}><Ionicons name="time-outline" size={15} color={colors.primary} /><Text style={[styles.timerText, { color: colors.text, fontFamily: typography.bold }]}>{seconds}s</Text></View>
            </View>
            <View style={styles.details}>
                <Detail icon="navigate-outline" value={t("work.pickupDistance", { distance: request.pickupDistance })} colors={colors} typography={typography} />
                <Detail icon="map-outline" value={t("work.tripDistance", { distance: request.tripDistance })} colors={colors} typography={typography} />
                <Detail icon="time-outline" value={t("work.duration", { duration: request.estimatedDuration })} colors={colors} typography={typography} />
            </View>
            <View style={styles.footer}>
                <View>
                    <Text style={[styles.earnings, { color: colors.text, fontFamily: typography.bold }]}>{t("work.earnings", { amount: request.fare.toLocaleString("es-CO") })}</Text>
                    {request.tip > 0 ? <Text style={[styles.tip, { color: colors.secondaryText }]}>{t("work.tip", { amount: request.tip.toLocaleString("es-CO") })}</Text> : null}
                </View>
                <View style={styles.actions}>
                    <Pressable onPress={onReject} accessibilityRole="button" style={[styles.reject, { borderColor: colors.border }]}><Text style={[styles.rejectText, { color: colors.secondaryText, fontFamily: typography.bold }]}>{t("work.reject")}</Text></Pressable>
                    <Pressable onPress={onAccept} accessibilityRole="button" style={[styles.accept, { backgroundColor: colors.primary }]}><Text style={[styles.acceptText, { fontFamily: typography.bold }]}>{t("work.accept")}</Text></Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 22, padding: 18, elevation: 7, shadowColor: "#111827", shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
    heading: { flexDirection: "row", alignItems: "center" },
    avatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
    passenger: { flex: 1, marginLeft: 11 },
    title: { fontSize: 17 },
    rating: { marginTop: 4, fontSize: 12 },
    timer: { flexDirection: "row", gap: 4, alignItems: "center", paddingHorizontal: 9, paddingVertical: 7, borderRadius: 12 },
    timerText: { fontSize: 13 },
    details: { flexDirection: "row", flexWrap: "wrap", rowGap: 9, justifyContent: "space-between", marginTop: 18, marginBottom: 16 },
    detail: { flexDirection: "row", alignItems: "center", gap: 5 },
    detailText: { fontSize: 11 },
    footer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#D9DEE8", paddingTop: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    earnings: { fontSize: 17 },
    tip: { fontSize: 11, marginTop: 3 },
    actions: { flexDirection: "row", gap: 8 },
    reject: { borderWidth: 1, borderRadius: 12, height: 42, minWidth: 76, alignItems: "center", justifyContent: "center" },
    rejectText: { fontSize: 13 },
    accept: { borderRadius: 12, height: 42, minWidth: 90, alignItems: "center", justifyContent: "center" },
    acceptText: { color: "#FFFFFF", fontSize: 13 },
});
