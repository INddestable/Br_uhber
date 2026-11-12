import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WorkMap({ location, colors, t }) {
    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <View style={styles.marker}><Ionicons name="car-sport" size={28} color="#FFFFFF" /></View>
            <Text style={[styles.title, { color: colors.text }]}>{t("work.mapMobileOnly")}</Text>
            {location ? <Text style={[styles.coords, { color: colors.secondaryText }]}>{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
    marker: { width: 54, height: 54, borderRadius: 20, backgroundColor: "#4D5DFA", alignItems: "center", justifyContent: "center", marginBottom: 15 },
    title: { fontSize: 15, fontWeight: "600", textAlign: "center" },
    coords: { fontSize: 12, marginTop: 8 },
});
