import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Button
} from "react-native";

import { useRegistration } from "../../context/RegistrationContext";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";

// Convierte una fecha guardada en texto a un objeto Date.
function parseBirthDate(dateString) {
    if (!dateString) return null;

    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day);
}

// Convierte la fecha a un formato legible según el idioma.
function formatBirthDate(dateString, language) {
    if (!dateString) return "";

    const date = parseBirthDate(dateString);

    return date.toLocaleDateString(
        language === "en" ? "en-US" : "es-CO"
    );
}

export default function PersonalDataScreen() {
    const { t, i18n } = useTranslation();
    const { formData, updateFormData } = useRegistration();

    const [showDatePicker, setShowDatePicker] = useState(false);

    // Calculamos la fecha máxima permitida para tener 18 años.
    const maxBirthDate = new Date();
    maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 18);

    // Recuperamos la fecha que el usuario haya seleccionado anteriormente.
    const selectedBirthDate = parseBirthDate(formData.birthDate);

    // Preparamos la fecha para mostrarla en pantalla.
    const birthDateDisplay = formData.birthDate
        ? formatBirthDate(formData.birthDate, i18n.language)
        : t("personalData.birthDatePlaceholder");

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
                        updateFormData(
                            "documentNumber",
                            text.replace(/[^0-9]/g, "")
                        );
                    }}
                />

                <Text>{t("personalData.phone")}</Text>
                <TextInput
                    placeholder={t("personalData.phonePlaceholder")}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={formData.phone || ""}
                    onChangeText={(text) => {
                        updateFormData(
                            "phone",
                            text.replace(/[^0-9]/g, "")
                        );
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

                <Text>{t("personalData.birthDate")}</Text>
                <Button
                    title={birthDateDisplay}
                    onPress={() => setShowDatePicker(true)}
                />
                {showDatePicker && (
                    <DateTimePicker
                        value={selectedBirthDate || maxBirthDate}
                        mode="date"
                        display="default"
                        maximumDate={maxBirthDate}
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);

                            if (event.type === "set" && selectedDate) {
                                const year = selectedDate.getFullYear();

                                const month = String(
                                    selectedDate.getMonth() + 1
                                ).padStart(2, "0");

                                const day = String(
                                    selectedDate.getDate()
                                ).padStart(2, "0");

                                const formattedDate =
                                    `${year}-${month}-${day}`;

                                updateFormData(
                                    "birthDate",
                                    formattedDate
                                );
                            }
                        }}
                    />
                )}

            </View>
        </ScrollView>
    );
}
