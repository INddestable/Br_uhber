import ProfileSectionForm from "./ProfileSectionForm";

import { updateDriverProfile } from "../../utils/updateDriverProfile";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

function validateVehicleCategory(category) {
    return ["economy", "xl", "premium"].includes(category);
}

function validateVehiclePlate(plate) {
    return /^[A-Z]{3}\d{3}$/.test(plate);
}

function validateVehicleBrand(brand) {
    return brand.trim().length > 0 && brand.length <= 30;
}

function validateVehicleModel(model) {
    return model.trim().length > 0 && model.length <= 30;
}

function validateVehicleYear(year) {
    return /^\d{4}$/.test(String(year)) && Number(year) <= new Date().getFullYear();
}

function validateVehicleCapacity(capacity, category) {
    return /^\d+$/.test(String(capacity)) && Number(capacity) >= (category === "xl" ? 6 : 1);
}

export default function VehicleInfo({ driver, onSaved }) {
    const { user } = useAuth();
    const { t } = useTranslation();

    const categoryOptions = [
        { value: "economy", label: t("vehicle.categories.economy") },
        { value: "xl", label: t("vehicle.categories.xl") },
        { value: "premium", label: t("vehicle.categories.premium") },
    ];

    const colorOptions = [
        { value: "white", label: t("vehicle.colors.white") },
        { value: "black", label: t("vehicle.colors.black") },
        { value: "gray", label: t("vehicle.colors.gray") },
        { value: "red", label: t("vehicle.colors.red") },
        { value: "blue", label: t("vehicle.colors.blue") },
        { value: "silver", label: t("vehicle.colors.silver") },
        { value: "other", label: t("vehicle.colors.other") },
    ];

    const fields = [
        { key: "vehicleBrand", label: t("profile.vehicle.brand") },
        { key: "vehicleModel", label: t("profile.vehicle.model") },
        {
            key: "vehicleYear",
            label: t("profile.vehicle.year"),
            keyboardType: "numeric",
        },
        { key: "vehiclePlate", label: t("profile.vehicle.plate") },
        {
            key: "vehicleColor",
            label: t("profile.vehicle.color"),
            type: "select",
            options: colorOptions,
        },
        {
            key: "vehicleCapacity",
            label: t("profile.vehicle.capacity"),
            keyboardType: "numeric",
        },
        {
            key: "vehicleCategory",
            label: t("profile.vehicle.category"),
            type: "select",
            options: categoryOptions,
        },
    ];

    const photos = [
        {
            key: "vehiclePhoto",
            label: t("profile.vehicle.photo"),
            folder: "vehicles",
        },
    ];

    async function handleSave(data) {
        const vehicleBrand = data.vehicleBrand?.trim() || "";
        const vehicleModel = data.vehicleModel?.trim() || "";
        const vehiclePlate = data.vehiclePlate?.trim().toUpperCase() || "";

        if (!validateVehicleBrand(vehicleBrand)) {
            throw new Error(t("vehicle.errors.brand"));
        }

        if (!validateVehicleModel(vehicleModel)) {
            throw new Error(t("vehicle.errors.model"));
        }

        if (!validateVehicleYear(data.vehicleYear)) {
            throw new Error(t("vehicle.errors.year"));
        }

        if (!validateVehiclePlate(vehiclePlate)) {
            throw new Error(t("vehicle.errors.plate"));
        }

        if (!colorOptions.some(option => option.value === data.vehicleColor)) {
            throw new Error(t("vehicle.errors.color"));
        }

        if (!validateVehicleCategory(data.vehicleCategory)) {
            throw new Error(t("vehicle.errors.category"));
        }

        if (!validateVehicleCapacity(data.vehicleCapacity, data.vehicleCategory)) {
            throw new Error(t("vehicle.errors.capacity"));
        }

        if (!data.vehiclePhoto?.publicId) {
            throw new Error(t("vehicle.errors.photo"));
        }

        const savedData = {
            vehicleBrand,
            vehicleModel,
            vehicleYear: Number(data.vehicleYear),
            vehiclePlate,
            vehicleColor: data.vehicleColor,
            vehicleCapacity: Number(data.vehicleCapacity),
            vehicleCategory: data.vehicleCategory,
            vehiclePhoto: data.vehiclePhoto,
        };

        await updateDriverProfile(user.uid, "vehicle", savedData);
        onSaved?.(savedData);
    }

    return (
        <ProfileSectionForm
            title={t("profile.vehicle.title")}
            initialData={driver.vehicle}
            fields={fields}
            photos={photos}
            onSave={handleSave}
        />
    );
}
