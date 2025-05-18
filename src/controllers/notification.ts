import { Request, Response } from "express";
import Notification from "../models/notification.model";  // Assuming Notification model is already created
import User from "../models/User";  // Assuming User model is already created
import path from "path";
import jwt from "jsonwebtoken";
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
  
  export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      // Extract the token from the Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized: No token provided" });
        return;
      }
      const token = authHeader.split(" ")[1]; // Extract the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    
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
    
      const updateFields: any = {};
    
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
    
      // Check if a profile image was uploaded
      if (req.file) {
        updateFields.profileImageUrl = path.join("uploads", req.file.filename);
      }
    
      // Update the user profile
      const user = await User.findByIdAndUpdate(userId, updateFields, { new: true }).select("-password");
    
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
    
      res.json({
        message: "Profile updated successfully",
        user,
      });
    } catch (err) {
      console.error("Error in updateProfile:", err);
      res.status(500).json({ error: "Server error" });
    }
  };


  
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized: No token provided" });
        return;
      }
  
      const token = authHeader.split(" ")[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      if (!decoded || !decoded.id) {
        res.status(401).json({ error: "Unauthorized: Invalid token" });
        return;
      }
  
      // Fetch notifications for the user
      const notifications = await Notification.find({ userId: decoded.id }).sort({ createdAt: -1 });
  
      if (!notifications) {
        res.status(404).json({ error: "No notifications found" });
        return;
      }
  
      res.json({ message: "Notifications fetched successfully", notifications });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  };
  

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

  export const createMenstrualNotification = async (userId: string, message: string) => {
    try {
      const newNotification = new Notification({
        userId,
        message,
        read: false, // Mark as unread by default
      });
  
      await newNotification.save();
      console.log(`Notification sent to user ${userId}: ${message}`);
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };
  