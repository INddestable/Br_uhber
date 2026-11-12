export function getPeriodBounds(period, now = new Date(), customRange = null) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (period === "today") {
        return { start: start.getTime(), end: now.getTime() };
    }

    if (period === "week") {
        const daysSinceMonday = (start.getDay() + 6) % 7;
        start.setDate(start.getDate() - daysSinceMonday);
        return { start: start.getTime(), end: now.getTime() };
    }

    if (period === "month") {
        start.setDate(1);
        return { start: start.getTime(), end: now.getTime() };
    }

    if (period === "custom" && customRange?.start && customRange?.end) {
        const rangeStart = new Date(customRange.start.getFullYear(), customRange.start.getMonth(), customRange.start.getDate());
        const rangeEnd = new Date(customRange.end.getFullYear(), customRange.end.getMonth(), customRange.end.getDate() + 1);
        return { start: rangeStart.getTime(), end: Math.min(rangeEnd.getTime(), now.getTime()) };
    }

    return { start: Number.NEGATIVE_INFINITY, end: now.getTime() };
}

export function filterTripsByPeriod(trips, period, now = new Date(), customRange = null) {
    const bounds = getPeriodBounds(period, now, customRange);
    return trips.filter((trip) => (
        Number.isFinite(trip.completedAt)
        && trip.completedAt >= bounds.start
        && trip.completedAt <= bounds.end
    ));
}

export function filterTripsByPaymentMethod(trips, paymentMethod = "all") {
    if (paymentMethod === "all") return trips;
    return trips.filter((trip) => trip.paymentMethod === paymentMethod);
}

export function calculatePeriodSummary(trips) {
    const totals = trips.reduce((summary, trip) => ({
        tripCount: summary.tripCount + 1,
        billed: summary.billed + (trip.fare || 0),
        commissions: summary.commissions + (trip.commission || 0),
        tips: summary.tips + (trip.tip || 0),
        netEarnings: summary.netEarnings + (trip.driverEarnings || 0),
    }), {
        tripCount: 0,
        billed: 0,
        commissions: 0,
        tips: 0,
        netEarnings: 0,
    });

    return {
        ...totals,
        averagePerTrip: totals.tripCount ? Math.round(totals.netEarnings / totals.tripCount) : 0,
    };
}

export function calculatePendingBalance(trips) {
    return trips.reduce((balance, trip) => {
        if (trip.paymentMethod === "electronic" && trip.payoutStatus !== "paid") {
            return balance + (trip.driverEarnings || 0);
        }
        if (trip.paymentMethod === "cash" && trip.commissionStatus !== "paid") {
            return balance - (trip.commission || 0);
        }
        return balance;
    }, 0);
}
