import { View, Text, TextInput, ScrollView } from "react-native";

import { useRegistration } from "../../context/RegistrationContext";
import { useTranslation } from "react-i18next";

export default function PersonalDataScreen() {
    const { t } = useTranslation();
    const { formData, updateFormData } = useRegistration();

    return (
        <ScrollView>
            <View>
                <Text>{t("personalData.fullName")}</Text>
                <TextInput
                    placeholder={t("personalData.fullNamePlaceholder")}
                    value={formData.fullName || ""}
                    onChangeText={(text) => {
                        updateFormData("fullName", text);
                    }}
                />

                <Text>{t("personalData.documentNumber")}</Text>
                <TextInput
                    placeholder={t("personalData.documentNumberPlaceholder")}
                    keyboardType="numeric"
                    maxLength={10}
                    value={formData.documentNumber || ""}
                    onChangeText={(text) => {
                        updateFormData("documentNumber", text.replace(/[^0-9]/g, ""));
                    }}
                />
                
                <Text>{t("personalData.phone")}</Text>
                <TextInput
                    placeholder={t("personalData.phonePlaceholder")}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={formData.phone || ""}
                    onChangeText={(text) => {
                        updateFormData("phone", text.replace(/[^0-9]/g, ""));
                    }}
                />

                <Text>{t("personalData.email")}</Text>
                <TextInput
                    placeholder={t("personalData.emailPlaceholder")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email || ""}
                    onChangeText={(text) => {
                        updateFormData("email", text);
                    }}
                />
            </View>
        </ScrollView>
    );
}