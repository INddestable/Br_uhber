import { calculateFare, PRICING } from "../config/pricing";

const passengerNames = ["Sofía", "Carlos", "Valentina", "Mateo", "Lucía", "Samuel"];
const paymentMethods = ["cash", "electronic"];
const categories = ["economy", "economy", "economy", "economy", "xl", "xl", "premium"];
const ROUTING_URL = "https://router.project-osrm.org/route/v1/driving";
let lastRouteRequestAt = 0;

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getDrivingRoute(from, to) {
    const delay = Math.max(0, 1100 - (Date.now() - lastRouteRequestAt));
    if (delay) await wait(delay);
    lastRouteRequestAt = Date.now();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
        const coordinates = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;
        const response = await fetch(
            `${ROUTING_URL}/${coordinates}?overview=full&geometries=geojson&steps=false`,
            {
                signal: controller.signal,
                headers: { Accept: "application/json" },
            }
        );
        if (!response.ok) throw new Error("ROUTE_REQUEST_FAILED");

        const result = await response.json();
        const route = result.routes?.[0];
        if (result.code !== "Ok" || (route?.geometry?.coordinates?.length || 0) < 2) {
            throw new Error("ROUTE_NOT_FOUND");
        }

        return route.geometry.coordinates.map(([longitude, latitude]) => ({ latitude, longitude }));
    } finally {
        clearTimeout(timeout);
    }
}

function nearbyPoint(origin, minDistanceKm, maxDistanceKm = minDistanceKm) {
    const angle = Math.random() * Math.PI * 2;
    const distanceKm = minDistanceKm + Math.random() * (maxDistanceKm - minDistanceKm);
    const latitudeScale = distanceKm / 110.574;
    const longitudeScale = distanceKm / (111.32 * Math.max(Math.cos(origin.latitude * Math.PI / 180), 0.2));

    return {
        latitude: origin.latitude + Math.cos(angle) * latitudeScale,
        longitude: origin.longitude + Math.sin(angle) * longitudeScale,
    };
}

function haversineDistanceKm(from, to) {
    const radians = (degrees) => degrees * Math.PI / 180;
    const latitudeDelta = radians(to.latitude - from.latitude);
    const longitudeDelta = radians(to.longitude - from.longitude);
    const value = Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude))
        * Math.sin(longitudeDelta / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function estimateRoadDistance(from, to) {
    return Number((haversineDistanceKm(from, to) * 1.3).toFixed(1));
}

export function createRideRequest(driverLocation) {
    // Generate a road estimate from 200–500 m; account for the road-vs-straight-line factor.
    const pickupRoadDistanceKm = 0.2 + Math.random() * 0.3;
    const pickupStraightDistanceKm = pickupRoadDistanceKm / 1.3;
    const pickupLocation = nearbyPoint(driverLocation, pickupStraightDistanceKm);
    // A 0.8 km straight-line minimum becomes at least 1.0 km after road estimate/rounding.
    const destination = nearbyPoint(pickupLocation, 0.8, 4.5);
    const pickupDistance = estimateRoadDistance(driverLocation, pickupLocation);
    const tripDistance = Math.max(1, estimateRoadDistance(pickupLocation, destination));
    const estimatedDuration = Math.max(5, Math.round(tripDistance * 3.2 + 2));
    const category = categories[Math.floor(Math.random() * categories.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const tipOptions = PRICING.simulatedTipOptions;
    const tip = tipOptions[Math.floor(Math.random() * tipOptions.length)];
    const fareEstimate = calculateFare({
        distanceKm: tripDistance,
        durationMin: estimatedDuration,
        category,
        tip,
    });

    return {
        id: `trip_${Date.now()}`,
        createdAt: Date.now(),
        passengerName: passengerNames[Math.floor(Math.random() * passengerNames.length)],
        passengerRating: Number((4.6 + Math.random() * 0.4).toFixed(1)),
        pickupDistance,
        tripDistance,
        estimatedDuration,
        category,
        tip,
        paymentMethod,
        fare: fareEstimate.fare,
        commission: fareEstimate.commission,
        commissionRate: PRICING.commissionRate,
        driverEarnings: fareEstimate.driverEarnings,
        pickupLocation,
        destination,
    };
}

export function interpolatePoint(from, to, progress) {
    return {
        latitude: from.latitude + (to.latitude - from.latitude) * progress,
        longitude: from.longitude + (to.longitude - from.longitude) * progress,
    };
}

export function interpolateRoute(route, progress) {
    if (!route || route.length < 2) return route?.[0] || null;
    if (progress <= 0) return route[0];
    if (progress >= 1) return route[route.length - 1];

    const segmentLengths = [];
    let totalLength = 0;
    for (let index = 0; index < route.length - 1; index += 1) {
        const length = distanceInMeters(route[index], route[index + 1]);
        segmentLengths.push(length);
        totalLength += length;
    }

    if (totalLength === 0) return route[0];
    let remaining = totalLength * progress;
    for (let index = 0; index < segmentLengths.length; index += 1) {
        const segmentLength = segmentLengths[index];
        if (remaining <= segmentLength) {
            return interpolatePoint(route[index], route[index + 1], segmentLength ? remaining / segmentLength : 0);
        }
        remaining -= segmentLength;
    }
    return route[route.length - 1];
}

function distanceInMeters(from, to) {
    const radians = (degrees) => degrees * Math.PI / 180;
    const latitudeDelta = radians(to.latitude - from.latitude);
    const longitudeDelta = radians(to.longitude - from.longitude);
    const value = Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude))
        * Math.sin(longitudeDelta / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
