const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    let folder = "Hani-Industries";
    let resourceType = "auto"; // Let Cloudinary detect the type
    let transformation = [];

    if (file.mimetype.startsWith("image/")) {
      resourceType = "image";
      transformation = [{ width: 800, crop: "limit" }];
    } else if (file.mimetype.startsWith("video/")) {
      resourceType = "video";
    } else {
      // Documents (PDF, DOC, etc.) - use "raw" resource type
      resourceType = "raw";
    }

    return {
      folder,
      resource_type: resourceType,
      transformation: transformation.length > 0 ? transformation : undefined,
      // Preserve original filename for documents
      use_filename: true,
      unique_filename: true,
    };
  },
});

const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "profile-avatars", resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};


const parser = multer({ storage });

module.exports = { cloudinary, parser, streamUpload};
