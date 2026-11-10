import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";

import { LanguageProvider } from "./src/context/LanguageContext";
import { ThemeProvider } from "./src/context/ThemeContext";

import "./src/config/i18n";

import { useFonts } from "expo-font";

import {
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold
} from "@expo-google-fonts/roboto";

export default function App() {
    const [fontsLoaded] = useFonts({
        Roboto: Roboto_400Regular,
        RobotoMedium: Roboto_500Medium,
        RobotoBold: Roboto_700Bold
    });

    if (!fontsLoaded) {
        return null;
    }
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

