"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMenstrualNotification = exports.getNotifications = exports.updateProfile = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model")); // Assuming Notification model is already created
const User_1 = __importDefault(require("../models/User")); // Assuming User model is already created
const path_1 = __importDefault(require("path"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Utility function to create a notification
// Controller for updating user profile, including menstrual data
// export const updateProfile = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Extract the token from the Authorization header
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       res.status(401).json({ error: "Unauthorized: No token provided" });
//       return;
//     }
//     const token = authHeader.split(" ")[1]; // Extract the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
//     if (!decoded || !decoded.id) {
//       res.status(401).json({ error: "Unauthorized: Invalid token" });
//       return;
//     }
//     const userId = decoded.id; // Extract userId from the decoded token
//     const { name, email, menstrualLastDay } = req.body;
//     // Validate if required fields are provided
//     if (!name || !email || !menstrualLastDay) {
//       res.status(400).json({ error: "Missing required fields" });
//       return;
//     }
//     const updateFields: any = {};
//     if (name) updateFields.name = name;
//     if (email) updateFields.email = email;
//     if (menstrualLastDay) {
//       const expectedNextDate = new Date(menstrualLastDay);
//       if (isNaN(expectedNextDate.getTime())) {
//         res.status(400).json({ error: "Invalid menstrualLastDay date" });
//         return;
//       }
//       expectedNextDate.setDate(expectedNextDate.getDate() + 28); // Add 28 days to get the expected next period date
//       updateFields.menstrualLastDay = menstrualLastDay;
//       updateFields.expectedNextDate = expectedNextDate;
//       // Fetch the user to get the name
//       const user = await User.findById(userId);
//       if (!user) {
//         res.status(404).json({ error: "User not found" });
//         return;
//       }
//       const userName = user.name; // Extract the user's name
//       // Create notifications based on the menstrual data
//       const nextDateMessage = `Hello ${userName}, your next menstrual cycle is expected on ${expectedNextDate.toDateString()}.`;
//       await createMenstrualNotification(userId, nextDateMessage);
//       // Reminder a day before the next menstrual date
//       const reminderDate = new Date(expectedNextDate);
//       reminderDate.setDate(reminderDate.getDate() - 1);
//       const reminderMessage = `Hello ${userName}, tomorrow is the expected start of your menstrual cycle.`;
//       await createMenstrualNotification(userId, reminderMessage);
//     }
//     // Check if a profile image was uploaded
//     if (req.file) {
//       updateFields.profileImageUrl = path.join("uploads", req.file.filename);
//     }
//     // Update the user profile
//     const user = await User.findByIdAndUpdate(userId, updateFields, { new: true }).select("-password");
//     if (!user) {
//       res.status(404).json({ error: "User not found" });
//       return;
//     }
//     res.json({
//       message: "Profile updated successfully",
//       user,
//     });
//   } catch (err) {
//     console.error("Error in updateProfile:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };
const updateProfile = async (req, res) => {
    try {
        // Extract the token from the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized: No token provided" });
            return;
        }
        const token = authHeader.split(" ")[1]; // Extract the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            res.status(401).json({ error: "Unauthorized: Invalid token" });
            return;
        }
        const userId = decoded.id; // Extract userId from the decoded token
        const { name, email } = req.body;
        // Validate if required fields are provided
        if (!name || !email) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        const updateFields = {};
        if (name)
            updateFields.name = name;
        if (email)
            updateFields.email = email;
        // Check if a profile image was uploaded
        if (req.file) {
            updateFields.profileImageUrl = path_1.default.join("uploads", req.file.filename);
        }
        // Update the user profile
        const user = await User_1.default.findByIdAndUpdate(userId, updateFields, { new: true }).select("-password");
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({
            message: "Profile updated successfully",
            user,
        });
    }
    catch (err) {
        console.error("Error in updateProfile:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.updateProfile = updateProfile;
const getNotifications = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized: No token provided" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            res.status(401).json({ error: "Unauthorized: Invalid token" });
            return;
        }
        // Fetch notifications for the user
        const notifications = await notification_model_1.default.find({ userId: decoded.id }).sort({ createdAt: -1 });
        if (!notifications) {
            res.status(404).json({ error: "No notifications found" });
            return;
        }
        res.json({ message: "Notifications fetched successfully", notifications });
    }
    catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.getNotifications = getNotifications;
// export const createMenstrualNotification = async (userId: string, message: string)  =>{
//   try {
//     const newNotification = new Notification({
//       userId,
//       message,
//       read: false, // Mark as unread by default
//     });
//     await newNotification.save();
//     console.log(`Notification sent to user ${userId}: ${message}`);
//   } catch (error) {
//     console.error("Error creating notification:", error);
//   }
// };
const createMenstrualNotification = async (userId, message) => {
    try {
        const newNotification = new notification_model_1.default({
            userId,
            message,
            read: false, // Mark as unread by default
        });
        await newNotification.save();
        console.log(`Notification sent to user ${userId}: ${message}`);
    }
    catch (error) {
        console.error("Error creating notification:", error);
    }
};
exports.createMenstrualNotification = createMenstrualNotification;
