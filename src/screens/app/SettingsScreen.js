import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

export default function SettingsScreen() {
    const { language, changeLanguage } = useLanguage();
    const { theme, changeTheme, colors, typography } = useTheme();

    const translations = {
        es: {
            title: "Ajustes",
            language: "Idioma",
            spanish: "Español",
            english: "Inglés",
            appearance: "Apariencia",
            light: "Modo claro",
            dark: "Modo oscuro",
        },
        en: {
            title: "Settings",
            language: "Language",
            spanish: "Spanish",
            english: "English",
            appearance: "Appearance",
            light: "Light mode",
            dark: "Dark mode",
        },
    };

    const t = translations[language] || translations.es;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 24,
        },
        title: {
            fontSize: 32,
            marginTop: 40,
            marginBottom: 35,
            fontFamily: typography.bold
        },
        sectionTitle: {
            fontSize: 20,
            marginBottom: 12,
            fontFamily: typography.regular
        },
        options: {
            flexDirection: "row",
            padding: 5,
            borderRadius: 12,
            marginBottom: 30,
        },
        option: {
            flex: 1,
            padding: 14,
            alignItems: "center",
            borderRadius: 9,
        },
        optionText: {
            fontFamily: typography.bold
        },
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            <Text style={[styles.title, { color: colors.text }]}>
                {t.title}
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t.language}
            </Text>

            <View style={[styles.options, { backgroundColor: colors.surface }]}>
                <Pressable
                    style={[
                        styles.option,
                        language === "es" && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => changeLanguage("es")}
                >
                    <Text style={[
                        styles.optionText,
                        { color: language === "es" ? "#FFFFFF" : colors.text }
                    ]}>
                        {t.spanish}
                    </Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.option,
                        language === "en" && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => changeLanguage("en")}
                >
                    <Text style={[
                        styles.optionText,
                        { color: language === "en" ? "#FFFFFF" : colors.text }
                    ]}>
                        {t.english}
                    </Text>
                </Pressable>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t.appearance}
            </Text>

            <View style={[styles.options, { backgroundColor: colors.surface }]}>
                <Pressable
                    style={[
                        styles.option,
                        theme === "light" && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => changeTheme("light")}
                >
                    <Text style={[
                        styles.optionText,
                        { color: theme === "light" ? "#FFFFFF" : colors.text }
                    ]}>
                        {t.light}
                    </Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.option,
                        theme === "dark" && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => changeTheme("dark")}
                >
                    <Text style={[
                        styles.optionText,
                        { color: theme === "dark" ? "#FFFFFF" : colors.text }
                    ]}>
                        {t.dark}
                    </Text>
                </Pressable>
            </View>

        </View>
    );
}