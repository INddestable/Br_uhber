import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export async function updateDriverProfile(uid, section, data) {
    const allowedSections = [
        "personalData",
        "vehicle",
        "documents",
    ];

    if (!allowedSections.includes(section)) {
        throw new Error("Sección no permitida.");
    }

    const driverRef = doc(db, "drivers", uid);

    const updates = {};

    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            updates[`${section}.${key}`] = value;
        }
    });

    await updateDoc(driverRef, updates);
}