import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PersonalDataScreen from "../screens/registration/PersonalDataScreen";
import VehicleScreen from "../screens/registration/VehicleScreen";
import DocumentsScreen from "../screens/registration/DocumentsScreen";
import PendingScreen from "../screens/aproval/PendingScreen";

const Stack = createNativeStackNavigator();

export default function RegistrationNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="PersonalData"
                component={PersonalDataScreen}
            />

            <Stack.Screen
                name="Vehicle"
                component={VehicleScreen}
            />

            <Stack.Screen
                name="Documents"
                component={DocumentsScreen}
            />

            <Stack.Screen
                name="Pending"
                component={PendingScreen}
            />
        </Stack.Navigator>
    );
}