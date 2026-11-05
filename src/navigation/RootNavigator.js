
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthNavigator from "./AuthNavigator";
import RegistrationNavigator from "./RegistrationNavigator";

import { RegistrationProvider } from "../context/RegistrationContext";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    return (
        <RegistrationProvider>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false
                }}
            >
                <Stack.Screen
                    name="Auth"
                    component={AuthNavigator}
                />

                <Stack.Screen
                    name="Registration"
                    component={RegistrationNavigator}
                />
            </Stack.Navigator>
        </RegistrationProvider>
    );
}
