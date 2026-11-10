/*
ESTA PANTALLA SE ENCUENTRA DESCONTINUADA SIN EMBARGO NO SE PUEDE ELIMINAR PORQUE SE ROMPE LA APLICACION
XD

THIS SCREEN IS DISCONTINUED, HOWEVER, IT CANNOT BE DELETED BECAUSE IT WILL BREAK THE APPLICATION.
XD
*/


import { useState } from "react";

import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet
} from "react-native";

import { useRegistration } from "../../context/RegistrationContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

export default function RegisterScreen({ navigation }) {
    const { t } = useTranslation();
    const { colors } = useTheme();

    const { formData, updateFormData } = useRegistration();

    const [confirmPassword, setConfirmPassword] = useState("");

    const password = formData.password || "";

    const passwordValid = password.length >= 6;

    const passwordsMatch =
        password.length > 0 && password === confirmPassword;

    function handleContinue() {
        if (!passwordValid || !passwordsMatch) {
            return;
        }

        navigation.getParent().navigate("Registration");
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            padding: 24,
            backgroundColor: colors.background
        },
        settingsButton: {
            position: "absolute",
            top: 55,
            right: 25,
            padding: 10,
            borderRadius: 8,
            backgroundColor: colors.card
        },
        settingsButtonText: {
            color: colors.text,
            fontSize: 14
        },
        title: {
            fontSize: 26,
            fontWeight: "bold",
            marginBottom: 25,
            color: colors.text
        },
        label: {
            fontSize: 15,
            fontWeight: "600",
            marginBottom: 7,
            color: colors.text
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            padding: 13,
            marginBottom: 18,
            backgroundColor: colors.surface,
            color: colors.text
        },
        error: {
            color: "#D32F2F",
            fontSize: 12,
            marginTop: -12,
            marginBottom: 12
        },
        button: {
            backgroundColor: colors.primary,
            padding: 16,
            borderRadius: 10,
            alignItems: "center",
            marginTop: 10
        },
        buttonDisabled: {
            opacity: 0.45
        },
        buttonText: {
            color: "#FFFFFF",
            fontWeight: "bold",
            fontSize: 16
        }
    });

    return (
        <View style={styles.container}>

            <Pressable
                style={styles.settingsButton}
                onPress={() => navigation.getParent()?.navigate("Settings")}
            >
                <Text style={styles.settingsButtonText}>
                    {t("settings.title", "Ajustes")} ⚙
                </Text>
            </Pressable>

            <Text style={styles.title}>
                {t("auth.register.title")}
            </Text>

            <Text style={styles.label}>
                {t("auth.register.password")}
            </Text>

            <TextInput
                style={styles.input}
                value={password}
                onChangeText={value =>
                    updateFormData("password", value)
                }
                placeholder={t("auth.register.passwordPlaceholder")}
                placeholderTextColor={colors.secondaryText}
                secureTextEntry
                autoCapitalize="none"
            />

            {password.length > 0 && !passwordValid && (
                <Text style={styles.error}>
                    {t("auth.register.passwordError")}
                </Text>
            )}

            <Text style={styles.label}>
                {t("auth.register.confirmPassword")}
            </Text>

            <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t("auth.register.confirmPasswordPlaceholder")}
                placeholderTextColor={colors.secondaryText}
                secureTextEntry
                autoCapitalize="none"
            />

            {confirmPassword.length > 0 && !passwordsMatch && (
                <Text style={styles.error}>
                    {t("auth.register.passwordMismatch")}
                </Text>
            )}

            <Pressable
                style={[
                    styles.button,
                    (!passwordValid || !passwordsMatch) &&
                        styles.buttonDisabled
                ]}
                onPress={handleContinue}
                disabled={!passwordValid || !passwordsMatch}
            >
                <Text style={styles.buttonText}>
                    {t("auth.register.continue")}
                </Text>
            </Pressable>

        </View>
    );
}