import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Upload image to Cloudinary
export const uploadToCloudinary = async (
    fileBuffer: Buffer,
    folder: string = "whisper-posts"
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "auto",
                transformation: [
                    { width: 1080, height: 1080, crop: "limit" }, // Max size
                    { quality: "auto:good" }, // Auto quality optimization
                ],
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result!.secure_url);
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
    try {
        // Extract public_id from URL
        const urlParts = imageUrl.split("/");
        const filename = urlParts[urlParts.length - 1];
        const publicId = `whisper-posts/${filename.split(".")[0]}`;

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        throw error;
    }
};
