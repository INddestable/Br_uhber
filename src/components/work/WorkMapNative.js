import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";

const MAPLIBRE_VERSION = "6.17.0";

function createMapHTML() {
    return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css">
<style>
html,body,#map{height:100%;width:100%;margin:0;padding:0;overflow:hidden;background:#e9eef4}
.car-marker{width:34px;height:48px;border:2px solid #fff;border-radius:14px;background:#4d5dfa;box-shadow:0 3px 8px #18213855;position:relative;box-sizing:border-box}
.car-marker:before{content:'';position:absolute;width:18px;height:15px;left:6px;top:14px;background:#e8ecff;border-radius:5px}
.car-marker:after{content:'';position:absolute;width:14px;height:5px;left:8px;top:5px;background:#b8ccff;border-radius:3px}
.passenger-marker{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#4d5dfa;border:3px solid #fff;color:#fff;font:700 15px sans-serif;box-shadow:0 2px 6px #18213855}
.destination-marker{width:20px;height:20px;border:5px solid #4d5dfa;border-radius:50%;background:#fff;box-sizing:border-box}
.credit{position:absolute;bottom:6px;left:8px;padding:3px 6px;border-radius:4px;background:#ffffffd9;color:#344054;font:10px Arial,sans-serif;z-index:2;pointer-events:none}
</style></head><body><div id="map"></div><div class="credit">© OpenStreetMap contributors · rutas OSRM</div>
<script type="module">
import * as maplibregl from 'https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.mjs';
let map, driverMarker, passengerMarker, destinationMarker, mapLoaded = false, centeredOnGps = false, lastRideKey = '', lastRouteKey = '';
let lastPayload = { location: null, ride: null, primary: '#4D5DFA', isDark: false };
const notify = (type, message) => window.ReactNativeWebView?.postMessage(JSON.stringify({ type, message }));
const styleUrl = (isDark) => 'https://tiles.openfreemap.org/styles/' + (isDark ? 'dark' : 'positron');

function createMarker(className, text = '') {
  const element = document.createElement('div');
  element.className = className;
  element.textContent = text;
  return element;
}
function clearRideLayers() {
  if (map.getLayer('ride-route-line')) map.removeLayer('ride-route-line');
  if (map.getSource('ride-route')) map.removeSource('ride-route');
  lastRouteKey = '';
}
function routeCoordinates(payload) {
  const ride = payload.ride;
  if (!ride) return [];
  const fallback = ride.phase === 'inProgress'
    ? [ride.pickupLocation, ride.destination]
    : [payload.location || ride.route?.[0] || ride.pickupLocation, ride.pickupLocation];
  return (ride.route && ride.route.length > 1 ? ride.route : fallback)
    .map(point => [point.longitude, point.latitude]);
}
function drawRoute(payload) {
  const coordinates = routeCoordinates(payload);
  if (coordinates.length < 2) { clearRideLayers(); return; }
  const data = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } };
  const source = map.getSource('ride-route');
  const routeKey = payload.ride.id + ':' + payload.ride.phase + ':' + Boolean(payload.ride.routeReady);
  if (source) {
    if (routeKey !== lastRouteKey) source.setData(data);
    map.setPaintProperty('ride-route-line', 'line-color', payload.primary);
  } else {
    map.addSource('ride-route', {
      type: 'geojson',
      data,
      attribution: 'Route: OSRM · © OpenStreetMap contributors'
    });
    map.addLayer({
      id: 'ride-route-line',
      type: 'line',
      source: 'ride-route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': payload.primary, 'line-width': 5, 'line-opacity': 0.9 }
    });
  }
  lastRouteKey = routeKey;
}
function fitRoute(payload) {
  const coordinates = routeCoordinates(payload);
  if (coordinates.length < 2) return;
  const bounds = new maplibregl.LngLatBounds(coordinates[0], coordinates[0]);
  coordinates.forEach(coordinate => bounds.extend(coordinate));
  map.fitBounds(bounds, { padding: { top: 135, right: 60, bottom: 250, left: 60 }, maxZoom: 16, duration: 450 });
}
function renderPayload(payload) {
  lastPayload = payload;
  if (!mapLoaded || !map) return;
  if (payload.location) {
    const driverPosition = [payload.location.longitude, payload.location.latitude];
    if (!driverMarker) {
      driverMarker = new maplibregl.Marker({ element: createMarker('car-marker'), anchor: 'center' })
        .setLngLat(driverPosition).addTo(map);
    } else driverMarker.setLngLat(driverPosition);
    if (!centeredOnGps) {
      map.jumpTo({ center: driverPosition, zoom: 15 });
      centeredOnGps = true;
    }
  } else {
    driverMarker?.remove();
    driverMarker = null;
  }

  const ride = payload.ride;
  if (!ride) {
    passengerMarker?.remove(); destinationMarker?.remove();
    passengerMarker = null; destinationMarker = null;
    clearRideLayers(); lastRideKey = '';
    return;
  }

  if (!passengerMarker) passengerMarker = new maplibregl.Marker({ element: createMarker('passenger-marker', 'P'), anchor: 'center' });
  passengerMarker.setLngLat([ride.pickupLocation.longitude, ride.pickupLocation.latitude]).addTo(map);
  if (!destinationMarker) destinationMarker = new maplibregl.Marker({ element: createMarker('destination-marker'), anchor: 'center' });
  destinationMarker.setLngLat([ride.destination.longitude, ride.destination.latitude]).addTo(map);
  drawRoute(payload);

  const rideKey = ride.id + ':' + ride.phase + ':' + Boolean(ride.routeReady);
  if (rideKey !== lastRideKey) { fitRoute(payload); lastRideKey = rideKey; }
}
window.updateMapData = function(payload) {
  if (map && payload.isDark !== lastPayload.isDark) {
    lastPayload = payload;
    mapLoaded = false;
    map.setStyle(styleUrl(payload.isDark));
    map.once('style.load', () => { mapLoaded = true; lastRideKey = ''; renderPayload(lastPayload); notify('ready'); });
    return;
  }
  renderPayload(payload);
};
window.centerOnDriver = function(location) {
  const target = location || lastPayload.location;
  if (!map || !target) return;
  centeredOnGps = true;
  map.flyTo({ center: [target.longitude, target.latitude], zoom: 15, duration: 450 });
};
try {
  map = new maplibregl.Map({
    container: 'map',
    style: styleUrl(lastPayload.isDark),
    center: [0, 0],
    zoom: 1,
    attributionControl: true,
    cooperativeGestures: false
  });
  map.on('load', () => { mapLoaded = true; renderPayload(lastPayload); notify('ready'); });
  map.on('error', event => { if (!mapLoaded) notify('mapError', event.error?.message || 'Map style failed to load'); });
} catch (error) { notify('mapError', error?.message || 'Map initialization failed'); }
</script></body></html>`;
}

export default function WorkMapNative({ location, ride, colors, isDark, t, onLocate, locating }) {
    const webViewRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(null);
    const [reloadId, setReloadId] = useState(0);
    const html = useMemo(() => createMapHTML(), []);
    const payload = useMemo(() => JSON.stringify({
        location,
        ride: ride ? {
            id: ride.request.id,
            phase: ride.phase,
            passengerName: ride.request.passengerName,
            pickupLocation: ride.request.pickupLocation,
            destination: ride.request.destination,
            route: ride.route,
            routeReady: ride.routeReady,
        } : null,
        primary: colors.primary,
        isDark,
    }).replace(/</g, "\\u003c"), [location, ride, colors.primary, isDark]);

    useEffect(() => {
        if (!ready) return;
        webViewRef.current?.injectJavaScript(`window.updateMapData(${payload}); true;`);
    }, [ready, payload]);

    useEffect(() => {
        if (ready || error) return undefined;
        const timeout = setTimeout(() => setError(t("work.errors.mapLoad")), 20000);
        return () => clearTimeout(timeout);
    }, [ready, error, reloadId, t]);

    function handleMessage(event) {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === "ready") { setError(null); setReady(true); }
            if (message.type === "mapError") setError(t("work.errors.mapLoad"));
        } catch {
            // Ignore unrelated messages from the embedded map page.
        }
    }

    async function recenter() {
        const freshLocation = await onLocate?.();
        if (onLocate && !freshLocation) return;
        const locationPayload = freshLocation ? JSON.stringify(freshLocation) : "null";
        webViewRef.current?.injectJavaScript(`window.centerOnDriver(${locationPayload}); true;`);
    }

    return (
        <View style={styles.container}>
            <WebView
                key={reloadId}
                ref={webViewRef}
                source={{ html, baseUrl: "https://app.local/" }}
                originWhitelist={["*"]}
                javaScriptEnabled
                domStorageEnabled
                onMessage={handleMessage}
                onError={() => { setError(t("work.errors.mapLoad")); setReady(false); }}
                onHttpError={() => { setError(t("work.errors.mapLoad")); setReady(false); }}
                style={styles.webview}
            />
            {!ready && !error ? (
                <View style={[styles.loading, { backgroundColor: colors.surface }]}>
                    <ActivityIndicator color={colors.primary} />
                    <Text style={[styles.message, { color: colors.secondaryText }]}>{t("work.errors.mapLoading")}</Text>
                </View>
            ) : null}
            {error ? (
                <View style={[styles.errorOverlay, { backgroundColor: colors.surface }]}>
                    <Ionicons name="map-outline" size={30} color={colors.secondaryText} />
                    <Text style={[styles.message, { color: colors.text }]}>{error}</Text>
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => { setError(null); setReady(false); setReloadId((value) => value + 1); }}
                        style={[styles.retry, { backgroundColor: colors.primary }]}
                    >
                        <Text style={styles.retryText}>{t("work.retryMap")}</Text>
                    </Pressable>
                </View>
            ) : null}
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("work.recenter")}
                onPress={recenter}
                style={[styles.recenter, { backgroundColor: colors.card || colors.surface }]}
            >
                {locating ? <ActivityIndicator color={colors.text} size="small" /> : <Ionicons name="locate-outline" size={21} color={colors.text} />}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#E9EEF4" },
    webview: { flex: 1, backgroundColor: "transparent" },
    loading: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", gap: 10 },
    errorOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", paddingHorizontal: 30, gap: 14 },
    message: { textAlign: "center", fontSize: 14 },
    retry: { paddingHorizontal: 20, paddingVertical: 11, borderRadius: 13 },
    retryText: { color: "#FFFFFF", fontWeight: "700" },
    recenter: { position: "absolute", right: 16, top: 180, width: 48, height: 48, borderRadius: 16, elevation: 4, justifyContent: "center", alignItems: "center", zIndex: 2 },
});
