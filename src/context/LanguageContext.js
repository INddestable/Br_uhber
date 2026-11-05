import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../config/i18n";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(i18n.language || "es");

    useEffect(() => {
        async function loadLanguage() {
            const savedLanguage = await AsyncStorage.getItem("appLanguage");

            if (savedLanguage) {
                await i18n.changeLanguage(savedLanguage);
                setLanguage(savedLanguage);
            }
        }

        loadLanguage();
    }, []);

    async function changeLanguage(newLanguage) {
        await i18n.changeLanguage(newLanguage);
        await AsyncStorage.setItem("appLanguage", newLanguage);
        setLanguage(newLanguage);
    }

    return (
        <LanguageContext.Provider value={{ language, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}