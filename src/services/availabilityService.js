import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export async function setDriverAvailability(uid, available, location) {
    if (!uid) throw new Error("DRIVER_NOT_AUTHENTICATED");

    const driverRef = doc(db, "drivers", uid);
    const snapshot = await getDoc(driverRef);
    if (!snapshot.exists()) throw new Error("DRIVER_PROFILE_NOT_FOUND");
    if (available && snapshot.data().approvalStatus !== "approved") throw new Error("DRIVER_NOT_APPROVED");

    // Firestore rules must independently enforce approval and restrict this update to the owner's allowed fields.
    const updates = {
        availabilityStatus: available ? "available" : "unavailable",
    };
    if (available && location) {
        updates.lastLocation = location;
        updates.lastLocationUpdatedAt = serverTimestamp();
    }
    await updateDoc(driverRef, updates);
}

export async function updateDriverLocation(uid, location) {
    if (!uid || !location) return;
    await updateDoc(doc(db, "drivers", uid), {
        lastLocation: location,
        lastLocationUpdatedAt: serverTimestamp(),
    });
}
