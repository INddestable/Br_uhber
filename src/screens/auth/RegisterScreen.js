import { View, Text, Button } from "react-native";

export default function RegisterScreen({ navigation }) {
    return (
        <View>
            <Text>Register Screen</Text>

            <Button
                title="Comenzar registro"
                onPress={() => {
                    navigation.getParent().navigate("Registration");
                }}
            />
        </View>
    );
}