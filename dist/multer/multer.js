"use strict";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingleImage = exports.uploadMultipleImages = void 0;
// // Create the "uploads" directory if it doesn't exist
// const uploadFolder = "uploads";
// if (!fs.existsSync(uploadFolder)) {
//   fs.mkdirSync(uploadFolder);
// }
// // Multer configuration for storing images
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadFolder); // Store files in the "uploads" folder
//   },
//   filename: (req, file, cb) => {
//     const fileExtension = path.extname(file.originalname); // Get file extension
//     const fileName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
//     cb(null, fileName); // Assign the unique filename
//   },
// });
// // File filter to allow only image files
// const fileFilter = (req: any, file: any, cb: any) => {
//   const allowedTypes = /jpeg|jpg|png|gif/;
//   const isValid = allowedTypes.test(file.mimetype);
//   if (isValid) {
//     return cb(null, true);
//   } else {
//     return cb(new Error("Only image files are allowed!"), false);
//   }
// };
// // Initialize Multer with configuration for single image upload
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Limit the file size to 5MB
//   fileFilter,
// });
// // Export a middleware specifically for single image uploads
// export const uploadSingleImage = upload.single('image');
// export default upload;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const createStorage = () => multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Use path.join for more reliable path resolution
        const uploadDir = path_1.default.join(process.cwd(), 'uploads');
        // Ensure the upload directory exists
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
// Multer file filter to allow only specific mime types
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg", "image/png", "image/gif", // Images
        "application/pdf", // PDFs
        "audio/mpeg", "audio/wav", "audio/mp3", "audio/x-m4a", "audio/ogg" // Audio
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept file
    }
    else {
        cb(new Error("Invalid file type. Only images, PDFs, and audio files are allowed.")); // Reject file
    }
};
// Function to create an upload middleware for multiple images
const uploadMultipleImages = () => (0, multer_1.default)({
    storage: createStorage(), // Use the updated storage to save files in 'uploads/'
    limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB
    fileFilter,
}).array("image", 5); // Allow up to 5 images with the field name 'image'
exports.uploadMultipleImages = uploadMultipleImages;
// For single image upload (not needed if you want to allow multiple images only)
const uploadSingleImage = (p0) => (0, multer_1.default)({
    storage: createStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB
    fileFilter,
}).single("image"); // For single image upload, if you need it later
exports.uploadSingleImage = uploadSingleImage;
