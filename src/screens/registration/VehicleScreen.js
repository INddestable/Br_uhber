import { useState } from "react";

import {
    View,
    Text,
    TextInput,
    ScrollView,
    Button,
    Pressable,
    Image
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { useRegistration } from "../../context/RegistrationContext";
import { useTranslation } from "react-i18next";

function validateVehicleCategory(category) {
    const validCategories = ["economy", "xl", "premium"];

    return validCategories.includes(category);
}

function validateVehiclePlate(plate) {
    const plateRegex = /^[A-Z]{3}\d{3}$/;

    return plateRegex.test(plate.toUpperCase());
}

function validateVehicleBrand(brand) {
    return brand.trim().length > 0 && brand.length <= 30;
}

function validateVehicleModel(model) {
    return model.trim().length > 0 && model.length <= 30;
}

function validateVehicleYear(year) {
    const yearRegex = /^\d{4}$/;

    return (
        yearRegex.test(String(year)) &&
        Number(year) <= new Date().getFullYear()
    );
}

function validateVehicleColor(color) {
    return Boolean(color);
}

function validateVehicleCapacity(capacity, category) {
    const capacityRegex = /^\d+$/;

    return (
        capacityRegex.test(String(capacity)) &&
        Number(capacity) >= (category === "xl" ? 6 : 1)
    );
}

function validateVehiclePhoto(photo) {
    return Boolean(photo);
}

function validateVehicleData(data) {
    return {
        vehicleCategory: validateVehicleCategory(data.vehicleCategory),
        vehiclePlate: validateVehiclePlate(data.vehiclePlate || ""),
        vehicleBrand: validateVehicleBrand(data.vehicleBrand || ""),
        vehicleModel: validateVehicleModel(data.vehicleModel || ""),
        vehicleYear: validateVehicleYear(data.vehicleYear || ""),
        vehicleColor: validateVehicleColor(data.vehicleColor),
        vehicleCapacity: validateVehicleCapacity(
            data.vehicleCapacity || "",
            data.vehicleCategory
        ),
        vehiclePhoto: validateVehiclePhoto(data.vehiclePhoto)
    };
}

export default function VehicleScreen({ navigation }) {
    const { t } = useTranslation();
    const { formData, updateFormData } = useRegistration();

    const validation = validateVehicleData(formData);

    const isFormValid = Object.values(validation).every(Boolean);

    const [touched, setTouched] = useState({});
    const [showErrors, setShowErrors] = useState(false);

    return (
        <View>
            <Text>Vehicle Screen</Text>
        </View>
    );
}