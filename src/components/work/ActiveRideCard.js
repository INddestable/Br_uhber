import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ActiveRideCard({ ride, colors, typography, t, onBoard, onSkip, onCancel }) {
    const arrived = ride.phase === "arrived";
    const enRouteToPickup = ride.phase === "toPickup";
    const title = arrived
        ? t("work.arrived")
        : enRouteToPickup
            ? t("work.headingToPickup")
            : t("work.tripInProgress");
    const destination = ride.phase === "inProgress"
        ? t("work.destination")
        : t("work.pickup");

    return (
        <View style={[styles.card, { backgroundColor: colors.card || colors.surface }]}>
            <View style={styles.heading}>
                <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}><Ionicons name={arrived ? "checkmark-circle" : "navigate-circle"} size={28} color={colors.primary} /></View>
                <View style={styles.headingCopy}>
                    <Text style={[styles.title, { color: colors.text, fontFamily: typography.bold }]}>{title}</Text>
                    <Text style={[styles.caption, { color: colors.secondaryText }]}>{ride.request.passengerName} · {destination}</Text>
                </View>
                <Text style={[styles.earnings, { color: colors.text, fontFamily: typography.bold }]}>{t("work.earnings", { amount: ride.request.estimatedEarnings.toLocaleString() })}</Text>
            </View>
            {ride.phase === "inProgress" && (
                <View style={[styles.progressTrack, { backgroundColor: colors.surface }]}>
                    <View style={[styles.progress, { width: `${Math.max(5, Math.round(ride.progress * 100))}%`, backgroundColor: colors.primary }]} />
                </View>
            )}
            {arrived ? (
                <Pressable onPress={onBoard} style={[styles.primaryButton, { backgroundColor: colors.primary }]} accessibilityRole="button">
                    <Text style={[styles.primaryText, { fontFamily: typography.bold }]}>{t("work.passengerOnboard")}</Text>
                </Pressable>
            ) : (
                <View style={styles.actions}>
                    <Text style={[styles.distance, { color: colors.secondaryText }]}>{t("work.remaining", { distance: ride.remainingDistance.toFixed(1) })}</Text>
                    <View style={styles.actionLinks}>
                        <Pressable onPress={onCancel} style={styles.skipButton} accessibilityRole="button">
                            <Text style={[styles.cancelText, { color: colors.secondaryText, fontFamily: typography.bold }]}>{t("work.cancelRide")}</Text>
                        </Pressable>
                        <Pressable onPress={onSkip} style={styles.skipButton} accessibilityRole="button">
                            <Ionicons name="play-skip-forward" size={13} color={colors.primary} />
                            <Text style={[styles.skipText, { color: colors.primary, fontFamily: typography.bold }]}>{t("work.skipSimulation")}</Text>
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 22, padding: 17, elevation: 7, shadowColor: "#111827", shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
    heading: { flexDirection: "row", alignItems: "center" },
    iconWrap: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center" },
    headingCopy: { flex: 1, marginLeft: 10 },
    title: { fontSize: 15 },
    caption: { fontSize: 12, marginTop: 4 },
    earnings: { fontSize: 14 },
    progressTrack: { height: 5, borderRadius: 3, overflow: "hidden", marginTop: 16 },
    progress: { height: 5, borderRadius: 3 },
    actions: { marginTop: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    actionLinks: { flexDirection: "row", alignItems: "center", gap: 4 },
    distance: { fontSize: 12 },
    skipButton: { flexDirection: "row", gap: 5, alignItems: "center", padding: 5 },
    skipText: { fontSize: 11 },
    cancelText: { fontSize: 11 },
    primaryButton: { height: 46, borderRadius: 14, marginTop: 15, alignItems: "center", justifyContent: "center" },
    primaryText: { color: "#FFFFFF", fontSize: 14 },
});
