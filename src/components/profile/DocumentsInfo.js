import ProfileSectionForm from "./ProfileSectionForm";

import { updateDriverProfile } from "../../utils/updateDriverProfile";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

const TECHNICAL_REVIEW_AGE = 5;

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function tomorrow() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
}

function soatLimit() {
    const date = new Date();
    date.setDate(date.getDate() + 365);
    return date;
}

function isFutureDate(dateString) {
    if (!dateString) return false;

    return dateString > formatDate(new Date());
}

function isWithinSoatLimit(dateString) {
    return Boolean(dateString) && dateString <= formatDate(soatLimit());
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function DocumentsInfo({ driver, onSaved }) {
    const { user } = useAuth();
    const { t } = useTranslation();

    const currentYear = new Date().getFullYear();
    const vehicleYear = Number(driver.vehicle?.vehicleYear);
    const requiresTechnicalReview =
        Number.isInteger(vehicleYear) &&
        vehicleYear <= currentYear - TECHNICAL_REVIEW_AGE;

    const fields = [
        {
            key: "licenseNumber",
            label: t("profile.documents.licenseNumber"),
            keyboardType: "numeric",
            maxLength: 30,
            sanitize: value => String(value).replace(/\D/g, "").slice(0, 30),
            hint: t("documents.errors.licenseNumber"),
            validate: value => String(value || "").length > 0 ? null : t("documents.errors.licenseNumber"),
        },
        {
            key: "licenseExpiration",
            label: t("profile.documents.licenseExpiration"),
            type: "date",
            minimumDate: tomorrow(),
            hint: t("documents.errors.expiration"),
            validate: value => isFutureDate(value) ? null : t("documents.errors.expiration"),
        },
        {
            key: "soatExpiration",
            label: t("profile.documents.soatExpiration"),
            type: "date",
            minimumDate: tomorrow(),
            maximumDate: soatLimit(),
            hint: t("documents.errors.soatRange"),
            validate: value => isFutureDate(value) && isWithinSoatLimit(value) ? null : t("documents.errors.soatRange"),
        },
        {
            key: "paymentEmail",
            label: t("profile.documents.paymentEmail"),
            keyboardType: "email-address",
            autoCapitalize: "none",
            hint: t("documents.errors.email"),
            validate: value => isValidEmail(value?.trim() || "") ? null : t("documents.errors.email"),
        },
        {
            key: "acceptedTerms",
            label: t("profile.documents.acceptedTerms"),
            readOnly: true,
        },
    ];

    if (requiresTechnicalReview) {
        fields.splice(3, 0, {
            key: "technicalReviewExpiration",
            label: t("profile.documents.technicalReviewExpiration"),
            type: "date",
            minimumDate: tomorrow(),
            hint: t("documents.errors.expiration"),
            validate: value => isFutureDate(value) ? null : t("documents.errors.expiration"),
        });
    }

    const photos = [
        {
            key: "licensePhoto",
            label: t("profile.documents.licensePhoto"),
            folder: "licenses",
            hint: t("documents.errors.photo"),
            validate: value => value?.publicId ? null : t("documents.errors.photo"),
        },
        {
            key: "soatPhoto",
            label: t("profile.documents.soatPhoto"),
            folder: "soat",
            hint: t("documents.errors.photo"),
            validate: value => value?.publicId ? null : t("documents.errors.photo"),
        },
    ];

    if (requiresTechnicalReview || driver.documents?.technicalReviewPhoto) {
        photos.push({
            key: "technicalReviewPhoto",
            label: t("profile.documents.technicalReviewPhoto"),
            folder: "technical-reviews",
            hint: t("documents.errors.photo"),
            validate: value => !requiresTechnicalReview || value?.publicId ? null : t("documents.errors.photo"),
        });
    }

    async function handleSave(data) {
        const licenseNumber = String(data.licenseNumber || "").replace(/\D/g, "");
        const paymentEmail = data.paymentEmail?.trim() || "";

        if (!licenseNumber) {
            throw new Error(t("documents.errors.licenseNumber"));
        }

        if (!isFutureDate(data.licenseExpiration)) {
            throw new Error(t("documents.errors.expiration"));
        }

        if (!data.licensePhoto?.publicId) {
            throw new Error(t("documents.errors.photo"));
        }

        if (!isFutureDate(data.soatExpiration) || !isWithinSoatLimit(data.soatExpiration)) {
            throw new Error(t("documents.errors.soatRange"));
        }

        if (!data.soatPhoto?.publicId) {
            throw new Error(t("documents.errors.photo"));
        }

        if (!isValidEmail(paymentEmail)) {
            throw new Error(t("documents.errors.email"));
        }

        const savedData = {
            licenseNumber,
            licenseExpiration: data.licenseExpiration,
            licensePhoto: data.licensePhoto,
            soatExpiration: data.soatExpiration,
            soatPhoto: data.soatPhoto,
            paymentEmail,
        };

        if (requiresTechnicalReview) {
            if (!isFutureDate(data.technicalReviewExpiration)) {
                throw new Error(t("documents.errors.expiration"));
            }

            if (!data.technicalReviewPhoto?.publicId) {
                throw new Error(t("documents.errors.photo"));
            }

            savedData.technicalReviewExpiration = data.technicalReviewExpiration;
        }

        if (data.technicalReviewPhoto?.publicId) {
            savedData.technicalReviewPhoto = data.technicalReviewPhoto;
        }

        await updateDriverProfile(user.uid, "documents", savedData);
        onSaved?.(savedData);
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
