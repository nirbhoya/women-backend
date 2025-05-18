"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcrypt = require('bcryptjs');
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const Post_1 = __importDefault(require("../models/Post"));
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        let partnerId = Math.random().toString(36).substr(2, 7); // Generate 7-char ID
        // Ensure partnerId is unique
        while (await User_1.default.findOne({ partnerId })) {
            partnerId = Math.random().toString(36).substr(2, 7);
        }
        const user = new User_1.default({ name, email, password: hashedPassword, partnerId });
        await user.save();
        res.status(201).json({ message: "User registered successfully", user });
    }
    catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.json({ email, user, token });
    }
    catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.login = login;
// export const getProfile = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Check for the presence of the Bearer token in the Authorization header
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       res.status(401).json({ error: "Unauthorized: No token provided" });
//       return;
//     }
//     // Extract the token from the header
//     const token = authHeader.split(" ")[1];
//     // Decode the token to get the userId
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
//     if (!decoded || !decoded.id) {
//       res.status(401).json({ error: "Unauthorized: Invalid token" });
//       return;
//     }
//     // Fetch the user profile from the database excluding the password
//     const user = await User.findById(decoded.id).select("-password");
//     // If the user is not found, return a 404 error
//     if (!user) {
//       res.status(404).json({ error: "User not found" });
//       return;
//     }
//     // Check if the user has a profile image URL and include it in the response
//     const profileImageUrl = user.profileImageUrl ? `${req.protocol}://${req.get('host')}/${user.profileImageUrl}` : null;
//     // Respond with the user data and profile image URL (if available)
//     res.json({
//       message: "User profile fetched successfully",
//       user: {
//         ...user.toObject(), // Spread the user data
//         profileImageUrl, // Include profile image URL in the response
//       }
//     });
//   } catch (err) {
//     // Handle unexpected errors
//     const errorMessage = err instanceof Error ? err.message : "Unknown error";
//     res.status(500).json({ error: "Server error", details: errorMessage });
//   }
// };
const getProfile = async (req, res) => {
    try {
        // Check for the presence of the Bearer token in the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized: No token provided" });
            return;
        }
        // Extract the token from the header
        const token = authHeader.split(" ")[1];
        // Decode the token to get the userId
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            res.status(401).json({ error: "Unauthorized: Invalid token" });
            return;
        }
        // Fetch the user profile from the database excluding the password
        const user = await User_1.default.findById(decoded.id).select("-password");
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Aggregate the necessary data from posts
        const posts = await Post_1.default.find({ userId: new mongoose_1.default.Types.ObjectId(decoded.id) });
        const totalPosts = posts.length;
        const totalLikes = posts.reduce((acc, post) => acc + post.likes.length, 0);
        const totalComments = posts.reduce((acc, post) => acc + post.comments.length, 0);
        // Fetch followers and following count (assuming they are arrays in the User model)
        const totalFollowers = user.followers?.length || 0;
        const totalFollowing = user.following?.length || 0;
        // Check if the user has a profile image URL and include it in the response
        const profileImageUrl = user.profileImageUrl
            ? `${req.protocol}://${req.get("host")}/${user.profileImageUrl}`
            : null;
        // Respond with the user data and additional stats
        res.json({
            message: "User profile fetched successfully",
            user: {
                ...user.toObject(),
                profileImageUrl,
                totalPosts,
                totalLikes,
                totalComments,
                totalFollowers,
                totalFollowing,
            },
        });
    }
    catch (err) {
        // Handle unexpected errors
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        res.status(500).json({ error: "Server error", details: errorMessage });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        // Check for the presence of the Bearer token in the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized: No token provided" });
            return;
        }
        // Extract the token from the header
        const token = authHeader.split(" ")[1];
        // Decode the token to get the userId
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            res.status(401).json({ error: "Unauthorized: Invalid token" });
            return;
        }
        // Find the user by ID
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Extract update fields from request body
        const { name, email } = req.body;
        // Validate input
        if (!name && !email && !req.file) {
            res.status(400).json({ error: "No update data provided" });
            return;
        }
        // Update name and email if provided
        if (name)
            user.name = name;
        if (email) {
            // Check if email is already in use by another user
            const existingUser = await User_1.default.findOne({ email, _id: { $ne: user._id } });
            if (existingUser) {
                res.status(400).json({ error: "Email already in use" });
                return;
            }
            user.email = email;
        }
        // Handle profile image upload
        if (req.file) {
            // Delete existing profile image if it exists
            if (user.profileImageUrl) {
                const oldImagePath = path_1.default.join(process.cwd(), user.profileImageUrl);
                if (fs_1.default.existsSync(oldImagePath)) {
                    fs_1.default.unlinkSync(oldImagePath);
                }
            }
            // Update profile image path
            user.profileImageUrl = `uploads/${req.file.filename}`;
        }
        // Save updated user
        await user.save();
        // Prepare response with full URL for profile image
        const profileImageUrl = user.profileImageUrl
            ? `${req.protocol}://${req.get("host")}/${user.profileImageUrl}`
            : null;
        // Respond with updated user data
        res.json({
            message: "Profile updated successfully",
            user: {
                ...user.toObject(),
                profileImageUrl,
                password: undefined, // Remove password from response
            },
        });
    }
    catch (err) {
        // Handle unexpected errors
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        res.status(500).json({ error: "Server error", details: errorMessage });
    }
};
exports.updateProfile = updateProfile;
