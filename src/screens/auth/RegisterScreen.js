
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

export default function RegisterScreen({ navigation }) {
    const { t } = useTranslation();
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

    return (
        <View style={styles.container}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#FFFFFF"
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 25,
        color: "#222222"
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
        padding: 13,
        marginBottom: 18,
        backgroundColor: "#FFFFFF"
    },
    error: {
        color: "#D32F2F",
        fontSize: 12,
        marginTop: -12,
        marginBottom: 12
    },
    button: {
        backgroundColor: "#2878D0",
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
