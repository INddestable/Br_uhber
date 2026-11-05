
import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Pressable,
    Image,
    StyleSheet
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { useRegistration } from "../../context/RegistrationContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
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

    const { colors } = useTheme();
    const { language: appLanguage, changeLanguage: changeAppLanguage } = useLanguage();

    const validation = validatePersonalData(formData);
    const isFormValid = Object.values(validation).every(Boolean);

    const [touched, setTouched] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    // Estilos dinámicos según el tema seleccionado.
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background
        },
        content: {
            padding: 20,
            paddingBottom: 40,
            gap: 10
        },
        label: {
            color: colors.text,
            fontSize: 16,
            fontWeight: "600",
            marginTop: 12
        },
        input: {
            backgroundColor: colors.surface,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            padding: 12,
            fontSize: 16
        },
        placeholder: {
            color: colors.secondaryText
        },
        error: {
            color: "#EF4444",
            fontSize: 13
        },
        button: {
            backgroundColor: colors.primary,
            padding: 14,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 5
        },
        buttonText: {
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "bold"
        },
        photoPlaceholder: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            justifyContent: "center",
            alignItems: "center"
        },
        photoPlaceholderText: {
            fontSize: 30,
            color: colors.secondaryText
        },
        option: {
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 8,
            gap: 10
        },
        radioOuter: {
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 2,
            justifyContent: "center",
            alignItems: "center"
        },
        radioInner: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.primary
        },
        optionText: {
            color: colors.text,
            fontSize: 15
        }
    });

    // Cambia de pantalla cuando todos los campos son válidos.
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

    // Actualiza el idioma del formulario y de toda la aplicación.
    const changeLanguage = async (language) => {
        updateFormData("language", language);
        await changeAppLanguage(language);
    };

    // Calculamos la fecha máxima permitida para tener 18 años.
    const maxBirthDate = new Date();
    maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 18);

    // Recuperamos la fecha seleccionada anteriormente.
    const selectedBirthDate = parseBirthDate(formData.birthDate);

    // Preparamos la fecha para mostrarla en pantalla.
    const birthDateDisplay = formData.birthDate
        ? formatBirthDate(formData.birthDate, i18n.language)
        : t("personalData.birthDatePlaceholder");

    // Selección de fotografía.
    const pickImage = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            return;
        }

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
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            <View>

                {/* Fotografía de perfil */}
                <Text style={styles.label}>
                    {t("personalData.profilePhoto")}
                </Text>

                <Pressable
                    onPress={() => {
                        setTouched(previous => ({
                            ...previous,
                            profilePhoto: true
                        }));

                        pickImage();
                    }}
                    style={{ alignSelf: "center", marginVertical: 10 }}
                >
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
                        <View style={styles.photoPlaceholder}>
                            <Text style={styles.photoPlaceholderText}>+</Text>
                        </View>
                    )}
                </Pressable>

                <Pressable
                    style={styles.button}
                    onPress={() => {
                        setTouched(previous => ({
                            ...previous,
                            profilePhoto: true
                        }));

                        pickImage();
                    }}
                >
                    <Text style={styles.buttonText}>
                        {t("personalData.changePhoto")}
                    </Text>
                </Pressable>

                {(showErrors || touched.profilePhoto) && !validation.profilePhoto && (
                    <Text style={styles.error}>
                        {t("personalData.errors.profilePhoto")}
                    </Text>
                )}

                {/* Nombre completo */}
                <Text style={styles.label}>
                    {t("personalData.fullName")}
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder={t("personalData.fullNamePlaceholder")}
                    placeholderTextColor={colors.secondaryText}
                    value={formData.fullName || ""}
                    maxLength={50}
                    onChangeText={(text) => {
                        updateFormData("fullName", text);
                    }}
                    onBlur={() => {
                        setTouched(previous => ({
                            ...previous,
                            fullName: true
                        }));
                    }}
                />

                {(showErrors || touched.fullName) && !validation.fullName && (
                    <Text style={styles.error}>
                        {t("personalData.errors.fullName")}
                    </Text>
                )}

                {/* Documento */}
                <Text style={styles.label}>
                    {t("personalData.documentNumber")}
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder={t("personalData.documentNumberPlaceholder")}
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="numeric"
                    maxLength={10}
                    value={formData.documentNumber || ""}
                    onChangeText={(text) => {
                        updateFormData(
                            "documentNumber",
                            text.replace(/[^0-9]/g, "")
                        );
                    }}
                    onBlur={() => {
                        setTouched(previous => ({
                            ...previous,
                            documentNumber: true
                        }));
                    }}
                />

                {(showErrors || touched.documentNumber) && !validation.documentNumber && (
                    <Text style={styles.error}>
                        {t("personalData.errors.documentNumber")}
                    </Text>
                )}

                {/* Teléfono */}
                <Text style={styles.label}>
                    {t("personalData.phone")}
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder={t("personalData.phonePlaceholder")}
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={formData.phone || ""}
                    onChangeText={(text) => {
                        updateFormData(
                            "phone",
                            text.replace(/[^0-9]/g, "")
                        );
                    }}
                    onBlur={() => {
                        setTouched(previous => ({
                            ...previous,
                            phone: true
                        }));
                    }}
                />

                {(showErrors || touched.phone) && !validation.phone && (
                    <Text style={styles.error}>
                        {t("personalData.errors.phone")}
                    </Text>
                )}

                {/* Correo electrónico */}
                <Text style={styles.label}>
                    {t("personalData.email")}
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder={t("personalData.emailPlaceholder")}
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email || ""}
                    onChangeText={(text) => {
                        updateFormData("email", text);
                    }}
                    onBlur={() => {
                        setTouched(previous => ({
                            ...previous,
                            email: true
                        }));
                    }}
                />

                {(showErrors || touched.email) && !validation.email && (
                    <Text style={styles.error}>
                        {t("personalData.errors.email")}
                    </Text>
                )}

                {/* Fecha de nacimiento */}
                <Text style={styles.label}>
                    {t("personalData.birthDate")}
                </Text>

                <Pressable
                    style={styles.button}
                    onPress={() => {
                        setTouched(previous => ({
                            ...previous,
                            birthDate: true
                        }));

                        setShowDatePicker(true);
                    }}
                >
                    <Text style={styles.buttonText}>
                        {birthDateDisplay}
                    </Text>
                </Pressable>

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

                {(showErrors || touched.birthDate) && !validation.birthDate && (
                    <Text style={styles.error}>
                        {t("personalData.errors.birthDate")}
                    </Text>
                )}

                {/* Género */}
                <Text style={styles.label}>
                    {t("personalData.gender.title")}
                </Text>

                {genderOptions.map((option) => (
                    <Pressable
                        key={option.value}
                        onPress={() => {
                            updateFormData("gender", option.value);

                            setTouched(previous => ({
                                ...previous,
                                gender: true
                            }));
                        }}
                        style={styles.option}
                    >
                        <View
                            style={[
                                styles.radioOuter,
                                {
                                    borderColor: formData.gender === option.value
                                        ? colors.primary
                                        : colors.border
                                }
                            ]}
                        >
                            {formData.gender === option.value && (
                                <View style={styles.radioInner} />
                            )}
                        </View>

                        <Text style={styles.optionText}>
                            {t(option.label)}
                        </Text>
                    </Pressable>
                ))}

                {(showErrors || touched.gender) && !validation.gender && (
                    <Text style={styles.error}>
                        {t("personalData.errors.gender")}
                    </Text>
                )}

                {/* Idioma */}
                <Text style={styles.label}>
                    {t("personalData.language.title")}
                </Text>

                {languageOptions.map((option) => {
                    const isSelected =
                        formData.language === option.value ||
                        (!formData.language && appLanguage === option.value);

                    return (
                        <Pressable
                            key={option.value}
                            onPress={() => changeLanguage(option.value)}
                            style={styles.option}
                        >
                            <View
                                style={[
                                    styles.radioOuter,
                                    {
                                        borderColor: isSelected
                                            ? colors.primary
                                            : colors.border
                                    }
                                ]}
                            >
                                {isSelected && (
                                    <View style={styles.radioInner} />
                                )}
                            </View>

                            <Text style={styles.optionText}>
                                {t(option.label)}
                            </Text>
                        </Pressable>
                    );
                })}

            </View>

            {/* Continuar */}
            <Pressable
                style={styles.button}
                onPress={handleContinue}
            >
                <Text style={styles.buttonText}>
                    {t("register.continue")}
                </Text>
            </Pressable>

            <Pressable
                style={[
                    styles.button,
                    {
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border
                    }
                ]}
                onPress={() => navigation.getParent()?.navigate("Settings")}
            >
                <Text style={[styles.optionText, { fontWeight: "bold" }]}>
                    {t("settings.title", "Ajustes")} ⚙
                </Text>
            </Pressable>

        </ScrollView>
    );
}
