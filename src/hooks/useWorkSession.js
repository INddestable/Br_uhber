import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { getCurrentDriverLocation, watchDriverLocation } from "../services/locationService";
import { setDriverAvailability, updateDriverLocation } from "../services/availabilityService";
import { createRideRequest, getDrivingRoute, interpolatePoint, interpolateRoute } from "../services/rideSimulationService";
import { saveCompletedRide } from "../services/rideHistoryService";

const initialState = {
    status: "offline",
    location: null,
    request: null,
    requestExpiresAt: null,
    ride: null,
    summary: null,
    error: null,
};

function distanceInMeters(a, b) {
    if (!a || !b) return Infinity;
    const radians = (degrees) => degrees * Math.PI / 180;
    const latitudeDelta = radians(b.latitude - a.latitude);
    const longitudeDelta = radians(b.longitude - a.longitude);
    const haversine = Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude))
        * Math.sin(longitudeDelta / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function reducer(state, action) {
    switch (action.type) {
        case "CONNECT":
            return { ...state, status: "searching", location: action.location, error: null };
        case "DISCONNECT":
            return { ...initialState, location: state.location, error: action.error || null };
        case "LOCATION":
            return { ...state, location: action.location };
        case "ERROR":
            return { ...state, error: action.error };
        case "OFFER":
            if (state.status !== "searching" || state.ride || state.summary) return state;
            return { ...state, status: "request", request: action.request, requestExpiresAt: Date.now() + 25000, error: null };
        case "REJECT":
        case "EXPIRE":
            return { ...state, status: "searching", request: null, requestExpiresAt: null };
        case "ACCEPT":
            if (!state.request || !state.location) return state;
            return {
                ...state,
                status: "searching",
                request: null,
                requestExpiresAt: null,
                ride: {
                    request: state.request,
                    phase: "toPickup",
                    start: state.location,
                    progress: 0,
                    remainingDistance: state.request.pickupDistance,
                    startedAt: Date.now(),
                    route: [state.location, state.request.pickupLocation],
                    routeReady: false,
                },
            };
        case "PROGRESS":
            if (!state.ride || state.ride.phase !== action.phase) return state;
            return {
                ...state,
                location: action.location,
                ride: { ...state.ride, progress: action.progress, remainingDistance: action.remainingDistance },
            };
        case "ROUTE_RECEIVED":
            if (!state.ride || state.ride.request.id !== action.rideId || state.ride.phase !== action.phase) return state;
            return { ...state, ride: { ...state.ride, route: action.route, routeReady: true, startedAt: Date.now() } };
        case "ARRIVE_PICKUP":
            if (!state.ride || state.ride.phase !== "toPickup") return state;
            return {
                ...state,
                location: state.ride.request.pickupLocation,
                ride: { ...state.ride, phase: "arrived", progress: 1, remainingDistance: 0 },
            };
        case "BOARD":
            if (!state.ride || state.ride.phase !== "arrived") return state;
            return {
                ...state,
                location: state.ride.request.pickupLocation,
                ride: {
                    ...state.ride,
                    phase: "inProgress",
                    progress: 0,
                    remainingDistance: state.ride.request.tripDistance,
                    startedAt: Date.now(),
                    route: [state.ride.request.pickupLocation, state.ride.request.destination],
                    routeReady: false,
                },
            };
        case "COMPLETE":
            if (!state.ride || state.ride.phase !== "inProgress") return state;
            return {
                ...state,
                status: "searching",
                location: state.ride.request.destination,
                summary: state.ride.request,
                ride: null,
            };
        case "CANCEL_RIDE":
            if (!state.ride) return state;
            return { ...state, status: "searching", ride: null, request: null, requestExpiresAt: null };
        case "CLOSE_SUMMARY":
            return { ...state, summary: null };
        default:
            return state;
    }
}

function locationErrorKey(error) {
    if (error?.message === "LOCATION_PERMISSION_DENIED") return "locationPermissionDenied";
    if (error?.message === "LOCATION_SERVICES_DISABLED") return "locationServicesDisabled";
    if (error?.message === "LOCATION_TIMEOUT") return "locationTimeout";
    return "locationError";
}

function availabilityErrorKey(error) {
    if (error?.message === "DRIVER_NOT_AUTHENTICATED") return "driverNotAuthenticated";
    const code = error?.code?.split("/").pop();
    if (code === "permission-denied") return "availabilityPermissionDenied";
    if (["unavailable", "deadline-exceeded", "network-request-failed"].includes(code)) return "availabilityNetwork";
    return "availability";
}

export default function useWorkSession() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [state, dispatch] = useReducer(reducer, initialState);
    const [busy, setBusy] = useState(false);
    const [locating, setLocating] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(25);
    const driverLocationRef = useRef(null);
    const lastLocationSyncRef = useRef({ location: null, time: 0 });
    const requestNumberRef = useRef(0);
    const activeRideRef = useRef(null);
    const hasRideRef = useRef(false);
    const isOnline = state.status !== "offline";
    const hasRide = Boolean(state.ride);
    const hasSummary = Boolean(state.summary);
    const userUid = user?.uid;
    const ridePhase = state.ride?.phase;
    const rideStartedAt = state.ride?.startedAt;
    const rideId = state.ride?.request?.id;
    const rideRouteReady = state.ride?.routeReady;

    useEffect(() => {
        driverLocationRef.current = state.location;
    }, [state.location]);
    useEffect(() => {
        activeRideRef.current = state.ride;
        hasRideRef.current = hasRide;
    }, [state.ride, hasRide]);

    const showError = useCallback((error) => {
        dispatch({ type: "ERROR", error: t(`work.errors.${locationErrorKey(error)}`) });
    }, [t]);

    async function locateDriver() {
        if (locating) return null;
        setLocating(true);
        try {
            const location = await getCurrentDriverLocation({ forceFresh: true });
            driverLocationRef.current = location;
            dispatch({ type: "LOCATION", location });
            return location;
        } catch (error) {
            showError(error);
            return null;
        } finally {
            setLocating(false);
        }
    }

    async function toggleAvailability() {
        if (busy || hasRide) return;
        setBusy(true);
        if (isOnline) {
            dispatch({ type: "DISCONNECT" });
            try {
                await setDriverAvailability(userUid, false);
            } catch {
                dispatch({ type: "ERROR", error: t("work.errors.availability") });
            } finally {
                setBusy(false);
            }
            return;
        }

        try {
            if (!userUid) throw new Error("DRIVER_NOT_AUTHENTICATED");
            const location = await getCurrentDriverLocation();
            await setDriverAvailability(userUid, true, location);
            lastLocationSyncRef.current = { location, time: Date.now() };
            dispatch({ type: "CONNECT", location });
        } catch (error) {
            if (error?.message === "DRIVER_NOT_APPROVED") {
                Alert.alert(t("work.approvalTitle"), t("work.approvalRequired"));
            } else if (error?.message === "DRIVER_PROFILE_NOT_FOUND") {
                dispatch({ type: "ERROR", error: t("work.errors.driverProfile") });
            } else if (error?.message?.startsWith("LOCATION_")) {
                showError(error);
            } else {
                dispatch({ type: "ERROR", error: t(`work.errors.${availabilityErrorKey(error)}`) });
            }
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        if (!isOnline) return undefined;
        let cancelled = false;
        let subscription;
        watchDriverLocation((location) => {
            driverLocationRef.current = location;
            if (!hasRideRef.current) dispatch({ type: "LOCATION", location });
            const lastSync = lastLocationSyncRef.current;
            if (Date.now() - lastSync.time >= 60000 && distanceInMeters(lastSync.location, location) >= 75) {
                lastLocationSyncRef.current = { location, time: Date.now() };
                updateDriverLocation(userUid, location).catch(showError);
            }
        }, showError).then((watcher) => {
            if (cancelled) watcher.remove();
            else subscription = watcher;
        }).catch(showError);
        return () => {
            cancelled = true;
            subscription?.remove();
        };
    }, [isOnline, showError, userUid]);

    useEffect(() => {
        if (state.status !== "searching" || hasRide || hasSummary) return undefined;
        const timeout = setTimeout(() => {
            const location = driverLocationRef.current;
            if (!location) {
                dispatch({ type: "ERROR", error: t("work.errors.locationError") });
                return;
            }
            requestNumberRef.current += 1;
            dispatch({ type: "OFFER", request: createRideRequest(location) });
        }, requestNumberRef.current === 0 ? 11000 : 35000);
        return () => clearTimeout(timeout);
    }, [state.status, hasRide, hasSummary, t]);

    useEffect(() => {
        if (state.status !== "request" || !state.requestExpiresAt) return undefined;
        const updateTimer = () => {
            const remaining = Math.max(0, Math.ceil((state.requestExpiresAt - Date.now()) / 1000));
            setSecondsLeft(remaining);
            if (remaining === 0) dispatch({ type: "EXPIRE" });
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [state.status, state.requestExpiresAt]);

    useEffect(() => {
        if (!rideId || !ridePhase || !["toPickup", "inProgress"].includes(ridePhase) || rideRouteReady) return undefined;
        const ride = activeRideRef.current;
        if (!ride || ride.request.id !== rideId || ride.phase !== ridePhase) return undefined;
        const from = ridePhase === "toPickup" ? ride.start : ride.request.pickupLocation;
        const to = ridePhase === "toPickup" ? ride.request.pickupLocation : ride.request.destination;
        let cancelled = false;
        getDrivingRoute(from, to)
            .catch(() => [from, to])
            .then((route) => {
                if (!cancelled) dispatch({ type: "ROUTE_RECEIVED", rideId, phase: ridePhase, route });
            });
        return () => { cancelled = true; };
    }, [rideId, ridePhase, rideRouteReady]);

    useEffect(() => {
        if (!ridePhase || !["toPickup", "inProgress"].includes(ridePhase)) return undefined;
        const ride = activeRideRef.current;
        if (!ride || !ride.routeReady) return undefined;
        const phase = ride.phase;
        const duration = phase === "toPickup" ? 14000 : 24000;
        const from = phase === "toPickup" ? ride.start : ride.request.pickupLocation;
        const to = phase === "toPickup" ? ride.request.pickupLocation : ride.request.destination;
        const interval = setInterval(() => {
            const progress = Math.min(1, (Date.now() - ride.startedAt) / duration);
            const location = interpolateRoute(ride.route, progress) || interpolatePoint(from, to, progress);
            dispatch({
                type: progress === 1 ? (phase === "toPickup" ? "ARRIVE_PICKUP" : "COMPLETE") : "PROGRESS",
                phase,
                location,
                progress,
                remainingDistance: (phase === "toPickup" ? ride.request.pickupDistance : ride.request.tripDistance) * (1 - progress),
            });
            if (progress === 1) clearInterval(interval);
        }, 250);
        return () => clearInterval(interval);
    }, [ridePhase, rideStartedAt, rideRouteReady]);

    useEffect(() => {
        if (!state.summary) return undefined;
        saveCompletedRide(state.summary).catch(() => {});
        const timeout = setTimeout(() => dispatch({ type: "CLOSE_SUMMARY" }), 7000);
        return () => clearTimeout(timeout);
    }, [state.summary]);

    function skipSimulation() {
        if (state.ride?.phase === "toPickup") dispatch({ type: "ARRIVE_PICKUP" });
        else if (state.ride?.phase === "inProgress") dispatch({ type: "COMPLETE" });
    }

    function cancelRide() {
        Alert.alert(t("work.cancelRideTitle"), t("work.cancelRideConfirmation"), [
            { text: t("work.keepRide"), style: "cancel" },
            { text: t("work.cancelRide"), style: "destructive", onPress: () => dispatch({ type: "CANCEL_RIDE" }) },
        ]);
    }

    return {
        state,
        busy,
        locating,
        secondsLeft,
        isOnline,
        isOnTrip: hasRide,
        toggleAvailability,
        locateDriver,
        acceptRequest: () => dispatch({ type: "ACCEPT" }),
        rejectRequest: () => dispatch({ type: "REJECT" }),
        markPassengerOnboard: () => dispatch({ type: "BOARD" }),
        skipSimulation,
        cancelRide,
        closeSummary: () => dispatch({ type: "CLOSE_SUMMARY" }),
    };
}
