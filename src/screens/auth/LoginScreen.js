import { View, Text, Button } from "react-native";

export default function LoginScreen({ navigation }) {
    return (
        <View>
            <Text>Login Screen</Text>

            <Button
                title="Ir a registro"
                onPress={() => navigation.navigate("Register")}
            />
        </View>
    );
}