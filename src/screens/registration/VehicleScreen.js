import { useState } from "react";

import {
    View,
    Text,
    TextInput,
    ScrollView,
    Button,
    Pressable,
    Image,
    StyleSheet
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

function validateVehicleYear(year) {
  const yearRegex = /^\d{4}$/;

  return (
    yearRegex.test(String(year)) &&
    Number(year) <= new Date().getFullYear()+1
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

    const [openDropdown, setOpenDropdown] = useState(null);

    const categoryOptions = [
        { label: t("vehicle.categories.economy"), value: "economy" },
        { label: t("vehicle.categories.xl"), value: "xl" },
        { label: t("vehicle.categories.premium"), value: "premium" }
    ];

    const colorOptions = [
        { label: t("vehicle.colors.white"), value: "white" },
        { label: t("vehicle.colors.black"), value: "black" },
        { label: t("vehicle.colors.gray"), value: "gray" },
        { label: t("vehicle.colors.red"), value: "red" },
        { label: t("vehicle.colors.blue"), value: "blue" },
        { label: t("vehicle.colors.silver"), value: "silver" },
        { label: t("vehicle.colors.other"), value: "other" }
    ];

    const pickVehiclePhoto = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8
        });

        if (!result.canceled) {
            updateFormData("vehiclePhoto", result.assets[0].uri);
        }
    };


return (
    <ScrollView>
        <View>
            <Text style={styles.label}>{t("vehicle.category")}</Text>

            <Pressable
                style={styles.dropdown}
                onPress={() => {
                    setOpenDropdown(
                        openDropdown === "category" ? null : "category"
                    );

                    setTouched(previous => ({
                        ...previous,
                        vehicleCategory: true
                    }));
                }}
            >
                <Text style={styles.dropdownText}>
                    {
                        categoryOptions.find(
                            option => option.value === formData.vehicleCategory
                        )?.label || t("vehicle.categoryPlaceholder")
                    }
                </Text>

                <Text style={styles.arrow}>
                    {openDropdown === "category" ? "⌃" : "⌄"}
                </Text>
            </Pressable>

            {openDropdown === "category" && (
                <View style={styles.dropdownList}>
                    {categoryOptions.map(option => (
                        <Pressable
                            key={option.value}
                            style={[
                                styles.dropdownOption,
                                formData.vehicleCategory === option.value &&
                                    styles.selectedOption
                            ]}
                            onPress={() => {
                                updateFormData("vehicleCategory", option.value);
                                setOpenDropdown(null);
                            }}
                        >
                            <Text style={styles.dropdownText}>
                                {option.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}

            {(showErrors || touched.vehicleCategory) &&
                !validation.vehicleCategory && (
                    <Text style={styles.error}>
                        {t("vehicle.errors.category")}
                    </Text>
                )
            }

            <Text style={styles.label}>{t("vehicle.color")}</Text>
            <Pressable
            style={styles.dropdown}
            onPress={() => {
                setOpenDropdown(openDropdown === "color" ? null : "color");

                setTouched(previous => ({
                ...previous,
                vehicleColor: true
                }));
            }}
            >
            <Text style={styles.dropdownText}>
                {colorOptions.find(
                option => option.value === formData.vehicleColor
                )?.label || t("vehicle.colorPlaceholder")}
            </Text>

            <Text style={styles.arrow}>
                {openDropdown === "color" ? "⌃" : "⌄"}
            </Text>
            </Pressable>

            {openDropdown === "color" && (
            <View style={styles.dropdownList}>
                {colorOptions.map(option => (
                <Pressable
                    key={option.value}
                    style={[
                    styles.dropdownOption,
                    formData.vehicleColor === option.value &&
                        styles.selectedOption
                    ]}
                    onPress={() => {
                    updateFormData("vehicleColor", option.value);
                    setOpenDropdown(null);
                    }}
                >
                    <Text style={styles.dropdownText}>
                    {option.label}
                    </Text>
                </Pressable>
                ))}
            </View>
            )}

            {(showErrors || touched.vehicleColor) &&
            !validation.vehicleColor && (
                <Text style={styles.error}>
                {t("vehicle.errors.color")}
                </Text>
            )}

            <Text style={styles.label}>{t("vehicle.plate")}</Text>
            <TextInput
                style={styles.input}
                value={formData.vehiclePlate || ""}
                onChangeText={text =>
                    updateFormData("vehiclePlate", text.toUpperCase())
                }
                onBlur={() =>
                    setTouched(previous => ({
                    ...previous,
                    vehiclePlate: true
                    }))
                }
                placeholder={t("vehicle.platePlaceholder")}
                maxLength={6}
                autoCapitalize="characters"
            />

                {(showErrors || touched.vehiclePlate) &&
                !validation.vehiclePlate && (
                    <Text style={styles.error}>
                    {t("vehicle.errors.plate")}
                    </Text>
                )}

            <Text style={styles.label}>{t("vehicle.brand")}</Text>
            <TextInput
                style={styles.input}
                value={formData.vehicleBrand || ""}
                onChangeText={text =>
                    updateFormData("vehicleBrand", text)
                }
                onBlur={() =>
                    setTouched(previous => ({
                    ...previous,
                    vehicleBrand: true
                    }))
                }
                placeholder={t("vehicle.brandPlaceholder")}
                maxLength={30}
            />

            {(showErrors || touched.vehicleBrand) && !validation.vehicleBrand && (
                <Text style={styles.error}>
                {t("vehicle.errors.brand")}
                </Text>
            )}

            <Text style={styles.label}>{t("vehicle.model")}</Text>
            <TextInput
                style={styles.input}
                value={formData.vehicleModel || ""}
                onChangeText={text =>
                    updateFormData("vehicleModel", text)
                }
                onBlur={() =>
                    setTouched(previous => ({
                    ...previous,
                    vehicleModel: true
                    }))
                }
                placeholder={t("vehicle.modelPlaceholder")}
                maxLength={30}
            />

            {(showErrors || touched.vehicleModel) &&
            !validation.vehicleModel && (
                <Text style={styles.error}>
                {t("vehicle.errors.model")}
                </Text>
            )}

            <Text style={styles.label}>{t("vehicle.year")}</Text>
            <TextInput
                style={styles.input}
                value={formData.vehicleYear || ""}
                onChangeText={text =>
                    updateFormData(
                    "vehicleYear",
                    text.replace(/\D/g, "")
                    )
                }
                onBlur={() =>
                    setTouched(previous => ({
                    ...previous,
                    vehicleYear: true
                    }))
                }
                placeholder={t("vehicle.yearPlaceholder")}
                keyboardType="numeric"
                maxLength={4}
            />

            {(showErrors || touched.vehicleYear) && !validation.vehicleYear && (
                <Text style={styles.error}>
                {t("vehicle.errors.year")}
                </Text>
            )}

            <Text style={styles.label}>{t("vehicle.capacity")}</Text>
            <TextInput
                style={styles.input}
                value={formData.vehicleCapacity || ""}
                onChangeText={text =>
                    updateFormData(
                        "vehicleCapacity",
                        text.replace(/\D/g, "")
                    )
                }
                onBlur={() =>
                    setTouched(previous => ({
                    ...previous,
                    vehicleCapacity: true
                    }))
                }
                placeholder={t("vehicle.capacityPlaceholder")}
                keyboardType="numeric"
            />

            {(showErrors || touched.vehicleCapacity) &&
            !validation.vehicleCapacity && (
                <Text style={styles.error}>
                {t("vehicle.errors.capacity")}
                </Text>
            )}

            <Text style={styles.label}>
                {t("vehicle.photo")}
            </Text>

            <Text>
                {t("vehicle.photoDescription")}
            </Text>

            <Pressable
                style={styles.dropdown}
                onPress={pickVehiclePhoto}
            >
            <Text style={styles.dropdownText}>
                {formData.vehiclePhoto
                ? t("vehicle.changePhoto")
                : t("vehicle.selectPhoto")}
            </Text>
            </Pressable>
                {formData.vehiclePhoto && (
                <Image
                    source={{ uri: formData.vehiclePhoto }}
                    style={styles.vehiclePhoto}
            />
            )}

            {(showErrors || touched.vehiclePhoto) &&
            !validation.vehiclePhoto && (
                <Text style={styles.error}>
                {t("vehicle.errors.photo")}
                </Text>
            )}

        </View>
    </ScrollView>
);
}

const styles = StyleSheet.create({
    label: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 8,
        color: "#222"
    },

    dropdown: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#CCCCCC",
        borderRadius: 8,
        padding: 14,
        backgroundColor: "#FFFFFF"
    },

    dropdownText: {
        fontSize: 15,
        color: "#222222"
    },

    arrow: {
        fontSize: 20,
        color: "#666666"
    },

    dropdownList: {
        borderWidth: 1,
        borderColor: "#CCCCCC",
        borderRadius: 8,
        marginTop: 4,
        backgroundColor: "#FFFFFF",
        overflow: "hidden"
    },

    dropdownOption: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#EEEEEE"
    },

    selectedOption: {
        backgroundColor: "#EEEEEE"
    },

    error: {
        color: "red",
        fontSize: 12,
        marginTop: 5
    },

    input: {
        borderWidth: 1,
        borderColor: "#CCCCCC",
        borderRadius: 8,
        padding: 14,
        fontSize: 15,
        backgroundColor: "#FFFFFF",
        color: "#222222"
    },

    vehiclePhoto: {
        width: "100%",
        height: 200,
        resizeMode: "contain",
        marginTop: 10
    }
});