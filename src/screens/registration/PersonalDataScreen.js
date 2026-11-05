import { View, Text, TextInput, ScrollView } from "react-native";

import { useRegistration } from "../../context/RegistrationContext";

export default function PersonalDataScreen() {

    const { formData, updateFormData } = useRegistration();

    return (
        <ScrollView>
            <View>
                <Text>Nombre completo</Text>
                <TextInput
                    placeholder="Escribe tu nombre completo"
                    value={formData.fullName || ""}
                    onChangeText={(text) => {
                        updateFormData("fullName", text);
                    }}
                />

                <Text>Documento de identidad</Text>
                <TextInput
                    placeholder="Número de documento"
                    keyboardType="numeric"
                    maxLength={10}
                    value={formData.documentNumber || ""}
                    onChangeText={(text) => {
                        updateFormData("documentNumber", text.replace(/[^0-9]/g, ""));
                    }}
                />
            </View>
        </ScrollView>
    );
}