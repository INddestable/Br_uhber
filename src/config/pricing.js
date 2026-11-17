export const PRICING = Object.freeze({
    baseFare: 3500,
    pricePerKm: 1200,
    pricePerMinute: 250,
    minimumFare: 6000,
    roundingUnit: 100,
    commissionRate: 0.2,
    driverTipShare: 1,
    simulatedTipOptions: Object.freeze([0, 0, 0, 500, 1000, 1500]),
    categories: Object.freeze({
        economy: 1,
        xl: 1.4,
        premium: 1.8,
    }),
});

export function calculateFare({ distanceKm, durationMin, category, tip = 0 }) {
    if (!Number.isFinite(distanceKm) || distanceKm < 0) {
        throw new RangeError("INVALID_DISTANCE");
    }
    if (!Number.isFinite(durationMin) || durationMin < 0) {
        throw new RangeError("INVALID_DURATION");
    }
    if (!Number.isSafeInteger(tip) || tip < 0) {
        throw new RangeError("INVALID_TIP");
    }

    const categoryMultiplier = PRICING.categories[category];
    if (!Number.isFinite(categoryMultiplier)) {
        throw new RangeError("INVALID_CATEGORY");
    }

    const subtotal = PRICING.baseFare
        + (distanceKm * PRICING.pricePerKm)
        + (durationMin * PRICING.pricePerMinute);
    const rawFare = subtotal * categoryMultiplier;
    const fare = Math.max(
        PRICING.minimumFare,
        Math.round(rawFare / PRICING.roundingUnit) * PRICING.roundingUnit
    );
    const commission = Math.round(fare * PRICING.commissionRate);
    const driverTip = Math.round(tip * PRICING.driverTipShare);

    return {
        fare,
        commission,
        driverEarnings: fare - commission + driverTip,
    };
}
