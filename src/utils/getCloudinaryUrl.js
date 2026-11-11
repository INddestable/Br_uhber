export function getCloudinaryUrl(photo) {
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