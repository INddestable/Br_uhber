import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function WorkScreen() {
    const { colors } = useTheme();
    const { t } = useTranslation();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={{ color: colors.text }}>
                {t("navigation.work")}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});