import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";

import { LanguageProvider } from "./src/context/LanguageContext";
import { ThemeProvider } from "./src/context/ThemeContext";

import "./src/config/i18n";

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <LanguageProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <NavigationContainer>
                            <RootNavigator />
                        </NavigationContainer>

                        <StatusBar style="auto" />
                    </AuthProvider>
                </ThemeProvider>
            </LanguageProvider>
        </GestureHandlerRootView>
    );
}