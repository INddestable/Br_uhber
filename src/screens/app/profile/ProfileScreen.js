
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../../config/firebase";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { useTranslation } from "react-i18next";

import ProfileTabs from "../../../components/profile/ProfileTabs";
import PersonalInfo from "../../../components/profile/PersonalInfo";

export default function ProfileScreen() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth();

    const [driver, setDriver] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeTab, setActiveTab] = useState("personal");

    useEffect(() => {
        if (authLoading) return;

        let isMounted = true;

        async function loadDriver() {
            try {
                if (!user?.uid) {
                    throw new Error("No hay un usuario autenticado.");
                }


                const driverRef = doc(db, "drivers", user.uid);
                const driverSnapshot = await getDoc(driverRef);

                if (!driverSnapshot.exists()) {
                    throw new Error("No se encontró el perfil del conductor.");
                }

                if (isMounted) {
                    setDriver(driverSnapshot.data());
                }

            } catch (err) {
                if (isMounted) {
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setProfileLoading(false);
                }
            }
        }

        loadDriver();

        return () => {
            isMounted = false;
        };
    }, [user?.uid, authLoading]);



    if (authLoading || profileLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>



            <ProfileTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {activeTab === "personal" && (
                <PersonalInfo driver={driver} />
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "stretch",
    },
});
