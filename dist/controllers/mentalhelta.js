"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllPostsAdmin = exports.PostAdmin = exports.deleteMentalHealthPost = exports.updateMentalHealthPost = exports.getMentalHealthPostById = exports.getMentalHealthPosts = exports.createMentalHealthPost = void 0;
const mentalhealthPost_1 = __importDefault(require("../models/mentalhealthPost")); // Adjust path according to your project structure
const category_model_1 = __importDefault(require("../models/category.model")); // Adjust if you're using categories
const admin_Post_1 = __importDefault(require("../models/admin.Post"));
const mongoose_1 = require("mongoose");
// export const createMentalHealthPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//   try {
//     const { title, category, description } = req.body;
//     if (!title || !category || !description) {
//        res.status(400).json({ error: "All fields (title, category, description) are required" });
//        return;
//     }
//     if (!req.user) {
//        res.status(401).json({ error: "Unauthorized" });
//        return;
//     }
//     let imagePath = '';
//     if (req.file) {
//       imagePath = req.file.path.replace(/\\/g, '/'); // Fix Windows path issues
//       return;
//     }
//     const categoryExists = await Category.findById(category);
//     if (!categoryExists) {
//        res.status(400).json({ error: "Category not found" });
//        return;
//     }
//     const mentalPost = new Mental({
//       userId: req.user.id,
//       title,
//       category: categoryExists._id,
//       description,
//       image: imagePath,
//     });
//     await mentalPost.save();
//     const baseUrl = `${req.protocol}://${req.get('host')}`;
//     const imageUrl = imagePath ? `${baseUrl}/${imagePath}` : '';
//     res.status(201).json({
//       message: "Mental Health Post created successfully",
//       post: { ...mentalPost.toObject(), imageUrl },
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Server error", details: (error as Error).message });
//   }
// };
const createMentalHealthPost = async (req, res) => {
    try {
        const { title, category, description } = req.body;
        // Validate input fields
        if (!title || !category || !description) {
            res.status(400).json({ error: "All fields (title, category, description) are required" });
            return;
        }
        // Check user authentication
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        // Handle image upload
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
        // Verify category
        let categoryExists = null;
        if (mongoose_1.Types.ObjectId.isValid(category)) {
            categoryExists = await category_model_1.default.findById(category);
        }
        if (!categoryExists) {
            categoryExists = await category_model_1.default.findOne({ name: category });
        }
        if (!categoryExists) {
            res.status(400).json({ error: "Category not found" });
            return;
        }
        // Create mental health post
        const mentalPost = new mentalhealthPost_1.default({
            userId: req.user.id,
            title,
            category: categoryExists._id,
            description,
            image: imagePaths,
        });
        await mentalPost.save();
        // Generate image URL
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrls = imagePaths.map(imagePath => `${baseUrl}/${imagePath}`);
        // Respond with success
        res.status(201).json({
            message: "Mental Health Post created successfully",
            post: {
                ...mentalPost.toObject(),
                categoryName: categoryExists.name,
                imageUrls,
            },
        });
    }
    catch (error) {
        console.error("Create mental health post error:", error);
        res.status(500).json({
            error: "Server error",
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.createMentalHealthPost = createMentalHealthPost;
const getMentalHealthPosts = async (req, res) => {
    try {
        // Fetch all posts and populate the category field
        const mentalHealthPosts = await mentalhealthPost_1.default.find().populate("category");
        if (!mentalHealthPosts || mentalHealthPosts.length === 0) {
            res.status(404).json({ error: "No mental health posts found" });
            return;
        }
        // Construct the base URL correctly
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        // Format the posts for the response
        const formattedPosts = mentalHealthPosts.map(post => {
            let imageUrls = [];
            if (Array.isArray(post.image)) {
                // If post.image is an array, iterate over it and construct image URLs
                imageUrls = post.image.map(imagePath => {
                    // Only append 'uploads/' if it's not already present in the image path
                    return imagePath.startsWith('uploads/') ? `${baseUrl}/${imagePath}` : `${baseUrl}/uploads/${imagePath}`;
                });
            }
            else if (typeof post.image === 'string') {
                // If it's a single image string, handle that
                imageUrls = [post.image.startsWith('uploads/') ? `${baseUrl}/${post.image}` : `${baseUrl}/uploads/${post.image}`];
            }
            return {
                _id: post._id,
                title: post.title,
                description: post.description || "No description provided",
                image: post.image || "",
                likes: post.likes || [],
                comments: post.comments || [],
                followers: post.followers || [],
                createdAt: post.createdAt || "",
                updatedAt: post.updatedAt || "",
                categoryName: post.category ? post.category.name : "Unknown",
                imageUrls: imageUrls, // The array of formatted image URLs
            };
        });
        res.status(200).json({ posts: formattedPosts });
    }
    catch (error) {
        console.error("Error in getMentalHealthPosts:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
exports.getMentalHealthPosts = getMentalHealthPosts;
const getMentalHealthPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const mental = await mentalhealthPost_1.default.findById(id).populate("category").populate("userId", "name email");
        if (!mental) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrl = mental.image ? `${baseUrl}/${mental.image}` : null;
        res.status(200).json({
            _id: mental._id,
            title: mental.title,
            description: mental.description,
            category: mental.category.name,
            user: mental.userId,
            imageUrl: imageUrl,
            likes: mental.likes.length,
            comments: mental.comments.length,
            followers: mental.followers.length,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
exports.getMentalHealthPostById = getMentalHealthPostById;
const updateMentalHealthPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, description } = req.body;
        // Validate required fields
        if (!title || !category || !description) {
            res.status(400).json({ error: "All fields (title, category, description) are required" });
            return;
        }
        // Find the category by name
        const categoryExists = await category_model_1.default.findOne({ name: category });
        if (!categoryExists) {
            res.status(400).json({ error: "Category not found" });
            return;
        }
        // Handle file upload if a new image is provided
        let imagePath = req.file ? req.file.path : undefined;
        // Find and update the post
        const updatedPost = await mentalhealthPost_1.default.findByIdAndUpdate(id, {
            title,
            category: categoryExists._id, // ✅ Assign the ObjectId instead of a string
            description,
            ...(imagePath && { image: imagePath }),
        }, { new: true } // Return the updated document
        )
            .populate("category"); // ✅ Type assertion to ensure category is ICategory
        if (!updatedPost) {
            res.status(404).json({ error: "Post not found" });
            return;
        }
        // Construct image URL
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrl = updatedPost.image ? `${baseUrl}/${updatedPost.image}` : '';
        res.status(200).json({
            message: "Post updated successfully",
            post: {
                ...updatedPost.toObject(),
                categoryName: updatedPost.category.name, // ✅ Now TypeScript knows it's an ICategory
                imageUrl: imageUrl
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
exports.updateMentalHealthPost = updateMentalHealthPost;
// Delete mental health post
// export const deleteMentalHealthPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params; // Extract the ID from the request parameters
//     if (!id) {
//        res.status(400).json({ error: "Post ID is missing" });
//        return
//     }
//     // Find the post by ID and delete it
//     const deletedPost = await Mental.findByIdAndDelete(id);
//     if (!deletedPost) {
//        res.status(404).json({ error: "Mental health post not found" });
//        return
//     }
//     res.status(200).json({ message: "Post deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting post:", error);
//     res.status(500).json({ error: "Server error", details: (error as Error).message });
//   }
// };
const deleteMentalHealthPost = async (req, res) => {
    try {
        const { id } = req.params; // Extract the ID from the request parameters
        console.log("Received Post ID:", id); // Debugging the ID
        if (!id) {
            res.status(400).json({ error: "Post ID is missing" });
            return;
        }
        // Find the post by ID and delete it
        const deletedPost = await mentalhealthPost_1.default.findByIdAndDelete(id);
        if (!deletedPost) {
            res.status(404).json({ error: "Mental health post not found" });
            return;
        }
        res.status(200).json({ message: "Post deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
exports.deleteMentalHealthPost = deleteMentalHealthPost;
const PostAdmin = async (req, res) => {
    try {
        const { title, category, description } = req.body;
        // Validate required fields
        if (!title || !category || !description) {
            res.status(400).json({ error: "All fields (title, category, description) are required" });
            return;
        }
        // Check if the user is authorized
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        // Handle file upload - get the file path if an image was uploaded
        let imagePath = '';
        if (req.file) {
            imagePath = req.file.path;
        }
        // Find the category by name
        const categoryExists = await category_model_1.default.findOne({ name: category });
        if (!categoryExists) {
            res.status(400).json({ error: "Category not found" });
            return;
        }
        // Create the new post
        const AdminPost = new admin_Post_1.default({
            userId: new mongoose_1.Types.ObjectId(req.user.id),
            title,
            category: categoryExists._id, // Use category's _id
            description,
            image: imagePath,
            likes: [],
            comments: [],
            followers: []
        });
        // Save the post to the database
        await AdminPost.save();
        // Fetch the post with populated category details
        const populatedPost = await admin_Post_1.default.findById(AdminPost._id).populate("category");
        // Construct image URL
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrl = imagePath ? `${baseUrl}/${imagePath}` : '';
        if (populatedPost && populatedPost.category) {
            res.status(201).json({
                message: "Post created successfully",
                post: {
                    ...populatedPost.toObject(),
                    categoryName: populatedPost.category.name,
                    imageUrl: imageUrl
                },
            });
        }
        else {
            res.status(500).json({ error: "Failed to populate category" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
exports.PostAdmin = PostAdmin;
const GetAllPostsAdmin = async (req, res) => {
    try {
        // Ensure user is authenticated
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filter parameters
        const categoryFilter = req.query.category ? { 'category': req.query.category } : {};
        const titleFilter = req.query.title
            ? { 'title': { $regex: req.query.title, $options: 'i' } }
            : {};
        // Combine filters
        const filters = {
            ...categoryFilter,
            ...titleFilter,
            // Filter by the authenticated user's ID
            userId: req.user.id
        };
        // Get total count for pagination
        const totalPosts = await admin_Post_1.default.countDocuments(filters);
        const totalPages = Math.ceil(totalPosts / limit);
        // Fetch posts with pagination, sorting, and population
        const posts = await admin_Post_1.default.find(filters)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('category')
            .populate('userId', 'username profilePicture');
        // Construct proper URLs for images
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const formattedPosts = posts.map(post => {
            const postObj = post.toObject();
            return {
                ...postObj,
                categoryName: post.category?.name || '',
                imageUrl: post.image ? `${baseUrl}/${post.image}` : '',
            };
        });
        res.status(200).json({
            posts: formattedPosts,
            pagination: {
                totalPosts,
                totalPages,
                currentPage: page,
                limit
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Failed to fetch posts",
            details: error.message
        });
    }
};
exports.GetAllPostsAdmin = GetAllPostsAdmin;
