import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "bruhber.rideHistory";

export async function saveCompletedRide(ride) {
    const saved = await AsyncStorage.getItem(HISTORY_KEY);
    const history = saved ? JSON.parse(saved) : [];
    const next = [{ ...ride, completedAt: Date.now() }, ...history].slice(0, 50);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export async function getRideHistory() {
    const saved = await AsyncStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
}
