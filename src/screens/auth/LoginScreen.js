import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    Alert,
    ActivityIndicator,
    StyleSheet
} from "react-native";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../config/firebase";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function LoginScreen({ navigation }) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        if (!email.trim() || !password) {
            Alert.alert("Error", "Completa todos los campos.");
            return;
        }

        setLoading(true);

        try {
            const credential = await signInWithEmailAndPassword(
                auth,
                email.trim().toLowerCase(),
                password
            );

            const uid = credential.user.uid;

            const driverRef = doc(db, "drivers", uid);
            const driverSnapshot = await getDoc(driverRef);

            if (!driverSnapshot.exists()) {
                throw new Error("DRIVER_NOT_FOUND");
            }

            const driverData = driverSnapshot.data();

            if (driverData.approvalStatus === "pending") {
                navigation.getParent().navigate("Pending");

            } else if (driverData.approvalStatus === "approved") {
                navigation.getParent().navigate("Main");

            } else {
                Alert.alert(
                    "Cuenta no aprobada",
                    "Tu solicitud no ha sido aprobada."
                );
            }

        } catch (error) {
            console.log("Error iniciando sesión:", error.code || error.message);

            let message = "No se pudo iniciar sesión.";

            if (error.code === "auth/invalid-credential") {
                message = "Correo o contraseña incorrectos.";
            } else if (error.code === "auth/invalid-email") {
                message = "El correo electrónico no es válido.";
            } else if (error.message === "DRIVER_NOT_FOUND") {
                message = "No se encontró el perfil del conductor.";
            }

            Alert.alert("Error de inicio de sesión", message);

        } finally {
            setLoading(false);
        }
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            padding: 25,
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
            fontSize: 36,
            fontWeight: "bold",
            textAlign: "center",
            color: colors.primary,
            marginBottom: 10
        },
        subtitle: {
            fontSize: 22,
            textAlign: "center",
            marginBottom: 30,
            color: colors.text
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            padding: 14,
            marginBottom: 15,
            fontSize: 16,
            color: colors.text,
            backgroundColor: colors.surface
        },
        button: {
            backgroundColor: colors.primary,
            padding: 16,
            borderRadius: 10,
            alignItems: "center",
            marginTop: 10
        },
        buttonText: {
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "bold"
        },
        registerText: {
            textAlign: "center",
            marginTop: 25,
            color: colors.primary,
            fontSize: 15
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

            <Text style={styles.title}>Bruhber</Text>

            <Text style={styles.subtitle}>
                {t("login.title", "Iniciar sesión")}
            </Text>

            <TextInput
                style={styles.input}
                placeholder={t("login.email", "Correo electrónico")}
                placeholderTextColor={colors.secondaryText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />

            <TextInput
                style={styles.input}
                placeholder={t("login.password", "Contraseña")}
                placeholderTextColor={colors.secondaryText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <Pressable
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.buttonText}>
                        {t("login.button", "Ingresar")}
                    </Text>
                )}
            </Pressable>

            <Pressable
                onPress={() => navigation.navigate("Register")}
            >
                <Text style={styles.registerText}>
                    {t("login.registerLink", "¿No tienes cuenta? Regístrate")}
                </Text>
            </Pressable>

        </View>
    );
}