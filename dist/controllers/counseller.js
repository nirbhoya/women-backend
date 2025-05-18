"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCounselorPassword = exports.updateCounselor = exports.deleteCounselor = exports.getCounselorById = exports.getAllCounselors = exports.loginCounselor = exports.addCounselor = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const Counselor_1 = __importDefault(require("../models/Counselor"));
// ✅ Add Counselor (Admin Only)
// export const addCounselor = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { name, email, password, phone, specialty, experience, education,location,time, bio, availability } = req.body;
//       const imageFile = req.file; // Multer handles file uploads
//       // Validate required fields: name and email
//       if (!name || !email) {
//         res.status(400).json({ error: "Name and email are required" });
//         return;
//       }
//       // Check if the counselor already exists
//       const existingCounselor = await Counselor.findOne({ email });
//       if (existingCounselor) {
//         res.status(400).json({ error: "Counselor already exists" });
//         return;
//       }
//       // Hash password if provided
//       let hashedPassword = null;
//       if (password) {
//         hashedPassword = await bcrypt.hash(password, 10);
//       }
//       // Store image path if an image is uploaded
//       const imagePath = imageFile ? path.join("uploads", imageFile.filename) : null;
//       // Create new counselor
//       const counselor = new Counselor({
//         name,
//         email,
//         password: hashedPassword,
//         phone,
//         specialty,
//         experience,
//         education,
//         location,
//         time,
//         bio,
//         image: imagePath,
//         availability: availability || [],
//       });
//       await counselor.save();
//       res.status(201).json({ message: "Counselor added successfully", counselor });
//     } catch (error) {
//       res.status(500).json({ error: "Server error", details: (error as Error).message });
//     }
//   };
// export const addCounselor = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Log the incoming request to check if the image and data are being passed
//     console.log("Request Body:", req.body);
//     console.log("File Upload:", req.file);
//     const { name, email, password, phone, specialty, experience, education, location, time, bio, availability } = req.body;
//     const imageFile = req.file; // Multer handles file uploads
//     // Validate required fields
//     if (!name || !email) {
//       res.status(400).json({ error: "Name and email are required" });
//       return;
//     }
//     // Check if the counselor already exists
//     const existingCounselor = await Counselor.findOne({ email });
//     if (existingCounselor) {
//       res.status(400).json({ error: "Counselor already exists" });
//       return;
//     }
//     // Hash password if provided
//     let hashedPassword = null;
//     if (password) {
//       hashedPassword = await bcrypt.hash(password, 10);
//     }
//     // Store image path if an image is uploaded
//     const imagePath = imageFile ? path.join("uploads", imageFile.filename) : null;
//     // Create new counselor
//     const counselor = new Counselor({
//       name,
//       email,
//       password: hashedPassword,
//       phone,
//       specialty,
//       experience,
//       education,
//       location,
//       time,
//       bio,
//       image: imagePath,
//       availability: availability || [],
//     });
//     await counselor.save();
//     // Log the newly created counselor
//     console.log("New Counselor Created:", counselor);
//     res.status(201).json({ message: "Counselor added successfully", counselor });
//   } catch (error) {
//     console.error("Error adding counselor:", error);
//     res.status(500).json({ error: "Server error", details: (error as Error).message });
//   }
// };
const addCounselor = async (req, res) => {
    try {
        const { name, email, password, phone, specialty, experience, education, location, time, bio, availability } = req.body;
        const imageFile = req.file; // Multer handles file uploads
        // Log the incoming request body to inspect the data
        console.log('Request Body:', req.body);
        console.log('Uploaded Image:', req.file);
        // Validate required fields
        if (!name || !email) {
            res.status(400).json({ error: "Name and email are required" });
            return;
        }
        // Check if the counselor already exists
        const existingCounselor = await Counselor_1.default.findOne({ email });
        if (existingCounselor) {
            res.status(400).json({ error: "Counselor already exists" });
            return;
        }
        // Hash password if provided
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcryptjs_1.default.hash(password, 10);
        }
        // Store image path if an image is uploaded
        let imagePaths = [];
        if (req.files && Array.isArray(req.files)) {
            // Extract the paths for all uploaded images
            imagePaths = req.files.map(file => {
                // Convert Windows backslashes to forward slashes and make path relative
                return file.path
                    .replace(/\\/g, '/')
                    .replace(/^.*uploads\//, 'uploads/');
            });
            console.log("Processed image paths:", imagePaths);
        }
        // Create new counselor
        const counselor = new Counselor_1.default({
            name,
            email,
            password: hashedPassword,
            phone,
            specialty,
            experience,
            education,
            location,
            time,
            bio,
            image: imagePaths,
            availability: availability || [],
        });
        await counselor.save();
        // Respond with the newly created counselor
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrls = imagePaths.map(imagePath => `${baseUrl}/${imagePath}`);
        res.status(201).json({
            message: "Counselor added successfully",
            counselor: {
                ...counselor.toObject(),
                imageUrls,
            },
        });
    }
    catch (error) {
        console.error("Error adding counselor:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
exports.addCounselor = addCounselor;
const loginCounselor = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }
        const counselor = await Counselor_1.default.findOne({ email });
        if (!counselor) {
            res.status(404).json({ error: "Invalid email or password" });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, counselor.password);
        if (!isMatch) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: counselor._id, email: counselor.email }, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "7d" });
        res.status(200).json({ message: "Login successful", token, counselor });
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
exports.loginCounselor = loginCounselor;
// ✅ Get All Counselors
const getAllCounselors = async (req, res) => {
    try {
        const counselors = await Counselor_1.default.find().select("-password"); // Exclude password
        res.status(200).json({ counselors });
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
exports.getAllCounselors = getAllCounselors;
// ✅ Get Single Counselor by ID
const getCounselorById = async (req, res) => {
    try {
        const { id } = req.params;
        const counselor = await Counselor_1.default.findById(id).select("-password");
        if (!counselor) {
            res.status(404).json({ error: "Counselor not found" });
            return;
        }
        res.status(200).json({ counselor });
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
exports.getCounselorById = getCounselorById;
// ✅ Delete Counselor (Admin Only)
const deleteCounselor = async (req, res) => {
    try {
        const { id } = req.params;
        const counselor = await Counselor_1.default.findByIdAndDelete(id);
        if (!counselor) {
            res.status(404).json({ error: "Counselor not found" });
            return;
        }
        res.status(200).json({ message: "Counselor deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
exports.deleteCounselor = deleteCounselor;
const updateCounselor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, specialty, experience, education, location, time, bio, availability } = req.body;
        const imageFile = req.file; // Multer handles file uploads
        // Check if counselor exists
        const counselor = await Counselor_1.default.findById(id);
        if (!counselor) {
            res.status(404).json({ error: "Counselor not found" });
            return;
        }
        // Update fields if provided
        if (name)
            counselor.name = name;
        if (email)
            counselor.email = email;
        if (phone)
            counselor.phone = phone;
        if (specialty)
            counselor.specialty = specialty;
        if (experience)
            counselor.experience = experience;
        if (education)
            counselor.education = education;
        if (location)
            counselor.location = location;
        if (time)
            counselor.time = time;
        if (bio)
            counselor.bio = bio;
        if (availability)
            counselor.availability = availability;
        // If a new image is uploaded, update the image path
        if (imageFile) {
            counselor.image = path_1.default.join("uploads", imageFile.filename);
        }
        await counselor.save();
        res.status(200).json({ message: "Counselor updated successfully", counselor });
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
exports.updateCounselor = updateCounselor;
// Update counselor password
const updateCounselorPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (!currentPassword || !newPassword || !confirmPassword) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }
        if (newPassword !== confirmPassword) {
            res.status(400).json({ error: "New passwords do not match" });
            return;
        }
        const counselor = await Counselor_1.default.findById(id);
        if (!counselor) {
            res.status(404).json({ error: "Counselor not found" });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, counselor.password);
        if (!isMatch) {
            res.status(400).json({ error: "Current password is incorrect" });
            return;
        }
        counselor.password = await bcryptjs_1.default.hash(newPassword, 10);
        await counselor.save();
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
exports.updateCounselorPassword = updateCounselorPassword;
