const passengerNames = ["Sofía", "Carlos", "Valentina", "Mateo", "Lucía", "Samuel"];
const paymentMethods = ["cash", "card"];
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

function nearbyPoint(origin, minOffset = 0.008, maxOffset = 0.025) {
    const angle = Math.random() * Math.PI * 2;
    const distance = minOffset + Math.random() * (maxOffset - minOffset);
    const latitudeScale = distance / 111;
    const longitudeScale = distance / (111 * Math.max(Math.cos(origin.latitude * Math.PI / 180), 0.2));

    return {
        latitude: origin.latitude + Math.cos(angle) * latitudeScale,
        longitude: origin.longitude + Math.sin(angle) * longitudeScale,
    };
}

export function createRideRequest(driverLocation) {
    const pickupLocation = nearbyPoint(driverLocation, 0.006, 0.018);
    const destination = nearbyPoint(pickupLocation, 0.02, 0.055);
    const tripDistance = Number((2 + Math.random() * 6).toFixed(1));

    return {
        id: `trip_${Date.now()}`,
        passengerName: passengerNames[Math.floor(Math.random() * passengerNames.length)],
        passengerRating: Number((4.6 + Math.random() * 0.4).toFixed(1)),
        pickupDistance: Number((0.5 + Math.random() * 3.5).toFixed(1)),
        tripDistance,
        estimatedDuration: Math.round(tripDistance * 3.2),
        estimatedEarnings: Math.round((5000 + tripDistance * 1400) / 500) * 500,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
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
