"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFollowing = exports.getFollowers = exports.followUser = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const followUser = async (req, res) => {
    try {
        const { userId } = req.params; // ID of the user to follow
        const currentUserId = req.user?.id; // Extract authenticated user's ID from token
        if (!currentUserId) {
            res.status(401).json({ error: "Unauthorized: No user found" });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ error: "Invalid User ID format" });
            return;
        }
        if (userId === currentUserId) {
            res.status(400).json({ error: "You cannot follow yourself" });
            return;
        }
        const userToFollow = await User_1.default.findById(userId);
        const currentUser = await User_1.default.findById(currentUserId);
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
    }
    catch (error) {
        console.error("Follow user error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.followUser = followUser;
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
const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User_1.default.findById(userId).populate("followers", "name email");
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json({ followers: user.followers });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.getFollowers = getFollowers;
const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User_1.default.findById(userId).populate("following", "name email");
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json({ following: user.following });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.getFollowing = getFollowing;
