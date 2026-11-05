import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Button,
    Pressable,
    Image
} from "react-native";
import * as ImagePicker from "expo-image-picker";
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

function validateFullName(name) {
    const nameRegex = /^[\p{L}\s]+$/u;

    return (
        name.length <= 50 &&
        nameRegex.test(name) &&
        name.trim().length > 0
    );
}

function validateDocumentNumber(documentNumber) {
    const documentRegex = /^\d+$/;

    return (
        documentNumber.length >= 6 &&
        documentNumber.length <= 10 &&
        documentRegex.test(documentNumber)
    );
}

function validatePhone(phone) {
    const phoneRegex = /^\d{10}$/;

    return phoneRegex.test(phone);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
}

function validateBirthDate(birthDate) {
    if (!birthDate) return false;

    const today = new Date();
    const birth = parseBirthDate(birthDate);

    const minimumDate = new Date();
    minimumDate.setFullYear(
        minimumDate.getFullYear() - 18
    );

    return birth <= minimumDate && birth <= today;
}

function validateProfilePhoto(photo) {
    return Boolean(photo);
}

function validateGender(gender) {
    const validGenders = [
        "male",
        "female",
        "other",
        "preferNotToSay"
    ];

    return validGenders.includes(gender);
}

function validatePersonalData(data) {
    return {
        fullName: validateFullName(data.fullName || ""),
        documentNumber: validateDocumentNumber(data.documentNumber || ""),
        phone: validatePhone(data.phone || ""),
        email: validateEmail(data.email || ""),
        birthDate: validateBirthDate(data.birthDate),
        profilePhoto: validateProfilePhoto(data.profilePhoto),
        gender: validateGender(data.gender),
        language: ["es", "en"].includes(data.language || "es")
    };
}

export default function PersonalDataScreen({ navigation }) {    
    const { t, i18n } = useTranslation();
    const { formData, updateFormData } = useRegistration();

    const validation = validatePersonalData(formData);
    const isFormValid = Object.values(validation).every(Boolean);

    const handleContinue = () => {
        setShowErrors(true);

        if (!isFormValid) {
            return;
        }

        navigation.navigate("Vehicle");
    };

    const genderOptions = [
        { label: "personalData.gender.male", value: "male" },
        { label: "personalData.gender.female", value: "female" },
        { label: "personalData.gender.other", value: "other" },
        { label: "personalData.gender.preferNotToSay", value: "preferNotToSay" }
    ];

    const languageOptions = [
        { label: "personalData.language.spanish", value: "es" },
        { label: "personalData.language.english", value: "en" }
    ];

    const changeLanguage = (language) => {
        updateFormData("language", language);
        i18n.changeLanguage(language);
    };

    const [showDatePicker, setShowDatePicker] = useState(false);

    const [showErrors, setShowErrors] = useState(false);
    // Calculamos la fecha máxima permitida para tener 18 años.
    const maxBirthDate = new Date();
    maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 18);

    // Recuperamos la fecha que el usuario haya seleccionado anteriormente.
    const selectedBirthDate = parseBirthDate(formData.birthDate);

    // Preparamos la fecha para mostrarla en pantalla.
    const birthDateDisplay = formData.birthDate
        ? formatBirthDate(formData.birthDate, i18n.language)
        : t("personalData.birthDatePlaceholder");

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8
        });

        if (!result.canceled) {
            updateFormData("profilePhoto", result.assets[0].uri);
        }
    };

    return (
        <ScrollView>
            <View>

                <Text>{t("personalData.profilePhoto")}</Text>
                <Pressable onPress={pickImage}>
                    {formData.profilePhoto ? (
                        <Image
                            source={{ uri: formData.profilePhoto }}
                            style={{
                                width: 120,
                                height: 120,
                                borderRadius: 60
                            }}
                        />
                    ) : (
                        <View
                            style={{
                                width: 120,
                                height: 120,
                                borderRadius: 60,
                                backgroundColor: "#DDDDDD",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <Text>+</Text>
                        </View>
                    )}
                </Pressable>

                <Button
                    title={t("personalData.changePhoto")}
                    onPress={pickImage}
                />
                {showErrors && !validation.profilePhoto && (
                    <Text style={{ color: "red" }}>
                        {t("personalData.errors.profilePhoto")}
                    </Text>
                )}

                <Text>{t("personalData.fullName")}</Text>
                <TextInput
                    placeholder={t("personalData.fullNamePlaceholder")}
                    value={formData.fullName || ""}
                    maxLength={50}
                    onChangeText={(text) => {
                        updateFormData("fullName", text);
                    }}
                />
                {showErrors && !validation.fullName && (
                    <Text style={{ color: "red" }}>
                        {t("personalData.errors.fullName")}
                    </Text>
                )}

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
                {showErrors && !validation.documentNumber && (
                    <Text style={{ color: "red" }}>
                        {t("personalData.errors.documentNumber")}
                    </Text>
                )}

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
                {showErrors && !validation.phone && (
                    <Text style={{ color: "red" }}>
                        {t("personalData.errors.phone")}
                    </Text>
                )}

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
                {showErrors && !validation.email && (
                    <Text style={{ color: "red" }}>
                        {t("personalData.errors.email")}
                    </Text>
                )}

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
                {showErrors && !validation.birthDate && (
                    <Text style={{ color: "red" }}>
                        {t("personalData.errors.birthDate")}
                    </Text>
                )}

                <Text>{t("personalData.gender.title")}</Text>
                {genderOptions.map((option) => (
                    <Pressable
                        key={option.value}
                        onPress={() => {
                            updateFormData("gender", option.value);
                        }}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginVertical: 8,
                            gap: 10
                        }}
                    >
                        {/* Circulo exterior */}
                        <View
                            style={{
                                width: 22,
                                height: 22,
                                borderRadius: 11,
                                borderWidth: 2,
                                borderColor: formData.gender === option.value
                                    ? "#2685D8"
                                    : "#888",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            {/* Circulo interior */}
                            {formData.gender === option.value && (
                                <View
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: "#2685D8"
                                    }}
                                />
                            )}
                        </View>

                        <Text>{t(option.label)}</Text>
                    </Pressable>
                ))}
                {showErrors && !validation.gender && (
                    <Text style={{ color: "red" }}>
                        {t("personalData.errors.gender")}
                    </Text>
                )}

                <Text>{t("personalData.language.title")}</Text>

                {languageOptions.map((option) => {
                    const isSelected =
                        formData.language === option.value ||
                        (!formData.language && i18n.language === option.value);

                    return (
                        <Pressable
                            key={option.value}
                            onPress={() => changeLanguage(option.value)}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginVertical: 8,
                                gap: 10
                            }}
                        >
                            <View
                                style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 11,
                                    borderWidth: 2,
                                    borderColor: isSelected ? "#2685D8" : "#888",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}
                            >
                                {isSelected && (
                                    <View
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: 5,
                                            backgroundColor: "#2685D8"
                                        }}
                                    />
                                )}
                            </View>

                            <Text>{t(option.label)}</Text>
                        </Pressable>
                    );
                })}

            </View>

            <Button
                title={t("register.continue")}
                onPress={handleContinue}
                disabled={!isFormValid}
            />

        </ScrollView>
    );
}
