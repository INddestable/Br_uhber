import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Pressable,
    Image,
    StyleSheet,
    Modal,
    Platform,
    Alert, ActivityIndicator
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { registerDriver } from "../../services/driverScreen";

import { useRegistration } from "../../context/RegistrationContext";
import { useTranslation } from "react-i18next";


// Regla provisional: revisión técnico-mecánica a partir de 5 años.
const TECHNICAL_REVIEW_AGE = 5;



// Convierte una fecha a YYYY-MM-DD sin desfase de zona horaria.
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Convierte YYYY-MM-DD en una fecha local.
function parseDate(dateString) {
    if (!dateString) return new Date();

    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day);
}

function isFutureDate(dateString) {
    if (!dateString) return false;

    const today = formatDate(new Date());

    return dateString > today;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function DocumentsScreen({ navigation }) {
    const { t } = useTranslation();
    const { formData, updateFormData } = useRegistration();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showErrors, setShowErrors] = useState(false);
    const [touched, setTouched] = useState({});
    const [datePicker, setDatePicker] = useState(null);

    // Determinar si el vehículo requiere técnico-mecánica.
    const currentYear = new Date().getFullYear();

    const today = new Date();
    const maxSoatDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 365
    );

    const requiresTechnicalReview =
        Number(formData.vehicleYear) <= currentYear - TECHNICAL_REVIEW_AGE;

    // Actualizar campos del RegistrationContext.
    function handleChange(field, value) {
        updateFormData(field, value);
    }

    // Marcar un campo como visitado.
    function handleBlur(field) {
        setTouched(previous => ({
            ...previous,
            [field]: true
        }));
    }

    // Mostrar errores cuando corresponda.
    function shouldShowError(field) {
        return showErrors || touched[field];
    }

    // Seleccionar fotografía.
    async function pickPhoto(field) {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7
        });

        if (!result.canceled) {
            handleChange(field, result.assets[0].uri);
            handleBlur(field);
        }
    }

    // Abrir selector de fecha.
    function openDatePicker(field) {
        setDatePicker(field);
    }

    // Guardar fecha seleccionada.
    function handleDateChange(event, selectedDate) {
        if (Platform.OS === "android") {
            setDatePicker(null);
        }

        if (selectedDate && datePicker) {
            handleChange(datePicker, formatDate(selectedDate));
            handleBlur(datePicker);
        }
    }

    function closeDatePicker() {
        setDatePicker(null);
    }

    // Validaciones.
    const validation = {
        licenseNumber: Boolean(formData.licenseNumber?.trim()),
        licensePhoto: Boolean(formData.licensePhoto),
        licenseExpiration: isFutureDate(formData.licenseExpiration),

        soatPhoto: Boolean(formData.soatPhoto),
        soatExpiration: isFutureDate(formData.soatExpiration),

        paymentEmail: isValidEmail(formData.paymentEmail || ""),
        acceptedTerms: formData.acceptedTerms === true
    };

    // Validaciones adicionales si aplica técnico-mecánica.
    if (requiresTechnicalReview) {
        validation.technicalReviewPhoto =
            Boolean(formData.technicalReviewPhoto);

        validation.technicalReviewExpiration =
            isFutureDate(formData.technicalReviewExpiration);
    }

    const isFormValid = Object.values(validation).every(Boolean);

    // Intentar continuar.
    async function handleContinue() {
        setShowErrors(true);

        if (!isFormValid || isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await registerDriver(formData);

            console.log("Registro completado:", result.uid);

            // Ya no necesitamos conservar la contraseña.
            updateFormData("password", "");

            // Ir a la pantalla de aprobación pendiente.
            navigation.replace("Pending");

        } catch (error) {
            console.error("Error completando el registro:", error);

            Alert.alert(
                t("documents.registrationErrorTitle"),
                t("documents.registrationErrorMessage")
            );

        } finally {
            setIsSubmitting(false);
        }
    }

    // Componente para mostrar errores.
    function ErrorMessage({ field }) {
        if (!shouldShowError(field) || validation[field]) {
            return null;
        }

        let message = "";

        if (field === "licenseNumber") {
            message = t("documents.errors.licenseNumber");
        } else if (field.includes("Photo")) {
            message = t("documents.errors.photo");
        } else if (field.includes("Expiration")) {
            message = t("documents.errors.expiration");
        } else if (field === "paymentEmail") {
            message = t("documents.errors.email");
        } else if (field === "acceptedTerms") {
            message = t("documents.errors.terms");
        }

        return <Text style={styles.error}>{message}</Text>;
    }

    // Componente reutilizable para seleccionar fotografías.
    function PhotoSelector({ field, label }) {
        const photo = formData[field];

        return (
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>{label}</Text>

                <Pressable
                    style={styles.photoButton}
                    onPress={() => pickPhoto(field)}
                >
                    {photo ? (
                        <Image
                            source={{ uri: photo }}
                            style={styles.photoPreview}
                        />
                    ) : (
                        <Text style={styles.photoButtonText}>
                            {t("documents.selectPhoto")}
                        </Text>
                    )}
                </Pressable>

                <ErrorMessage field={field} />
            </View>
        );
    }

    // Componente reutilizable para fechas.
    function DateSelector({ field, label }) {
        const date = formData[field];

        return (
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>{label}</Text>

                <Pressable
                    style={styles.dateButton}
                    onPress={() => openDatePicker(field)}
                >
                    <Text style={styles.dateButtonText}>
                        {date || t("documents.selectDate")}
                    </Text>
                </Pressable>

                <ErrorMessage field={field} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>
                {t("documents.title")}
            </Text>

            <Text style={styles.description}>
                {t("documents.description")}
            </Text>

            {/* LICENCIA DE CONDUCCION */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {t("documents.license.title")}
                </Text>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>
                        {t("documents.license.number")}
                    </Text>

                    <TextInput
                        style={styles.input}
                        value={formData.licenseNumber || ""}
                        onChangeText={value =>
                            handleChange("licenseNumber", value.replace(/\D/g, ""))
                        }
                        keyboardType="numeric"
                        onBlur={() => handleBlur("licenseNumber")}
                        placeholder={t("documents.license.numberPlaceholder")}
                        maxLength={30}
                    />

                    <ErrorMessage field="licenseNumber" />
                </View>

                <PhotoSelector
                    field="licensePhoto"
                    label={t("documents.license.photo")}
                />

                <DateSelector
                    field="licenseExpiration"
                    label={t("documents.license.expiration")}
                />
            </View>

            {/* SOAT */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {t("documents.soat.title")}
                </Text>

                <PhotoSelector
                    field="soatPhoto"
                    label={t("documents.soat.photo")}
                />

                <DateSelector
                    field="soatExpiration"
                    label={t("documents.soat.expiration")}
                />
            </View>

            {/* TÉCNICO-MECÁNICA */}
            {requiresTechnicalReview && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {t("documents.technicalReview.title")}
                    </Text>

                    <Text style={styles.description}>
                        {t("documents.technicalReview.description")}
                    </Text>

                    <PhotoSelector
                        field="technicalReviewPhoto"
                        label={t("documents.technicalReview.photo")}
                    />

                    <DateSelector
                        field="technicalReviewExpiration"
                        label={t("documents.technicalReview.expiration")}
                    />
                </View>
            )}

            {/* MERCADO PAGO */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {t("documents.payment.title")}
                </Text>

                <Text style={styles.description}>
                    {t("documents.payment.description")}
                </Text>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>
                        {t("documents.payment.email")}
                    </Text>

                    <TextInput
                        style={styles.input}
                        value={formData.paymentEmail || ""}
                        onChangeText={value =>
                            handleChange("paymentEmail", value)
                        }
                        onBlur={() => handleBlur("paymentEmail")}
                        placeholder={t("documents.payment.emailPlaceholder")}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <ErrorMessage field="paymentEmail" />
                </View>
            </View>

            {/* TÉRMINOS Y CONDICIONES */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {t("documents.terms.title")}
                </Text>

                <View style={styles.commissionContainer}>
                    <Text style={styles.commissionText}>
                        {t("documents.terms.commission")}
                    </Text>

                    <Text style={styles.commissionText}>
                        {t("documents.terms.tips")}
                    </Text>
                </View>

                <Pressable
                    style={styles.termsRow}
                    onPress={() =>
                        handleChange(
                            "acceptedTerms",
                            !formData.acceptedTerms
                        )
                    }
                >
                    <View
                        style={[
                            styles.checkbox,
                            formData.acceptedTerms && styles.checkboxChecked
                        ]}
                    >
                        {formData.acceptedTerms && (
                            <Text style={styles.checkmark}>✓</Text>
                        )}
                    </View>

                    <Text style={styles.termsText}>
                        {t("documents.terms.accept")}
                    </Text>
                </Pressable>

                <ErrorMessage field="acceptedTerms" />
            </View>

            {/* SELECTOR DE FECHAS */}
            <Modal
                visible={Boolean(datePicker)}
                transparent
                animationType="fade"
                onRequestClose={closeDatePicker}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.dateModal}>
                        <Text style={styles.modalTitle}>
                            {t("documents.selectDate")}
                        </Text>

                        {datePicker && (
                            <DateTimePicker
                                value={parseDate(formData[datePicker])}
                                mode="date"
                                display={
                                    Platform.OS === "ios"
                                        ? "spinner"
                                        : "default"
                                }
                                minimumDate={new Date()}
                                    maximumDate={
                                    datePicker === "soatExpiration"
                                        ? maxSoatDate
                                        : undefined
                                }
                                onChange={handleDateChange}
                            />
                        )}

                        {Platform.OS === "ios" && (
                            <Pressable
                                style={styles.modalButton}
                                onPress={closeDatePicker}
                            >
                                <Text style={styles.modalButtonText}>
                                    {t("documents.confirmDate")}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </Modal>

            {/* CONTINUAR */}
            <Pressable
                style={styles.continueButton}
                onPress={handleContinue}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.continueButtonText}>
                        {t("documents.continue")}
                    </Text>
                )}
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF"
    },
    content: {
        padding: 20,
        paddingBottom: 40
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#222222"
    },
    description: {
        fontSize: 14,
        color: "#666666",
        marginBottom: 15
    },
    section: {
        marginTop: 20,
        padding: 15,
        backgroundColor: "#F5F5F5",
        borderRadius: 10
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#222222"
    },
    fieldContainer: {
        marginBottom: 15
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 7,
        color: "#333333"
    },
    input: {
        borderWidth: 1,
        borderColor: "#CCCCCC",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#FFFFFF",
        fontSize: 15
    },
    photoButton: {
        minHeight: 110,
        borderWidth: 1,
        borderColor: "#AAAAAA",
        borderStyle: "dashed",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        overflow: "hidden"
    },
    photoButtonText: {
        color: "#555555",
        fontSize: 14
    },
    photoPreview: {
        width: "100%",
        height: 180,
        resizeMode: "cover"
    },
    dateButton: {
        padding: 13,
        borderWidth: 1,
        borderColor: "#CCCCCC",
        borderRadius: 8,
        backgroundColor: "#FFFFFF"
    },
    dateButtonText: {
        color: "#333333",
        fontSize: 15
    },
    error: {
        color: "#D32F2F",
        fontSize: 12,
        marginTop: 5
    },
    commissionContainer: {
        padding: 12,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        marginBottom: 15
    },
    commissionText: {
        fontSize: 14,
        color: "#333333",
        marginVertical: 4
    },
    termsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    checkbox: {
        width: 23,
        height: 23,
        borderWidth: 1,
        borderColor: "#777777",
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center"
    },
    checkboxChecked: {
        backgroundColor: "#2878D0",
        borderColor: "#2878D0"
    },
    checkmark: {
        color: "#FFFFFF",
        fontWeight: "bold"
    },
    termsText: {
        flex: 1,
        fontSize: 14,
        color: "#333333"
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20
    },
    dateModal: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 15,
        alignItems: "center"
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10
    },
    modalButton: {
        backgroundColor: "#2878D0",
        padding: 12,
        borderRadius: 8,
        alignSelf: "stretch",
        alignItems: "center",
        marginTop: 10
    },
    modalButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold"
    },
    continueButton: {
        backgroundColor: "#2878D0",
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 25
    },
    continueButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold"
    }
});