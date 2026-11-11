export function getCloudinaryUrl(photo) {
    if (typeof photo?.secureUrl === "string" && photo.secureUrl.startsWith("https://")) {
        return photo.secureUrl;
    }

    if (!photo?.publicId) {
        return null;
    }

    const resourceType = photo.resourceType || "image";
    const version = photo.version ? `v${photo.version}/` : "";
    const format = photo.format ? `.${photo.format}` : "";

    return (
        `https://res.cloudinary.com/nmpbywpi/` +
        `${resourceType}/upload/` +
        `${version}${photo.publicId}${format}`
    );
}
