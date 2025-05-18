

// import multer from "multer";
// import path from "path";
// import fs from "fs";

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
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createStorage = () => multer.diskStorage({
  destination: (req, file, cb) => {
    // Use path.join for more reliable path resolution
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Multer file filter to allow only specific mime types (images, PDFs, audio)
import { Request as ExpressRequest } from 'express'; // Import correct Request type

// Multer file filter to allow only specific mime types
const fileFilter = (req: ExpressRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    "image/jpeg", "image/png", "image/gif", // Images
    "application/pdf", // PDFs
    "audio/mpeg", "audio/wav", "audio/mp3", "audio/x-m4a", "audio/ogg" // Audio
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);  // Accept file
  } else {
    cb(new Error("Invalid file type. Only images, PDFs, and audio files are allowed."));  // Reject file
  }
};


// Function to create an upload middleware for multiple images
export const uploadMultipleImages = () => multer({
  storage: createStorage(),  // Use the updated storage to save files in 'uploads/'
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB
  fileFilter,
}).array("image", 5);  // Allow up to 5 images with the field name 'image'

// For single image upload (not needed if you want to allow multiple images only)
export const uploadSingleImage = (p0: string) => multer({
  storage: createStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB
  fileFilter,
}).single("image");  // For single image upload, if you need it later
