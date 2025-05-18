
import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import { AuthRequest } from "../middlewares/auth.middleware"; // Import the extended request type

export const followUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params; // ID of the user to follow
    const currentUserId = req.user?.id; // Extract authenticated user's ID from token

    if (!currentUserId) {
      res.status(401).json({ error: "Unauthorized: No user found" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid User ID format" });
      return;
    }

    if (userId === currentUserId) {
      res.status(400).json({ error: "You cannot follow yourself" });
      return;
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check if already following
    if (currentUser.following.includes(userToFollow._id)) {
      res.status(400).json({ error: "Already following this user" });
      return;
    }

    // Update both users' followers & following lists
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      message: "Successfully followed user",
      userToFollow: { id: userToFollow._id, name: userToFollow.name },
      currentUser: { id: currentUser._id, name: currentUser.name },
    });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// export const followUser = async (req: Request, res: Response): Promise<void> =>  {
//     try {
//       const { userId } = req.params;
  
//       if (!mongoose.Types.ObjectId.isValid(userId)) {
//          res.status(400).json({ error: "Invalid User ID format" });
//          return
//       }
  
//       const objectId = new mongoose.Types.ObjectId(userId);
//       const user = await User.findById(objectId);
  
//       if (!user) {
//          res.status(404).json({ error: "User not found" });
//          return
//       }
  
//        res.status(200).json(user);
//        return
//     } catch (error) {
//        res.status(500).json({ error: "Internal Server Error" });
//        return
//     }
//   };

//get followers


// ✅ Define the type of req.params using generics
export const getFollowers = async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("followers", "name email");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ followers: user.followers });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getFollowing = async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("following", "name email");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ following: user.following });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};