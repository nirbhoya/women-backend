import { Request, Response } from "express";
import Post from "../models/Post";
import { Types } from "mongoose"; // Import Types for ObjectId
import Category, { ICategory } from "../models/category.model"; // Ensure correct import path
import User from "../models/User";
import path from "path";
import fs from "fs";
interface AuthenticatedRequest extends Request {
    user?: { id: string };
}




// export const createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//     try {
//       const { title, category, description } = req.body;
  
//       if (!title || !category || !description) {
//          res.status(400).json({ error: "All fields (title, category, description) are required" });
//          return;
//         }
  
//       if (!req.user) {
//          res.status(401).json({ error: "Unauthorized" });
//          return;
//       }
  
//       // Handle the image uploads (multiple images)
//       let imagePaths: string[] = [];
//       if (req.files && Array.isArray(req.files)) {
//         // Log the uploaded files for debugging
//         console.log("Uploaded files:", req.files);
  
//         // Extract the paths for all uploaded images
//         imagePaths = (req.files as Express.Multer.File[]).map(file => file.path.replace(/\\/g, '/'));  // Normalize path
//         console.log("Image paths:", imagePaths);  // Log the image paths
//       } else {
//         console.log("No files uploaded");
//       }
  
//       // Check if the category exists
//       let categoryExists: ICategory | null = null;
//       if (Types.ObjectId.isValid(category)) {
//         categoryExists = await Category.findById(category);
//       }
  
//       if (!categoryExists) {
//         categoryExists = await Category.findOne({ name: category });
//       }
  
//       if (!categoryExists) {
//          res.status(400).json({ error: "Category not found" });
//          return;
//       }
  
//       // Create the post with the image paths
//       const post = new Post({
//         userId: req.user.id,
//         title,
//         category: categoryExists._id,
//         description,
//         images: imagePaths,  // Save the array of image paths to the post object
//       });
  
//       await post.save();
  
//       // Populate the post with category data
//       const populatedPost = await Post.findById(post._id).populate("category");
  
//       // Handle the case where the post could not be populated
//       if (!populatedPost) {
//          res.status(500).json({ error: "Failed to populate post" });
//          return;
//       }
  
//       // Construct the full image URLs
//     //   const baseUrl = `${req.protocol}://${req.get('host')}`;
//     //   const imageUrls = imagePaths.map(imagePath => `${baseUrl}/${imagePath}`);
//     const baseUrl = `${req.protocol}://${req.get('host')}`;
//     const imageUrls = imagePaths ? `${baseUrl}/uploads/PostImage/${imagePaths}` : '';

  
//       // Send the response with the image URLs
//       res.status(201).json({
//         message: "Post created successfully",
//         post: {
//           ...populatedPost.toObject(),
//           categoryName: populatedPost.category.name,
//           imageUrls,  // Include the image URLs in the response
//         },
//       });
//     } catch (error) {
//       console.error("Error creating post:", error);
//       res.status(500).json({ error: "Server error", details: (error as Error).message });
//     }
//   };
  
export const createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { title, category, description } = req.body;
  
      if (!title || !category || !description) {
        res.status(400).json({ error: "All fields (title, category, description) are required" });
        return;
      }
  
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
  
      // Handle the file uploads
      let imagePaths: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        // Extract the paths for all uploaded images
        imagePaths = (req.files as Express.Multer.File[]).map(file => {
          // Convert Windows backslashes to forward slashes and make path relative
          return file.path
            .replace(/\\/g, '/')
            .replace(/^.*uploads\//, 'uploads/');
        });
        console.log("Processed image paths:", imagePaths);
      }
  
      // Check if the category exists
      let categoryExists: ICategory | null = null;
      if (Types.ObjectId.isValid(category)) {
        categoryExists = await Category.findById(category);
      }
  
      if (!categoryExists) {
        categoryExists = await Category.findOne({ name: category });
      }
  
      if (!categoryExists) {
        res.status(400).json({ error: "Category not found" });
        return;
      }
  
      // Create the post with the image paths
      const post = new Post({
        userId: req.user.id,
        title,
        category: categoryExists._id,
        description,
        images: imagePaths,
      });
  
      // Save the post
      await post.save();
  
      // Populate the post with category data
      const populatedPost = await Post.findById(post._id).populate("category");
  
      if (!populatedPost) {
        res.status(500).json({ error: "Failed to populate post" });
        return;
      }
  
      // Construct the full image URLs
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrls = imagePaths.map(imagePath => `${baseUrl}/${imagePath}`);
  
      // Send a clear, complete response
      res.status(201).json({
        message: "Post created successfully",
        post: {
          ...populatedPost.toObject(),
          categoryName: populatedPost.category.name,
          imageUrls,
        },
      });
  
    } catch (error) {
      console.error("Error creating post:", error);
      
      // More detailed error response
      res.status(500).json({ 
        error: "Server error", 
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null
      });
    }
  };
  
  export const updatePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { title, category, description } = req.body;
      const postId = req.params.id;
  
      // Check if the postId is valid
      if (!Types.ObjectId.isValid(postId)) {
        res.status(400).json({ error: "Invalid post ID" });
        return;
      }
  
      // Check if the post exists
      const post = await Post.findById(postId);
      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }
  
      // Check if the user is the post owner
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
  
      // Handle file uploads
      let imagePaths: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        imagePaths = (req.files as Express.Multer.File[]).map(file => {
          return file.path.replace(/\\/g, '/').replace(/^.*uploads\//, 'uploads/');
        });
      }
  
      // Handle category check and population
      let categoryExists: ICategory | null = null;
  
      if (Types.ObjectId.isValid(category)) {
        categoryExists = await Category.findById(category) as ICategory | null;
      }
  
      if (!categoryExists) {
        categoryExists = await Category.findOne({ name: category }) as ICategory | null;
      }
  
      if (!categoryExists) {
        res.status(400).json({ error: "Category not found" });
        return;
      }
  
      // Update the post
      post.title = title ?? post.title;
      post.description = description ?? post.description;
      post.images = imagePaths.length > 0 ? imagePaths : post.images;
  
      // Save the updated post
      await post.save();
  
      // Populate the post with category data
      const populatedPost = await Post.findById(post._id).populate("category");
  
      if (!populatedPost) {
        res.status(500).json({ error: "Failed to populate post" });
        return;
      }
  
      // Safely check if category exists before trying to access name
      const categoryName = populatedPost.category ? populatedPost.category.name : "No Category";
  
      // Construct the full image URLs
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrls = populatedPost.images.map((imagePath: any) => `${baseUrl}/${imagePath}`);
  
      // Send the response
      res.status(200).json({
        message: "Post updated successfully",
        post: {
          ...populatedPost.toObject(),
          categoryName, // Using the safe category name
          imageUrls,
        },
      });
  
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
      });
    }
  };
  

  export const getUserPosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Check if the user is authenticated
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
  
      // Get posts by the authenticated user
      const posts = await Post.find({ userId: req.user.id });
  
      // If no posts found, send a response indicating this
      if (posts.length === 0) {
        res.status(404).json({ message: "No posts found" });
        return;
      }
  
      // Populate the category of each post (optional, if needed)
      const populatedPosts = await Post.find({ userId: req.user.id }).populate("category");
  
      // Send the list of posts with populated categories
      res.status(200).json({
        message: "User's posts retrieved successfully",
        posts: populatedPosts,
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  
  export const deletePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { postId } = req.params;
  
      // Validate input
      if (!postId) {
        res.status(400).json({ error: "Post ID is required" });
        return;
      }
  
      // Ensure user is authenticated
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
  
      // Find the post to delete
      const postToDelete = await Post.findById(postId);
  
      if (!postToDelete) {
        res.status(404).json({ error: "Post not found" });
        return;
      }
  
      // Check if the current user owns the post
      if (postToDelete.userId.toString() !== req.user.id) {
        res.status(403).json({ error: "You are not authorized to delete this post" });
        return;
      }
  
      // Delete associated image file
      if (postToDelete.images) {
        try {
          // Construct full path to the image
          const fullImagePath = path.join(process.cwd(), postToDelete.images);
          await (fullImagePath);
        } catch (fileError) {
          console.warn(`Could not delete image: ${postToDelete.images}`, fileError);
        }
      }
  
      // Delete the post from the database
      await Post.findByIdAndDelete(postId);
  
      // Send success response
      res.status(200).json({
        message: "Post deleted successfully",
        postId: postId
      });
  
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ 
        error: "Server error", 
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null
      });
    }
  };

export const toggleLikePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;
        const userId = req.user?.id; // Authenticated user ID

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }

        // Ensure likes is an array of ObjectId's
        if (!Array.isArray(post.likes)) {
            post.likes = [];
        }

        const userObjectId = new Types.ObjectId(userId);

        // Convert likes to strings for comparison
        const likedIndex = post.likes.findIndex(id => id.toString() === userObjectId.toString());

        if (likedIndex === -1) {
            post.likes.push(userObjectId); // Add like
        } else {
            post.likes.splice(likedIndex, 1); // Remove like
        }

        await post.save();
        res.status(200).json({ message: "Like status updated", likes: post.likes.length });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: (error as Error).message });
    }
};


export const addComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;
        const { commentText } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!commentText) {
            res.status(400).json({ error: "Comment text is required" });
            return;
        }

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }

        // Ensure comments is an array
        if (!Array.isArray(post.comments)) {
            post.comments = [];
        }

        // Create a new comment object with userId and commentText
        const newComment = {
            userId: new Types.ObjectId(userId), // Ensure userId is ObjectId
            commentText: commentText.toString(), // Ensure it's a string
        };

        post.comments.push(newComment); // Add comment to the array
        await post.save();

        res.status(201).json({ message: "Comment added", comments: post.comments });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: (error as Error).message });
    }
};



export const getComments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId).populate("comments.userId", "username"); // Populate user details
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }

        res.status(200).json({ comments: post.comments });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};


// Get Posts by Category
export const getPostsByCategory = async (req: Request, res: Response) => {
    try {
        const { category } = req.params;
        const posts = await Post.find({ category }).sort({ likes: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

export const getCommunityPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find().sort({ likes: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

//get all post
export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate("userId", "name email") // Populating userId with specific fields (name, email)
            .populate("likes", "name email") // Populating likes with specific fields (name, email)
            .populate("category", "name"); // Populating category with the name field

        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: "Server error", details: (error as Error).message });
    }
};



// export const searchPosts = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { query } = req.query;
//         if (!query) {
//             res.status(400).json({ error: "Search query is required" });
//             return;
//         }
//         const posts = await Post.find({
//             $or: [
//                 { title: { $regex: query, $options: "i" } },
//                 { description: { $regex: query, $options: "i" } }
//             ]
//         }).sort({ createdAt: -1 });
//         res.json(posts);
//     } catch (error) {
//         res.status(500).json({ error: "Server error", details: (error as Error).message });
//     }
// };

export const searchPostsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category } = req.query;
      
      if (!category) {
        res.status(400).json({ error: "Category is required for search" });
        return;
      }
      
      // Find posts by category (category name or ID)
      const categoryExists = await Category.findOne({ 
        $or: [
          { _id: Types.ObjectId.isValid(category as string) ? category : null },
          { name: category }
        ]
      });
  
      if (!categoryExists) {
        res.status(404).json({ error: "Category not found" });
        return;
      }
  
      // Find posts within the selected category
      const posts = await Post.find({ category: categoryExists._id }).populate("category");
      
      if (posts.length > 0) {
        res.status(200).json({
          message: "Posts fetched successfully",
          posts: posts.map(post => ({
            ...post.toObject(),
            categoryName: (post.category as any).name,
            imageUrl: post.images ? `${req.protocol}://${req.get('host')}/${post.images}` : ''
          })),
        });
      } else {
        res.status(404).json({ error: "No posts found in this category" });
      }
      
    } catch (error) {
      res.status(500).json({ error: "Server error", details: (error as Error).message });
    }
  };

export const savePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }

        const savedIndex = user.savedPosts.findIndex(id => id.toString() === postId);

        if (savedIndex === -1) {
            user.savedPosts.push(new Types.ObjectId(postId));
        } else {
            user.savedPosts.splice(savedIndex, 1);
        }
        await user.save();

        res.status(200).json({ message: "Post saved status updated", savedPosts: user.savedPosts });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: (error as Error).message });
    }
};

export const getSavedPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;  // Getting userId from authenticated request

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // Find the user by ID
        const user = await User.findById(userId).populate('savedPosts');
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        // Get the saved posts by populating the savedPosts field
        const savedPosts = user.savedPosts;

        // If no saved posts found
        if (savedPosts.length === 0) {
            res.status(200).json({ message: "No saved posts", savedPosts: [] });
            return;
        }

        res.status(200).json({ savedPosts });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: (error as Error).message });
    }
};

// Follow Post
export const followPost = async (req: Request, res: Response): Promise<void> =>{
    try {
        const { postId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }

        if (!Array.isArray(post.followers)) {
            post.followers = [];
        }

        const userObjectId = new Types.ObjectId(userId);
        const followIndex = post.followers.findIndex(id => id.toString() === userObjectId.toString());

        if (followIndex === -1) {
            post.followers.push(userObjectId);
        } else {
            post.followers.splice(followIndex, 1);
        }
        await post.save();

        res.status(200).json({ message: "Follow status updated", followers: post.followers.length });
    } catch (error) {
        res.status(500).json({ error: "Server error", details: (error as Error).message });
    }
};

export const getPostFollowers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId).populate("followers", "name email"); // Populating followers
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }

        res.status(200).json({ followers: post.followers });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
