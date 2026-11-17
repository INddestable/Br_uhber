
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function ProfileTabs({ activeTab, onTabChange }) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const tabs = [
        { id: "personal", label: t("profile.tabs.personal") },
        { id: "vehicle", label: t("profile.tabs.vehicle") },
        { id: "documents", label: t("profile.tabs.documents") },
    ];

    return (
        <View style={[styles.container, { borderBottomColor: colors.border }]}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                    <Pressable
                        key={tab.id}
                        style={[
                            styles.tab,
                            isActive && {
                                borderBottomColor: colors.primary,
                            },
                        ]}
                        onPress={() => onTabChange(tab.id)}
                    >
                        <Text
                            style={{
                                color: isActive
                                    ? colors.primary
                                    : colors.secondaryText,
                                fontWeight: isActive ? "700" : "500",
                            }}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        width: "100%",
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderBottomWidth: 3,
        borderBottomColor: "transparent",
    },
});
