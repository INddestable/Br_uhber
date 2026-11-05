import { View, Text, StyleSheet } from "react-native";

export default function MainScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Panel principal
            </Text>

            <Text style={styles.description}>
                ¡Bienvenido a Bruhber Driver!
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF"
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2878D0"
    },
    description: {
        fontSize: 16,
        marginTop: 10,
        color: "#666666"
    }
});