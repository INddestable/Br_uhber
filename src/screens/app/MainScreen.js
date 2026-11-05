import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

export default function MainScreen({ navigation }) {
    const { colors } = useTheme();
    const { language } = useLanguage();

    const t = {
        es: {
            title: "Panel principal",
            description: "¡Bienvenido a Bruhber Driver!",
            settings: "Ajustes"
        },
        en: {
            title: "Main panel",
            description: "Welcome to Bruhber Driver!",
            settings: "Settings"
        }
    }[language] || {};

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.primary }]}>
                {t.title}
            </Text>

            <Text style={[styles.description, { color: colors.secondaryText }]}>
                {t.description}
            </Text>

            <Pressable
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate("Settings")}
            >
                <Text style={styles.buttonText}>{t.settings}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 25
    },
    title: {
        fontSize: 28,
        fontWeight: "bold"
    },
    description: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 30
    },
    button: {
        paddingVertical: 13,
        paddingHorizontal: 35,
        borderRadius: 10
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16
    }
});