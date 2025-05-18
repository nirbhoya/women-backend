import { Request, Response } from "express";
import MenstrualHealth from "../models/MenstrualHealth";
import { createMenstrualNotification } from './notification'; // Import notification creation function
// Ensure you have this model imported
import User  from "../models/User";
 // Assuming the notification function is in this controller

 export const createMenstrualHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Assuming authentication middleware sets `req.user`
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Check if menstrual health data already exists for the user
    const existingRecord = await MenstrualHealth.findOne({ userId });
    if (existingRecord) {
      res.status(400).json({ error: "Menstrual health data already exists" });
      return;
    }

    const { lastPeriod, periodDuration, ageGroup } = req.body;
    const updateFields: any = {};
    
    // Create a new MenstrualHealth record and save it
    const menstrualHealth = new MenstrualHealth({ userId, ...req.body });
    await menstrualHealth.save();

    // If lastPeriod is provided, calculate the expected next period date
    if (lastPeriod) {
      const expectedNextDate = new Date(lastPeriod);
      if (isNaN(expectedNextDate.getTime())) {
        res.status(400).json({ error: "Invalid menstrualLastDay date" });
        return;
      }
      
      // Add 28 days to get the expected next menstrual date
      expectedNextDate.setDate(expectedNextDate.getDate() + 28);
      updateFields.menstrualLastDay = lastPeriod;
      updateFields.expectedNextDate = expectedNextDate;

      // Fetch the user to get their name
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const userName = user.name; // Extract the user's name

      // Create the notification for the next menstrual cycle
      const nextDateMessage = `Hello ${userName}, your next menstrual cycle is expected on ${expectedNextDate.toDateString()}.`;
      await createMenstrualNotification(userId, nextDateMessage);

      // Send a reminder notification only if today is one day before the expected next menstrual date
      const reminderDate = new Date(expectedNextDate);
      reminderDate.setDate(reminderDate.getDate() - 1);

      const currentDate = new Date();
      // Check if today's date matches the reminder date
      if (currentDate.toDateString() === reminderDate.toDateString()) {
        const reminderMessage = `Hello ${userName}, tomorrow is the expected start of your menstrual cycle.`;
        await createMenstrualNotification(userId, reminderMessage);
      }
    }

    // Create a notification after saving menstrual health data
    const message = `Your menstrual health data has been successfully recorded. Age Group: ${ageGroup}, Period Duration: ${periodDuration} days.`;
    await createMenstrualNotification(userId, message); // Call the notification function

    res.status(201).json({ message: "Menstrual health data created successfully", data: menstrualHealth });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: (error as Error).message });
  }
};

// export const createMenstrualHealth = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Ensure authentication middleware sets req.user
//     const userId = req.user?.id;
//     if (!userId) {
//       res.status(401).json({ error: "Unauthorized" });
//       return;
//     }

//     // Check if data already exists for the user
//     const existingRecord = await MenstrualHealth.findOne({ userId });
//     if (existingRecord) {
//       res.status(400).json({ error: "Menstrual health data already exists" });
//       return;
//     }

//     // Create new menstrual health record
//     const menstrualHealth = new MenstrualHealth({ userId, ...req.body });
//     await menstrualHealth.save();

//     res.status(201).json({
//       message: "Menstrual health data created successfully",
//       data: menstrualHealth,
//     });
//   } catch (error) {
//     console.error("Error creating menstrual health data:", error);
//     res.status(500).json({ error: "Server error", details: (error as Error).message });
//   }
// };

export const updateMenstrualHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Assuming authentication middleware sets req.user
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Assuming you want to update menstrual health data based on userId
    const updatedData = await MenstrualHealth.findOneAndUpdate(
      { userId }, // Match the user's menstrual health data
      req.body, // Update with the provided data from the request body
      { new: true } // Return the updated data
    );

    // If no data found for the user, respond with an error
    if (!updatedData) {
      res.status(404).json({ error: "Menstrual health data not found" });
      return;
    }

    // If update is successful, return the updated data
    res.status(200).json({
      message: "Menstrual health data updated successfully",
      data: updatedData,
    });
  } catch (error) {
    // Catch and handle any unexpected errors
    res.status(500).json({
      error: "Server error",
      details: (error as Error).message,
    });
  }
};
  