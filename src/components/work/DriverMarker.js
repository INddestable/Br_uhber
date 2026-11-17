import { View, StyleSheet } from "react-native";
export default function DriverMarker() {
    return (
        <View style={styles.marker}>
            <View style={[styles.wheel, styles.frontLeft]} />
            <View style={[styles.wheel, styles.frontRight]} />
            <View style={[styles.wheel, styles.backLeft]} />
            <View style={[styles.wheel, styles.backRight]} />
            <View style={styles.body}>
                <View style={styles.windshield} />
                <View style={styles.roof} />
                <View style={styles.rearWindow} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    marker: { width: 46, height: 50, alignItems: "center", justifyContent: "center" },
    body: {
        width: 25,
        height: 42,
        borderRadius: 10,
        backgroundColor: "#4D5DFA",
        borderWidth: 2,
        borderColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        shadowColor: "#111827",
        shadowOpacity: 0.22,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    roof: { width: 14, height: 13, borderRadius: 4, backgroundColor: "#E8ECFF" },
    windshield: { position: "absolute", top: 5, width: 15, height: 6, borderRadius: 3, backgroundColor: "#9EB6FF" },
    rearWindow: { position: "absolute", bottom: 4, width: 14, height: 5, borderRadius: 2, backgroundColor: "#9EB6FF" },
    wheel: { position: "absolute", zIndex: 1, width: 4, height: 9, borderRadius: 2, backgroundColor: "#242B43" },
    frontLeft: { top: 9, left: 7 },
    frontRight: { top: 9, right: 7 },
    backLeft: { bottom: 9, left: 7 },
    backRight: { bottom: 9, right: 7 },
});
