import { View, Text, StyleSheet } from "react-native";

import ProfileSectionForm from "./ProfileSectionForm";
import { updateDriverProfile } from "../../utils/updateDriverProfile";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

function getLatestAdultBirthDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
}

function parseBirthDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function validateFullName(name) {
    return (
        name.trim().length > 0 &&
        name.length <= 50 &&
        /^[\p{L}\s]+$/u.test(name)
    );
}

function validateDocumentNumber(documentNumber) {
    return /^\d{6,10}$/.test(documentNumber || "");
}

function validatePhone(phone) {
    return /^\d{10}$/.test(phone || "");
}

function validateBirthDate(birthDate) {
    if (!birthDate) return false;

    const birth = parseBirthDate(birthDate);
    return birth <= getLatestAdultBirthDate();
}

export default function PersonalInfo({ driver, onSaved }) {
    const { user } = useAuth();
    const { colors } = useTheme();
    const { t } = useTranslation();

    const genderOptions = [
        { value: "male", label: t("personalData.gender.male") },
        { value: "female", label: t("personalData.gender.female") },
        { value: "other", label: t("personalData.gender.other") },
        {
            value: "preferNotToSay",
            label: t("personalData.gender.preferNotToSay"),
        },
    ];

    const languageOptions = [
        { value: "es", label: t("personalData.language.spanish") },
        { value: "en", label: t("personalData.language.english") },
    ];

    const fields = [
        {
            key: "fullName",
            label: t("profile.personal.fullName"),
            maxLength: 50,
            sanitize: value => String(value).replace(/[^\p{L}\s]/gu, "").slice(0, 50),
            hint: t("personalData.errors.fullName"),
            validate: value => validateFullName(value || "") ? null : t("personalData.errors.fullName"),
        },
        {
            key: "documentNumber",
            label: t("profile.personal.documentNumber"),
            keyboardType: "numeric",
            maxLength: 10,
            sanitize: value => String(value).replace(/\D/g, "").slice(0, 10),
            hint: t("personalData.errors.documentNumber"),
            validate: value => validateDocumentNumber(value) ? null : t("personalData.errors.documentNumber"),
        },
        {
            key: "phone",
            label: t("profile.personal.phone"),
            keyboardType: "numeric",
            maxLength: 10,
            sanitize: value => String(value).replace(/\D/g, "").slice(0, 10),
            hint: t("personalData.errors.phone"),
            validate: value => validatePhone(value) ? null : t("personalData.errors.phone"),
        },
        {
            key: "email",
            label: t("profile.personal.email"),
            readOnly: true,
        },
        {
            key: "birthDate",
            label: t("profile.personal.birthDate"),
            type: "date",
            maximumDate: getLatestAdultBirthDate(),
            hint: t("personalData.errors.birthDate"),
            validate: value => validateBirthDate(value) ? null : t("personalData.errors.birthDate"),
        },
        {
            key: "gender",
            label: t("profile.personal.gender"),
            type: "select",
            options: genderOptions,
            hint: t("personalData.errors.gender"),
            validate: value => genderOptions.some(option => option.value === value) ? null : t("personalData.errors.gender"),
        },
        {
            key: "language",
            label: t("personalData.language.title"),
            type: "select",
            options: languageOptions,
            hint: t("personalData.errors.language"),
            validate: value => languageOptions.some(option => option.value === value) ? null : t("personalData.errors.language"),
        },
    ];

    const photos = [
        {
            key: "profilePhoto",
            label: t("personalData.profilePhoto"),
            folder: "profiles",
            hint: t("personalData.errors.profilePhoto"),
            validate: value => value?.publicId ? null : t("personalData.errors.profilePhoto"),
        },
    ];

    async function handleSave(data) {
        const fullName = data.fullName?.trim() || "";

        if (!validateFullName(fullName)) {
            throw new Error(t("personalData.errors.fullName"));
        }

        if (!validateDocumentNumber(data.documentNumber)) {
            throw new Error(t("personalData.errors.documentNumber"));
        }

        if (!validatePhone(data.phone)) {
            throw new Error(t("personalData.errors.phone"));
        }

        if (!validateBirthDate(data.birthDate)) {
            throw new Error(t("personalData.errors.birthDate"));
        }

        if (!genderOptions.some(option => option.value === data.gender)) {
            throw new Error(t("personalData.errors.gender"));
        }

        if (!languageOptions.some(option => option.value === data.language)) {
            throw new Error(t("personalData.errors.language"));
        }

        if (!data.profilePhoto?.publicId) {
            throw new Error(t("personalData.errors.profilePhoto"));
        }

        const savedData = {
            fullName,
            documentNumber: data.documentNumber,
            phone: data.phone,
            birthDate: data.birthDate,
            gender: data.gender,
            language: data.language,
            profilePhoto: data.profilePhoto,
        };

        await updateDriverProfile(user.uid, "personalData", savedData);
        onSaved?.(savedData);
    }

    const footer = (
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
    );

    return (
        <ProfileSectionForm
            title={t("profile.personal.title")}
            initialData={driver.personalData}
            fields={fields}
            photos={photos}
            onSave={handleSave}
            footer={footer}
        />
    );
}

const styles = StyleSheet.create({
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
