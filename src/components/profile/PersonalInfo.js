
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from "react-native";

import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function PersonalInfo({ driver }) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const personalData = driver.personalData;

    const fields = [
        {
            label: t("profile.personal.fullName"),
            value: personalData.fullName,
        },
        {
            label: t("profile.personal.documentNumber"),
            value: personalData.documentNumber,
        },
        {
            label: t("profile.personal.phone"),
            value: personalData.phone,
        },
        {
            label: t("profile.personal.email"),
            value: personalData.email,
        },
        {
            label: t("profile.personal.birthDate"),
            value: personalData.birthDate,
        },
        {
            label: t("profile.personal.gender"),
            value: t(`profile.personal.genders.${personalData.gender}`),
        },
    ];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Text style={[styles.title, { color: colors.text }]}>
                {t("profile.personal.title")}
            </Text>

            {fields.map((field, index) => (
                <View
                    key={index}
                    style={[
                        styles.field,
                        { backgroundColor: colors.surface },
                    ]}
                >
                    <Text style={{ color: colors.secondaryText }}>
                        {field.label}
                    </Text>

                    <Text style={[styles.value, { color: colors.text }]}>
                        {field.value || "-"}
                    </Text>
                </View>
            ))}

            <View
                style={[
                    styles.paymentCard,
                    { backgroundColor: colors.surface },
                ]}
            >
                <Text style={[styles.paymentTitle, { color: colors.text }]}>
                    {t("profile.personal.mercadoPago.title")}
                </Text>

                <Text style={{ color: colors.secondaryText }}>
                    {t("profile.personal.mercadoPago.description")}
                </Text>

                <View
                    style={[
                        styles.status,
                        { backgroundColor: colors.background },
                    ]}
                >
                    <Text style={{ color: colors.secondaryText }}>
                        {t("profile.personal.mercadoPago.status")}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
    },
    content: {
        padding: 16,
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 4,
    },
    field: {
        padding: 14,
        borderRadius: 10,
        gap: 6,
    },
    value: {
        fontSize: 16,
        fontWeight: "600",
    },
    paymentCard: {
        padding: 16,
        borderRadius: 12,
        gap: 10,
        marginTop: 8,
    },
    paymentTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    status: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
    },
});
