import ProfileSectionForm from "./ProfileSectionForm";


import { updateDriverProfile } from "../../utils/updateDriverProfile";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function VehicleInfo({ driver }) {
    const { user } = useAuth();
    const { t } = useTranslation();

    const fields = [
        { key: "vehicleBrand", label: t("profile.vehicle.brand") },
        { key: "vehicleModel", label: t("profile.vehicle.model") },
        {
            key: "vehicleYear",
            label: t("profile.vehicle.year"),
            keyboardType: "numeric",
        },
        { key: "vehiclePlate", label: t("profile.vehicle.plate") },
        { key: "vehicleColor", label: t("profile.vehicle.color") },
        {
            key: "vehicleCapacity",
            label: t("profile.vehicle.capacity"),
            keyboardType: "numeric",
        },
        { key: "vehicleCategory", label: t("profile.vehicle.category") },
    ];

    const photos = [
        {
            key: "vehiclePhoto",
            label: t("profile.vehicle.photo"),
            folder: "vehicles",
        },
    ];

    async function handleSave(data) {
        await updateDriverProfile(user.uid, "vehicle", data);
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