import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthNavigator from "./AuthNavigator";
import RegistrationNavigator from "./RegistrationNavigator";

import PendingScreen from "../screens/aproval/PendingScreen";
import MainScreen from "../screens/app/MainScreen";
import SettingsScreen from "../screens/app/SettingsScreen";

import { RegistrationProvider } from "../context/RegistrationContext";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    return (
        <RegistrationProvider>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Auth" component={AuthNavigator} />
                <Stack.Screen name="Registration" component={RegistrationNavigator} />

                <Stack.Screen name="Pending" component={PendingScreen} />
                <Stack.Screen name="Main" component={MainScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
        </RegistrationProvider>
    );
}