import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { calculatePendingBalance, calculatePeriodSummary, filterTripsByPaymentMethod, filterTripsByPeriod } from "../../../services/earningsService";
import { subscribeToDriverTrips } from "../../../services/tripService";
import { refreshMercadoPagoData, requestMercadoPagoPayout, startMercadoPagoLink, subscribeToMercadoPagoData, syncMercadoPagoPayouts } from "../../../services/mercadoPagoService";
import WorkMap from "../../../components/work/WorkMap";
import PayoutCard from "../../../components/earnings/PayoutCard";

const money = (amount) => `$${(Number.isFinite(amount) ? amount : 0).toLocaleString("es-CO")} COP`;
const timestampDate = (value) => new Date(Number.isFinite(value) ? value : 0);

function FilterChip({ label, selected, onPress, colors, typography }) {
    return (
        <Pressable accessibilityRole="button" onPress={onPress} style={[styles.chip, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border }]}>
            <Text style={{ color: selected ? "#FFFFFF" : colors.text, fontFamily: typography.medium, fontSize: 12 }}>{label}</Text>
        </Pressable>
    );
}

function Metric({ label, value, colors, typography, prominent = false }) {
    return (
        <View style={[styles.metric, { borderColor: colors.border }]}>
            <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>{label}</Text>
            <Text style={[styles.metricValue, prominent && styles.metricProminent, { color: prominent ? colors.primary : colors.text, fontFamily: typography.bold }]}>{value}</Text>
        </View>
    );
}

function TripRow({ trip, colors, typography, t, locale, onPress }) {
    const date = timestampDate(trip.completedAt);
    return (
        <Pressable accessibilityRole="button" onPress={onPress} style={[styles.tripRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.tripTop}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.tripDate, { color: colors.text, fontFamily: typography.bold }]}>{date.toLocaleDateString(locale)} · {date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</Text>
                    <Text numberOfLines={1} style={[styles.tripRoute, { color: colors.secondaryText }]}>{trip.pickup?.address || t("earnings.simulatedPickup")} → {trip.destination?.address || t("earnings.simulatedDestination")}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
            </View>
            <View style={styles.tripBottom}>
                <Text style={[styles.tripTag, { backgroundColor: colors.surface, color: colors.text }]}>{t(`vehicle.categories.${trip.category}`)} · {t(`work.payment.${trip.paymentMethod}`)}</Text>
                <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.tripFare, { color: colors.text, fontFamily: typography.bold }]}>{money(trip.fare)}</Text>
                    <Text style={[styles.tripNet, { color: colors.primary }]}>{t("earnings.net")}: {money(trip.driverEarnings)}</Text>
                </View>
            </View>
            <Text style={[styles.paymentStatus, { color: colors.secondaryText }]}>{t(`earnings.paymentStatus.${trip.paymentStatus || "pending"}`)}</Text>
        </Pressable>
    );
}

function TripDetail({ trip, visible, onClose, colors, typography, t, isDark, locale }) {
    const routeRide = useMemo(() => trip ? {
        request: {
            id: trip.id,
            passengerName: trip.passenger?.name || trip.passengerName,
            pickupLocation: trip.pickup,
            destination: trip.destination,
        },
        phase: "inProgress",
        route: trip.route,
        routeReady: true,
    } : null, [trip]);

    if (!trip) return null;
    const date = timestampDate(trip.completedAt);
    const mapColors = { ...colors, primary: colors.primary };
    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={[styles.detailScreen, { backgroundColor: colors.background }]}>
                <View style={[styles.modalHeader, { paddingTop: 12 }]}>
                    <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.bold }]}>{t("earnings.tripDetail")}</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel={t("earnings.closeDetail")} onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.surface }]}><Ionicons name="close" size={22} color={colors.text} /></Pressable>
                </View>
                <View style={styles.detailMap}>
                    <WorkMap location={trip.pickup} ride={routeRide} colors={mapColors} isDark={isDark} t={t} />
                </View>
                <ScrollView contentContainerStyle={styles.detailContent}>
                    <Text style={[styles.detailRoute, { color: colors.text, fontFamily: typography.bold }]}>{trip.pickup?.address || t("earnings.simulatedPickup")} → {trip.destination?.address || t("earnings.simulatedDestination")}</Text>
                    <Text style={[styles.detailDate, { color: colors.secondaryText }]}>{date.toLocaleString(locale)}</Text>
                    <View style={[styles.detailPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Metric label={t("earnings.distance")} value={`${trip.distanceKm} km`} colors={colors} typography={typography} />
                        <Metric label={t("earnings.duration")} value={`${trip.durationMin} min`} colors={colors} typography={typography} />
                        <Metric label={t("earnings.category")} value={t(`vehicle.categories.${trip.category}`)} colors={colors} typography={typography} />
                        <Metric label={t("earnings.fare")} value={money(trip.fare)} colors={colors} typography={typography} />
                        <Metric label={t("earnings.commission")} value={money(trip.commission)} colors={colors} typography={typography} />
                        <Metric label={t("earnings.commissionRate")} value={`${Math.round((trip.commissionRate || 0) * 100)}%`} colors={colors} typography={typography} />
                        <Metric label={t("earnings.tip") } value={money(trip.tip)} colors={colors} typography={typography} />
                        <Metric label={t("earnings.net")} value={money(trip.driverEarnings)} colors={colors} typography={typography} prominent />
                        <Metric label={t("earnings.paymentMethod")} value={t(`work.payment.${trip.paymentMethod}`)} colors={colors} typography={typography} />
                        <Metric label={t("earnings.paymentStatusLabel")} value={t(`earnings.paymentStatus.${trip.paymentStatus || "pending"}`)} colors={colors} typography={typography} />
                        <Metric label={t("earnings.passenger")} value={trip.passenger?.name || trip.passengerName || "—"} colors={colors} typography={typography} />
                        {trip.passengerRating ? <Metric label={t("earnings.passengerRating")} value={`★ ${trip.passengerRating.toFixed(1)}`} colors={colors} typography={typography} /> : null}
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}

export default function EarningsScreen() {
    const { colors, typography, isDark } = useTheme();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [trips, setTrips] = useState([]);
    const [loadedForUid, setLoadedForUid] = useState(null);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState("today");
    const [historyPeriod, setHistoryPeriod] = useState("all");
    const [paymentMethod, setPaymentMethod] = useState("all");
    const [customRange, setCustomRange] = useState({ start: new Date(), end: new Date() });
    const [historyRange, setHistoryRange] = useState({ start: new Date(), end: new Date() });
    const [activeDateField, setActiveDateField] = useState(null);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [now, setNow] = useState(() => new Date());
    const [payoutProfile, setPayoutProfile] = useState({ uid: null, account: null, withdrawals: [] });
    const [payoutBusy, setPayoutBusy] = useState(false);
    const [payoutError, setPayoutError] = useState(null);
    const hasProcessingPayout = payoutProfile.uid === user?.uid
        && payoutProfile.withdrawals.some((withdrawal) => withdrawal.status === "processing");

    useEffect(() => {
        if (!user?.uid) return undefined;
        const uid = user.uid;
        return subscribeToDriverTrips(uid, (nextTrips) => {
            setTrips(nextTrips);
            setNow(new Date());
            setError(null);
            setLoadedForUid(uid);
        }, (subscriptionError) => {
            setError(subscriptionError);
            setLoadedForUid(uid);
        });
    }, [user?.uid]);

    useEffect(() => {
        if (!user?.uid) return undefined;
        return subscribeToMercadoPagoData(user.uid, (data) => {
            setPayoutProfile({ uid: user.uid, ...data });
            setPayoutError(null);
        }, () => setPayoutError(t("earnings.payout.loadError")));
    }, [user?.uid, t]);

    useEffect(() => {
        if (!user?.uid) return undefined;
        const sync = async () => {
            try {
                await syncMercadoPagoPayouts();
                const data = await refreshMercadoPagoData();
                setPayoutProfile({ uid: user.uid, ...data });
            } catch { /* Keep the last known withdrawal status if the service is temporarily offline. */ }
        };
        void sync();
        if (!hasProcessingPayout) return undefined;
        const timer = setInterval(sync, 45_000);
        return () => clearInterval(timer);
    }, [user?.uid, hasProcessingPayout]);

    const loading = Boolean(user?.uid && loadedForUid !== user.uid);
    const payoutData = payoutProfile.uid === user?.uid ? payoutProfile : { account: null, withdrawals: [] };
    const currentTrips = useMemo(() => trips.filter((trip) => trip.driverId === user?.uid), [trips, user?.uid]);
    const periodTrips = useMemo(() => filterTripsByPeriod(currentTrips, period, now, customRange), [currentTrips, period, now, customRange]);
    const summary = useMemo(() => calculatePeriodSummary(periodTrips), [periodTrips]);
    const tripBalance = useMemo(() => calculatePendingBalance(currentTrips), [currentTrips]);
    const alreadyWithdrawn = useMemo(() => payoutData.withdrawals
        .filter((withdrawal) => ["processing", "approved", "review_required", "paid"].includes(withdrawal.status))
        .reduce((sum, withdrawal) => sum + withdrawal.amount, 0), [payoutData.withdrawals]);
    const pendingBalance = tripBalance - alreadyWithdrawn;
    const availableBalance = Math.max(0, pendingBalance);
    const historyTrips = useMemo(() => filterTripsByPeriod(currentTrips, historyPeriod, now, historyRange), [currentTrips, historyPeriod, now, historyRange]);
    const visibleTrips = useMemo(() => filterTripsByPaymentMethod(historyTrips, paymentMethod), [historyTrips, paymentMethod]);

    async function linkMercadoPagoAccount() {
        if (!user?.uid) throw new Error("PAYOUT_DRIVER_REQUIRED");
        setPayoutBusy(true);
        try {
            const authorizationUrl = await startMercadoPagoLink();
            await Linking.openURL(authorizationUrl);
            setPayoutError(null);
        } finally {
            setPayoutBusy(false);
        }
    }

    async function withdrawMercadoPagoBalance(amount) {
        if (!user?.uid) throw new Error("PAYOUT_DRIVER_REQUIRED");
        setPayoutBusy(true);
        try {
            await requestMercadoPagoPayout(amount);
            const updated = await refreshMercadoPagoData();
            setPayoutProfile({ uid: user.uid, ...updated });
            setPayoutError(null);
        } catch (withdrawError) {
            setPayoutError(t("earnings.payout.withdrawError"));
            throw withdrawError;
        } finally {
            setPayoutBusy(false);
        }
    }

    function openDatePicker(field, scope = "summary") {
        setActiveDateField(`${scope}:${field}`);
        const dateRange = scope === "summary" ? customRange : historyRange;
        const setDateRange = scope === "summary" ? setCustomRange : setHistoryRange;
        const value = dateRange[field];
        if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
                value,
                mode: "date",
                maximumDate: new Date(),
                onValueChange: (_event, selectedDate) => {
                    if (selectedDate) setDateRange((range) => ({ ...range, [field]: selectedDate }));
                    setActiveDateField(null);
                },
                onDismiss: () => setActiveDateField(null),
            });
        }
    }

    return (
        <View style={[styles.screen, { backgroundColor: colors.background }]}>
            <FlatList
                data={visibleTrips}
                keyExtractor={(trip) => trip.id}
                renderItem={({ item }) => <TripRow trip={item} colors={colors} typography={typography} t={t} locale={i18n.language} onPress={() => setSelectedTrip(item)} />}
                contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 24 }]}
                ListHeaderComponent={(
                    <View>
                        <Text style={[styles.pageTitle, { color: colors.text, fontFamily: typography.bold }]}>{t("earnings.title")}</Text>
                        <Text style={[styles.pageCaption, { color: colors.secondaryText }]}>{t("earnings.subtitle")}</Text>
                        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
                            <Text style={styles.balanceLabel}>{t("earnings.pendingBalance")}</Text>
                            <Text style={[styles.balanceValue, { fontFamily: typography.bold }]}>{money(pendingBalance)}</Text>
                            <Text style={styles.balanceNote}>{t("earnings.balanceDisclaimer")}</Text>
                        </View>
                        <PayoutCard
                            account={payoutData.account}
                            withdrawals={payoutData.withdrawals}
                            availableBalance={availableBalance}
                            busy={payoutBusy}
                            error={payoutError}
                            onLink={linkMercadoPagoAccount}
                            onWithdraw={withdrawMercadoPagoBalance}
                            colors={colors}
                            typography={typography}
                            t={t}
                        />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                            {["today", "week", "month"].map((value) => <FilterChip key={value} label={t(`earnings.period.${value}`)} selected={period === value} onPress={() => setPeriod(value)} colors={colors} typography={typography} />)}
                            <FilterChip label={t("earnings.period.custom")} selected={period === "custom"} onPress={() => setPeriod("custom")} colors={colors} typography={typography} />
                        </ScrollView>
                        {period === "custom" ? (
                            <View style={styles.dateRange}>
                                {(["start", "end"]).map((field) => (
                                    <View key={field} style={{ flex: 1 }}>
                                        <Text style={[styles.filterLabel, { color: colors.secondaryText }]}>{t(`earnings.${field}Date`)}</Text>
                                        <Pressable onPress={() => openDatePicker(field)} style={[styles.dateButton, { backgroundColor: colors.surface }]}><Text style={{ color: colors.text }}>{customRange[field].toLocaleDateString(i18n.language)}</Text></Pressable>
                                    </View>
                                ))}
                                {Platform.OS === "ios" && activeDateField?.startsWith("summary:") ? <DateTimePicker value={customRange[activeDateField.split(":")[1]]} mode="date" maximumDate={new Date()} onValueChange={(_event, date) => { if (date) setCustomRange((range) => ({ ...range, [activeDateField.split(":")[1]]: date })); }} onDismiss={() => setActiveDateField(null)} /> : null}
                            </View>
                        ) : null}
                        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.bold }]}>{t("earnings.summary")}</Text>
                        <View style={[styles.summaryGrid, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Metric label={t("earnings.trips")} value={String(summary.tripCount)} colors={colors} typography={typography} />
                            <Metric label={t("earnings.billed")} value={money(summary.billed)} colors={colors} typography={typography} />
                            <Metric label={t("earnings.commission")} value={money(summary.commissions)} colors={colors} typography={typography} />
                            <Metric label={t("earnings.tips")} value={money(summary.tips)} colors={colors} typography={typography} />
                            <Metric label={t("earnings.net")} value={money(summary.netEarnings)} colors={colors} typography={typography} prominent />
                            <Metric label={t("earnings.average")} value={money(summary.averagePerTrip)} colors={colors} typography={typography} />
                        </View>
                        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.bold }]}>{t("earnings.history")}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                            {["all", "today", "week", "month", "custom"].map((value) => <FilterChip key={value} label={t(`earnings.historyPeriod.${value}`)} selected={historyPeriod === value} onPress={() => setHistoryPeriod(value)} colors={colors} typography={typography} />)}
                        </ScrollView>
                        {historyPeriod === "custom" ? (
                            <View>
                                <View style={styles.dateRange}>
                                    {["start", "end"].map((field) => (
                                        <View key={`history-${field}`} style={{ flex: 1 }}>
                                            <Text style={[styles.filterLabel, { color: colors.secondaryText }]}>{t(`earnings.${field}Date`)}</Text>
                                            <Pressable onPress={() => openDatePicker(field, "history")} style={[styles.dateButton, { backgroundColor: colors.surface }]}><Text style={{ color: colors.text }}>{historyRange[field].toLocaleDateString(i18n.language)}</Text></Pressable>
                                        </View>
                                    ))}
                                </View>
                                {Platform.OS === "ios" && activeDateField?.startsWith("history:") ? <DateTimePicker value={historyRange[activeDateField.split(":")[1]]} mode="date" maximumDate={new Date()} onValueChange={(_event, date) => { if (date) setHistoryRange((range) => ({ ...range, [activeDateField.split(":")[1]]: date })); }} onDismiss={() => setActiveDateField(null)} /> : null}
                            </View>
                        ) : null}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                            {["all", "cash", "electronic"].map((value) => <FilterChip key={value} label={value === "all" ? t("earnings.allPayments") : t(`work.payment.${value}`)} selected={paymentMethod === value} onPress={() => setPaymentMethod(value)} colors={colors} typography={typography} />)}
                        </ScrollView>
                        {error ? <Text style={[styles.errorText, { color: "#B42332" }]}>{t("earnings.loadError")}</Text> : null}
                        {loading ? <ActivityIndicator style={{ marginVertical: 18 }} color={colors.primary} /> : null}
                    </View>
                )}
                ListEmptyComponent={!loading ? <Text style={[styles.empty, { color: colors.secondaryText }]}>{t("earnings.empty")}</Text> : null}
            />
            <TripDetail trip={selectedTrip} visible={Boolean(selectedTrip)} onClose={() => setSelectedTrip(null)} colors={colors} typography={typography} t={t} isDark={isDark} locale={i18n.language} />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    listContent: { paddingHorizontal: 16, flexGrow: 1 },
    pageTitle: { fontSize: 25 },
    pageCaption: { marginTop: 4, fontSize: 13 },
    balanceCard: { borderRadius: 20, padding: 18, marginTop: 18 },
    balanceLabel: { color: "#FFFFFF", fontSize: 13, opacity: 0.9 },
    balanceValue: { color: "#FFFFFF", fontSize: 27, marginTop: 6 },
    balanceNote: { color: "#FFFFFF", fontSize: 11, opacity: 0.85, marginTop: 6 },
    chipRow: { gap: 8, paddingVertical: 15 },
    chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, borderWidth: 1 },
    dateRange: { flexDirection: "row", gap: 10 },
    filterLabel: { fontSize: 11, marginBottom: 5 },
    dateButton: { padding: 12, borderRadius: 12 },
    sectionTitle: { fontSize: 17, marginTop: 9 },
    summaryGrid: { flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, marginTop: 10 },
    metric: { width: "50%", minHeight: 64, paddingHorizontal: 7, paddingVertical: 11, justifyContent: "center" },
    metricLabel: { fontSize: 11 },
    metricValue: { fontSize: 14, marginTop: 4 },
    metricProminent: { fontSize: 16 },
    tripRow: { borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 10 },
    tripTop: { flexDirection: "row", alignItems: "center" },
    tripDate: { fontSize: 13 },
    tripRoute: { fontSize: 12, marginTop: 4 },
    tripBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
    tripTag: { fontSize: 10, overflow: "hidden", borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6 },
    tripFare: { fontSize: 13 },
    tripNet: { fontSize: 11, marginTop: 3 },
    paymentStatus: { fontSize: 10, marginTop: 8 },
    empty: { textAlign: "center", paddingVertical: 28, fontSize: 13 },
    errorText: { textAlign: "center", marginVertical: 12, fontSize: 12 },
    detailScreen: { flex: 1 },
    modalHeader: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    modalTitle: { fontSize: 20 },
    closeButton: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    detailMap: { height: 245, overflow: "hidden" },
    detailContent: { padding: 16, paddingBottom: 28 },
    detailRoute: { fontSize: 16 },
    detailDate: { fontSize: 12, marginTop: 5 },
    detailPanel: { flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderRadius: 18, paddingHorizontal: 8, marginTop: 14 },
});
