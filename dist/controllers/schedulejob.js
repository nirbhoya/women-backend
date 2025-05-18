"use strict";
// import cron from "node-cron";
// import User from "../models/User";
// import { createMenstrualNotification } from "./notification";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// cron.schedule("0 9 * * *", async () => {
//   try {
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1); // Get tomorrow's date
//     tomorrow.setHours(0, 0, 0, 0); // Normalize to midnight
//     // Find users with expectedNextDate matching tomorrow
//     const users = await User.find({ expectedNextDate: tomorrow }).lean();
//     if (!users.length) {
//       console.log("No users with menstrual cycle expected tomorrow.");
//       return;
//     }
//     for (const user of users) {
//       await createMenstrualNotification(user._id.toString(), "Reminder: Your menstrual cycle is approaching!");
//     }
//     console.log("Menstrual notifications sent successfully.");
//   } catch (error) {
//     console.error("Error in menstrual notification cron job:", error);
//   }
// });
const node_cron_1 = __importDefault(require("node-cron"));
const MenstrualHealth_1 = __importDefault(require("../models/MenstrualHealth"));
const notification_1 = require("./notification"); // Import the notification creation function
// Cron job that runs daily at midnight
node_cron_1.default.schedule("0 0 * * *", async () => {
    try {
        // Get today's date and calculate tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1); // Set to tomorrow's date
        // Find users whose next period is tomorrow
        const users = await MenstrualHealth_1.default.find({
            lastPeriod: { $lte: tomorrow }, // Find users with a last period date before tomorrow
            periodDuration: { $gte: 1 }, // Ensure the period duration is valid
        });
        if (!users || users.length === 0) {
            console.log("No users have a period coming up tomorrow.");
            return;
        }
        // Send notifications to each user
        for (const user of users) {
            const userId = user.userId.toString();
            const message = `Reminder: Your menstrual cycle is approaching tomorrow! Your next period starts on ${user.lastPeriod.toLocaleDateString()}.`;
            await (0, notification_1.createMenstrualNotification)(userId, message);
            console.log(`Notification sent to user ${userId}: ${message}`);
        }
    }
    catch (error) {
        console.error("Error in cron job:", error);
    }
});
