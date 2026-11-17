import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

const themes = {
    light: {
        background: "#FFFFFF",
        surface: "#F3F4F6",
        text: "#111827",
        secondaryText: "#6B7280",
        primary: "#2563EB",
        border: "#E5E7EB",
        card: "#FFFFFF",
    },

    dark: {
        background: "#111827",
        surface: "#1F2937",
        text: "#F9FAFB",
        secondaryText: "#9CA3AF",
        primary: "#60A5FA",
        border: "#374151",
        card: "#1F2937",
    },
};

const typography = {
    regular: "Roboto",
    medium: "RobotoMedium",
    bold: "RobotoBold"
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        async function loadTheme() {
            const savedTheme = await AsyncStorage.getItem("appTheme");

            if (savedTheme === "light" || savedTheme === "dark") {
                setTheme(savedTheme);
            }
        }

        loadTheme();
    }, []);

    async function changeTheme(newTheme) {
        await AsyncStorage.setItem("appTheme", newTheme);
        setTheme(newTheme);
    }

    const colors = themes[theme];

    return (
        <ThemeContext.Provider
            value={{
                theme,
                colors,
                typography,
                changeTheme,
                isDark: theme === "dark",
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}