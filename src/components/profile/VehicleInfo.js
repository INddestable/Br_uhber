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
        { key: "vehicleBrand", label: t("profile.vehicle.brand"), maxLength: 30, hint: t("vehicle.errors.brand"), validate: value => validateVehicleBrand(value || "") ? null : t("vehicle.errors.brand") },
        { key: "vehicleModel", label: t("profile.vehicle.model"), maxLength: 30, hint: t("vehicle.errors.model"), validate: value => validateVehicleModel(value || "") ? null : t("vehicle.errors.model") },
        {
            key: "vehicleYear",
            label: t("profile.vehicle.year"),
            keyboardType: "numeric",
            maxLength: 4,
            sanitize: value => String(value).replace(/\D/g, "").slice(0, 4),
            hint: t("vehicle.errors.year"),
            validate: value => validateVehicleYear(value) ? null : t("vehicle.errors.year"),
        },
        { key: "vehiclePlate", label: t("profile.vehicle.plate"), maxLength: 6, autoCapitalize: "characters", sanitize: value => String(value).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6), hint: t("vehicle.errors.plate"), validate: value => validateVehiclePlate(String(value || "").toUpperCase()) ? null : t("vehicle.errors.plate") },
        {
            key: "vehicleColor",
            label: t("profile.vehicle.color"),
            type: "select",
            options: colorOptions,
            hint: t("vehicle.errors.color"),
            validate: value => colorOptions.some(option => option.value === value) ? null : t("vehicle.errors.color"),
        },
        {
            key: "vehicleCapacity",
            label: t("profile.vehicle.capacity"),
            keyboardType: "numeric",
            maxLength: 2,
            sanitize: value => String(value).replace(/\D/g, "").slice(0, 2),
            hint: t("vehicle.errors.capacity"),
            validate: (value, form) => validateVehicleCapacity(value, form.vehicleCategory) ? null : t("vehicle.errors.capacity"),
        },
        {
            key: "vehicleCategory",
            label: t("profile.vehicle.category"),
            type: "select",
            options: categoryOptions,
            hint: t("vehicle.errors.category"),
            validate: value => validateVehicleCategory(value) ? null : t("vehicle.errors.category"),
        },
    ];

    const photos = [
        {
            key: "vehiclePhoto",
            label: t("profile.vehicle.photo"),
            folder: "vehicles",
            hint: t("vehicle.errors.photo"),
            validate: value => value?.publicId ? null : t("vehicle.errors.photo"),
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
