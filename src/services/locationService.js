import * as Location from "expo-location";
const LOCATION_TIMEOUT_MS = 25000;
const LAST_KNOWN_MAX_AGE_MS = 10 * 60 * 1000;
const MAX_LAST_KNOWN_ACCURACY_METERS = 250;

function withTimeout(promise, timeoutMs = LOCATION_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("LOCATION_TIMEOUT")), timeoutMs);
        promise.then((value) => {
            clearTimeout(timeout);
            resolve(value);
        }).catch((error) => {
            clearTimeout(timeout);
            reject(error);
        });
    });
}

export async function getCurrentDriverLocation({ forceFresh = false } = {}) {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") {
        throw new Error("LOCATION_PERMISSION_DENIED");
    }

    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) throw new Error("LOCATION_SERVICES_DISABLED");

    const lastKnown = forceFresh ? null : await Location.getLastKnownPositionAsync().catch(() => null);
    const isUsableLastKnown = lastKnown
        && Date.now() - lastKnown.timestamp <= LAST_KNOWN_MAX_AGE_MS
        && (lastKnown.coords.accuracy == null || lastKnown.coords.accuracy <= MAX_LAST_KNOWN_ACCURACY_METERS);

    if (isUsableLastKnown && Date.now() - lastKnown.timestamp <= 30000) {
        return {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
        };
    }

    const firstWatch = createFirstLocationWatch(LOCATION_TIMEOUT_MS);
    try {
        const currentFix = withTimeout(Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            mayShowUserSettingsDialog: true,
            timeInterval: 1000,
        }), LOCATION_TIMEOUT_MS);
        const position = await Promise.any([currentFix, firstWatch.promise]);
        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        };
    } catch {
        if (!isUsableLastKnown || forceFresh || Date.now() - lastKnown.timestamp > 30000) {
            throw new Error("LOCATION_TIMEOUT");
        }
        return {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
        };
    } finally {
        firstWatch.cancel();
    }
}

function createFirstLocationWatch(timeoutMs) {
    let subscription;
    let timeout;
    let settled = false;

    const promise = new Promise((resolve, reject) => {
        const finish = (callback, value) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            subscription?.remove();
            callback(value);
        };

        timeout = setTimeout(() => finish(reject, new Error("LOCATION_TIMEOUT")), timeoutMs);
        Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 2000,
                distanceInterval: 0,
            },
            (position) => finish(resolve, position),
            (error) => finish(reject, error)
        ).then((watcher) => {
            subscription = watcher;
            if (settled) watcher.remove();
        }).catch((error) => finish(reject, error));
    });

    return {
        promise,
        cancel() {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            subscription?.remove();
        },
    };
}

export async function watchDriverLocation(onLocation, onError) {
    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== "granted") throw new Error("LOCATION_PERMISSION_DENIED");

    return Location.watchPositionAsync(
        {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000,
            distanceInterval: 25,
        },
        (position) => onLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }),
        onError
    );
}
