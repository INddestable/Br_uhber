export async function uploadImage(imageUri, folder) {
    const formData = new FormData();

    const extension = imageUri.split(".").pop().split("?")[0].toLowerCase();

    const mimeTypes = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
    };

    formData.append("file", {
        uri: imageUri,
        name: `bruhber-${Date.now()}.${extension}`,
        type: mimeTypes[extension] || "image/jpeg",
    });

    formData.append("upload_preset", "bruhber_unsigned");
    formData.append("folder", `bruhber/${folder}`);

    const response = await fetch(
        "https://api.cloudinary.com/v1_1/nmpbywpi/image/upload",
        {
            method: "POST",
            body: formData,
        }
    );

    const result = await response.json();

    console.log("CLOUDINARY SECURE URL:", result.secure_url);

    if (!response.ok) {
        throw new Error(
            result.error?.message || "No se pudo subir la imagen."
        );
    }

    return {
        publicId: result.public_id,
        assetId: result.asset_id,
        version: result.version,
        format: result.format,
        resourceType: result.resource_type,
    };
}