import { View, Text, TextInput, ScrollView } from "react-native";

import { useRegistration } from "../../context/RegistrationContext";

export default function PersonalDataScreen() {

    const { formData, setFormData } = useRegistration();

    return (
        <ScrollView>
            <View>
                <Text>Nombre completo</Text>

                <TextInput
                    placeholder="Escribe tu nombre completo"
                    value={formData.fullName || ""}
                    onChangeText={(text) => {
                        setFormData({
                            ...formData,
                            fullName: text
                        });
                    }}
                />
            </View>
        </ScrollView>
    );
}