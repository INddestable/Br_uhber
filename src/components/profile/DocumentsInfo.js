import ProfileSectionForm from "./ProfileSectionForm";

import { updateDriverProfile } from "../../utils/updateDriverProfile";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function DocumentsInfo({ driver }) {
    const { user } = useAuth();
    const { t } = useTranslation();

    const fields = [
        {
            key: "licenseNumber",
            label: t("profile.documents.licenseNumber"),
        },
        {
            key: "licenseExpiration",
            label: t("profile.documents.licenseExpiration"),
            type: "date",
        },
        {
            key: "soatExpiration",
            label: t("profile.documents.soatExpiration"),
            type: "date",
        },
        {
            key: "paymentEmail",
            label: t("profile.documents.paymentEmail"),
        },
        {
            key: "acceptedTerms",
            label: t("profile.documents.acceptedTerms"),
            readOnly: true,
        },
    ];

    const photos = [
        {
            key: "licensePhoto",
            label: t("profile.documents.licensePhoto"),
            folder: "licenses",
        },
        {
            key: "soatPhoto",
            label: t("profile.documents.soatPhoto"),
            folder: "soat",
        },
        {
            key: "technicalReviewPhoto",
            label: t("profile.documents.technicalReviewPhoto"),
            folder: "technical-review",
        },
    ];

    async function handleSave(data) {
        const editableData = { ...data };

        // No permitimos modificar los términos aceptados.
        delete editableData.acceptedTerms;

        // No enviamos documentos técnicos opcionales vacíos.
        if (!editableData.technicalReviewPhoto) {
            delete editableData.technicalReviewPhoto;
        }

        await updateDriverProfile(
            user.uid,
            "documents",
            editableData
        );
    }

    return (
        <ProfileSectionForm
            title={t("profile.documents.title")}
            initialData={driver.documents}
            fields={fields}
            photos={photos}
            onSave={handleSave}
        />
    );
}