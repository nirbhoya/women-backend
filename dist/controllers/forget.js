"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyOtp = exports.forgetPassword = void 0;
const User_1 = __importDefault(require("../models/User")); // Assuming User model is already created
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Generate a random OTP
const generateOtp = () => {
    return crypto_1.default.randomBytes(3).toString("hex"); // Generates a 6-digit hex OTP
};
// Function to send OTP email
const sendOtpEmail = async (email, otp) => {
    // Setup the transporter for nodemailer
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail", // You can change this to other email services
        auth: {
            user: process.env.EMAIL_USER, // Your email address
            pass: process.env.EMAIL_PASS, // Your email password or app-specific password
        },
    });
    // Mail options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}. This is valid for 10 minutes.`,
    };
    // Send the email
    await transporter.sendMail(mailOptions);
};
// Controller for forget password (Step 1)
const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "Email is required" });
            return;
        }
        // Check if the user exists
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Generate OTP and set it in the user's document (expires in 10 minutes)
        const otp = generateOtp();
        user.resetOtp = otp;
        user.otpExpire = Date.now() + 600000; // OTP expires in 10 minutes
        await user.save();
        // Send OTP to user's email
        await sendOtpEmail(email, otp);
        res.json({ message: "OTP sent to your email" });
    }
    catch (err) {
        console.error("Error in forgetPassword:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.forgetPassword = forgetPassword;
// Controller for verify OTP (Step 2)
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ error: "Email and OTP are required" });
            return;
        }
        // Find the user by email
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Check if the OTP is valid and not expired
        if (user.resetOtp !== otp) {
            res.status(400).json({ error: "Invalid OTP" });
            return;
        }
        if (!user.otpExpire || user.otpExpire.valueOf() < Date.now()) {
            res.status(400).json({ error: "OTP has expired" });
            return;
        }
        // OTP is valid, so proceed to reset password
        res.json({ message: "OTP verified successfully. You can now reset your password." });
    }
    catch (err) {
        console.error("Error in verifyOtp:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.verifyOtp = verifyOtp;
// Controller for resetting password (Step 3)
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        // Log incoming request data
        console.log('Request Body:', req.body);
        if (!newPassword || !confirmPassword) {
            res.status(400).json({ error: "New password and confirm password are required" });
            return;
        }
        if (newPassword !== confirmPassword) {
            res.status(400).json({ error: "Passwords do not match" });
            return;
        }
        // Find the user by email
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Log user found
        console.log('User found:', user);
        // Hash the new password
        let hashedPassword;
        try {
            hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
            console.log('Password hashed successfully:', hashedPassword);
        }
        catch (err) {
            console.error('Error hashing password:', err);
            res.status(500).json({ error: "Error hashing password" });
            return;
        }
        // Update the user's password
        user.password = hashedPassword;
        user.resetOtp = undefined; // Clear OTP field
        user.otpExpire = undefined; // Clear OTP expiry field
        // Save the updated user
        await user.save();
        console.log('User saved:', user);
        res.json({ message: "Password updated successfully" });
    }
    catch (err) {
        console.error("Error in resetPassword:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.resetPassword = resetPassword;
