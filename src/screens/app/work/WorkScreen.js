import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../context/ThemeContext";
import useWorkSession from "../../../hooks/useWorkSession";
import WorkMap from "../../../components/work/WorkMap";
import WorkHeader from "../../../components/work/WorkHeader";
import RideRequestCard from "../../../components/work/RideRequestCard";
import ActiveRideCard from "../../../components/work/ActiveRideCard";
import RideSummary from "../../../components/work/RideSummary";

export default function WorkScreen() {
    const { colors, typography, isDark } = useTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const session = useWorkSession();
    const { state } = session;

    return (
        <View style={styles.container}>
            <WorkMap
                location={state.location}
                ride={state.ride}
                colors={colors}
                isDark={isDark}
                t={t}
                onLocate={session.locateDriver}
                locating={session.locating}
            />
            <View style={[styles.topOverlay, { top: insets.top + 10 }]}>
                <WorkHeader
                    online={session.isOnline}
                    busy={session.isOnTrip}
                    loading={session.busy}
                    colors={colors}
                    typography={typography}
                    t={t}
                    onToggle={session.toggleAvailability}
                />
                {state.error ? <View style={styles.errorBanner}><Text style={styles.errorText}>{state.error}</Text></View> : null}
            </View>
            <View style={[styles.bottomOverlay, { bottom: Math.max(insets.bottom, 12) + 6 }]}>
                {session.busy && !state.location ? <ActivityIndicator color={colors.primary} /> : null}
                {state.status === "request" && state.request ? (
                    <RideRequestCard
                        request={state.request}
                        seconds={session.secondsLeft}
                        colors={colors}
                        typography={typography}
                        t={t}
                        onAccept={session.acceptRequest}
                        onReject={session.rejectRequest}
                    />
                ) : null}
                {state.ride ? (
                    <ActiveRideCard
                        ride={state.ride}
                        colors={colors}
                        typography={typography}
                        t={t}
                        onBoard={session.markPassengerOnboard}
                        onSkip={session.skipSimulation}
                        onCancel={session.cancelRide}
                    />
                ) : null}
                {state.summary ? (
                    <RideSummary
                        request={state.summary}
                        colors={colors}
                        typography={typography}
                        t={t}
                        onClose={session.closeSummary}
                    />
                ) : null}
                {session.isOnline && !state.request && !state.ride && !state.summary ? (
                    <View style={[styles.searchingCard, { backgroundColor: colors.card || colors.surface }]}>
                        <View style={[styles.searchingIcon, { backgroundColor: colors.surface }]}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                        <View style={styles.searchCopy}>
                            <Text style={[styles.searchTitle, { color: colors.text, fontFamily: typography.bold }]}>{t("work.searching")}</Text>
                            <Text style={[styles.searchCaption, { color: colors.secondaryText }]}>{t("work.simulationNotice")}</Text>
                        </View>
                    </View>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#E9EEF4" },
    topOverlay: { position: "absolute", left: 14, right: 14 },
    errorBanner: { backgroundColor: "#9F2D36", borderRadius: 12, paddingHorizontal: 13, paddingVertical: 9, marginTop: 8 },
    errorText: { color: "#FFFFFF", fontSize: 12 },
    bottomOverlay: { position: "absolute", left: 14, right: 14 },
    searchingCard: { borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", elevation: 5, shadowColor: "#111827", shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    searchingIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    searchCopy: { marginLeft: 12 },
    searchTitle: { fontSize: 14 },
    searchCaption: { fontSize: 12, marginTop: 4 },
});
