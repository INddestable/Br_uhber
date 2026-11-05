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

export default function LoginScreen({ navigation }) {
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
            // 1. Autenticar usuario.
            const credential = await signInWithEmailAndPassword(
                auth,
                email.trim().toLowerCase(),
                password
            );

            const uid = credential.user.uid;

            // 2. Consultar perfil del conductor.
            const driverRef = doc(db, "drivers", uid);
            const driverSnapshot = await getDoc(driverRef);

            if (!driverSnapshot.exists()) {
                throw new Error("DRIVER_NOT_FOUND");
            }

            const driverData = driverSnapshot.data();

            // 3. Redirigir según aprobación.
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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bruhber</Text>

            <Text style={styles.subtitle}>Iniciar sesión</Text>

            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />

            <TextInput
                style={styles.input}
                placeholder="Contraseña"
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
                    <Text style={styles.buttonText}>Ingresar</Text>
                )}
            </Pressable>

            <Pressable
                onPress={() => navigation.navigate("Register")}
            >
                <Text style={styles.registerText}>
                    ¿No tienes cuenta? Regístrate
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 25,
        backgroundColor: "#FFFFFF"
    },
    title: {
        fontSize: 36,
        fontWeight: "bold",
        textAlign: "center",
        color: "#2878D0",
        marginBottom: 10
    },
    subtitle: {
        fontSize: 22,
        textAlign: "center",
        marginBottom: 30,
        color: "#222222"
    },
    input: {
        borderWidth: 1,
        borderColor: "#CCCCCC",
        borderRadius: 10,
        padding: 14,
        marginBottom: 15,
        fontSize: 16
    },
    button: {
        backgroundColor: "#2878D0",
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
        color: "#2878D0",
        fontSize: 15
    }
});