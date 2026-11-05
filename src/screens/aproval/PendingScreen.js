import { View, Text, StyleSheet } from "react-native";

export default function PendingScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Solicitud pendiente
            </Text>

            <Text style={styles.description}>
                Hemos recibido tu solicitud para convertirte en conductor
                de Bruhber.
            </Text>

            <Text style={styles.status}>
                Tu cuenta está pendiente de aprobación.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 25,
        backgroundColor: "#FFFFFF"
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#222222"
    },
    description: {
        fontSize: 16,
        textAlign: "center",
        color: "#666666",
        marginBottom: 20
    },
    status: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#D99500",
        textAlign: "center"
    }
});