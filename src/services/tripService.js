import {
    collection,
    doc,
    onSnapshot,
    query,
    runTransaction,
    serverTimestamp,
    Timestamp,
    where,
} from "firebase/firestore";
import { db } from "../config/firebase";

function toMillis(value) {
    if (typeof value === "number") return value;
    if (value instanceof Date) return value.getTime();
    if (typeof value?.toMillis === "function") return value.toMillis();
    return null;
}

function normalizeTrip(id, data) {
    const route = Array.isArray(data.route)
        ? data.route.map((point) => ({ latitude: point.latitude, longitude: point.longitude }))
        : [];
    return {
        ...data,
        id,
        route,
        createdAt: toMillis(data.createdAt),
        acceptedAt: toMillis(data.acceptedAt),
        completedAt: toMillis(data.completedAt),
    };
}

export async function saveCompletedTrip(driverId, trip) {
    if (!driverId || !trip?.id || trip.status !== "completed") {
        throw new Error("INVALID_TRIP");
    }

    const tripRef = doc(db, "trips", trip.id);
    const persistedTrip = {
        ...trip,
        driverId,
        createdAt: Timestamp.fromMillis(trip.createdAt || Date.now()),
        acceptedAt: Timestamp.fromMillis(trip.acceptedAt || Date.now()),
        completedAt: serverTimestamp(),
    };

    return runTransaction(db, async (transaction) => {
        const existing = await transaction.get(tripRef);
        if (existing.exists()) {
            if (existing.data().driverId !== driverId) throw new Error("TRIP_ID_CONFLICT");
            return normalizeTrip(existing.id, existing.data());
        }

        transaction.set(tripRef, persistedTrip);
        return normalizeTrip(trip.id, { ...persistedTrip, completedAt: Date.now() });
    });
}

export function subscribeToDriverTrips(driverId, onTrips, onError) {
    if (!driverId) {
        onTrips([]);
        return () => {};
    }

    const tripsQuery = query(
        collection(db, "trips"),
        where("driverId", "==", driverId)
    );

    return onSnapshot(
        tripsQuery,
        (snapshot) => {
            const trips = snapshot.docs
                .map((tripDocument) => normalizeTrip(tripDocument.id, tripDocument.data()))
                .filter((trip) => trip.status === "completed" && Number.isFinite(trip.completedAt))
                .sort((first, second) => second.completedAt - first.completedAt);
            onTrips(trips);
        },
        onError
    );
}
