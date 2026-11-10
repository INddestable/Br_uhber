import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

export default function PendingScreen({ navigation }) {
    const { colors, typography } = useTheme();
    const { language } = useLanguage();
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 25
        },
        title: {
            fontSize: 30,
            marginBottom: 15,
            fontFamily: typography.bold
        },
        description: {
            fontSize: 16,
            textAlign: "center",
            marginBottom: 20,
            fontFamily: typography.regular
        },
        status: {
            fontSize: 20,
            color: "#D99500",
            textAlign: "center",
            marginBottom: 30,
            fontFamily: typography.bold
        },
        button: {
            paddingVertical: 13,
            paddingHorizontal: 35,
            borderRadius: 10
        },
        buttonText: {
            color: "#FFFFFF",
            fontSize: 19,
            fontFamily: typography.bold
        }
    });

    const t = {
        es: {
            title: "Solicitud pendiente",
            description: "Hemos recibido tu solicitud para convertirte en conductor de Bruhber.",
            status: "Tu cuenta está pendiente de aprobación.",
            settings: "Ajustes"
        },
        en: {
            title: "Application pending",
            description: "We have received your application to become a Bruhber driver.",
            status: "Your account is awaiting approval.",
            settings: "Settings"
        }
    }[language] || {};

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>
                {t.title}
            </Text>

            <Text style={[styles.description, { color: colors.secondaryText }]}>
                {t.description}
            </Text>

            <Text style={styles.status}>
                {t.status}
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

