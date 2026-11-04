import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}
        >

        </Stack.Navigator>
    );

}