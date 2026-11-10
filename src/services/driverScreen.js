import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "firebase/firestore";

import { auth, db } from "../config/firebase";
import { uploadImage } from "../config/cloudinary";



// Obtiene la cuenta de Firebase que utilizaremos.
// Obtiene la cuenta de Firebase que utilizaremos.
async function getOrCreateAccount(email, password) {
    const currentUser = auth.currentUser;

    // Si ya existe una sesión con el mismo correo, la reutilizamos.
    if (currentUser?.email?.toLowerCase() === email.toLowerCase()) {
        return currentUser;
    }

    // Si hay otra sesión activa, la cerramos.
    if (currentUser) {
        await auth.signOut();
    }

    // Si no hay contraseña, no podemos crear ni iniciar sesión.
    if (!password) {
        throw new Error("PASSWORD_MISSING");
    }

    try {
        // Crear una cuenta nueva.
        const credential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        return credential.user;

    } catch (error) {
        // Si la cuenta ya existe, intentamos iniciar sesión.
        if (error.code === "auth/email-already-in-use") {
            const credential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            return credential.user;
        }

        throw error;
    }
}

// Sube una fotografía y devuelve sus identificadores.
async function uploadDriverPhoto(uri, folder) {
    if (!uri) {
        throw new Error(`PHOTO_MISSING_${folder}`);
    }

    return await uploadImage(uri, folder);
}

// Registra al conductor en Firebase.
export async function registerDriver(formData) {
    const email = formData.email?.trim().toLowerCase();

    if (!email) {
        throw new Error("EMAIL_MISSING");
    }

    // 1. Crear o reutilizar la cuenta.
    const user = await getOrCreateAccount(
        email,
        formData.password
    );

    const uid = user.uid;

    // 2. Comprobar si el perfil ya existe.
    const driverRef = doc(db, "drivers", uid);
    const existingDriver = await getDoc(driverRef);

    
    if (existingDriver.exists()) {
        return {
            uid,
            alreadyRegistered: true
        };
    }

    // 3. Subir fotografías a Cloudinary.
    const profilePhoto = await uploadDriverPhoto(
        formData.profilePhoto,
        "profiles"
    );

    const vehiclePhoto = await uploadDriverPhoto(
        formData.vehiclePhoto,
        "vehicles"
    );

    const licensePhoto = await uploadDriverPhoto(
        formData.licensePhoto,
        "licenses"
    );

    const soatPhoto = await uploadDriverPhoto(
        formData.soatPhoto,
        "soat"
    );

    let technicalReviewPhoto = null;

    if (formData.technicalReviewPhoto) {
        technicalReviewPhoto = await uploadDriverPhoto(
            formData.technicalReviewPhoto,
            "technical-reviews"
        );
    }

    // 4. Construir los datos personales.
    const personalData = {
        fullName: formData.fullName.trim(),
        documentNumber: formData.documentNumber,
        phone: formData.phone,
        email,
        birthDate: formData.birthDate,
        gender: formData.gender,
        language: formData.language || "es",
        profilePhoto
    };

    // 5. Construir los datos del vehículo.
    const vehicle = {
        vehicleCategory: formData.vehicleCategory,
        vehiclePlate: formData.vehiclePlate.toUpperCase(),
        vehicleBrand: formData.vehicleBrand.trim(),
        vehicleModel: formData.vehicleModel.trim(),
        vehicleYear: Number(formData.vehicleYear),
        vehicleColor: formData.vehicleColor,
        vehicleCapacity: Number(formData.vehicleCapacity),
        vehiclePhoto
    };

    // 6. Construir los documentos.
    const documents = {
        licenseNumber: formData.licenseNumber,
        licenseExpiration: formData.licenseExpiration,
        licensePhoto,
        soatExpiration: formData.soatExpiration,
        soatPhoto,
        paymentEmail: formData.paymentEmail.trim(),
        acceptedTerms: formData.acceptedTerms
    };

    // La técnico-mecánica solo se guarda cuando corresponde.
    if (technicalReviewPhoto) {
        documents.technicalReviewPhoto = technicalReviewPhoto;
        documents.technicalReviewExpiration =
            formData.technicalReviewExpiration;
    }

    // 7. Guardar el perfil completo en Firestore.
    await setDoc(driverRef, {
        personalData,
        vehicle,
        documents,
        approvalStatus: "pending",
        availabilityStatus: "unavailable",
        createdAt: serverTimestamp()
    });

    return {
        uid,
        alreadyRegistered: false
    };
}
