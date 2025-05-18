import { Request, Response } from "express";
import User from "../models/User";
import Post from "../models/Post";
import Order from "../models/Order";
import Category from "../models/category.model";
import Product from "../models/Product";
import Admin from "../models/admin.model";
const bcrypt = require('bcryptjs');
import jwt from "jsonwebtoken";
import path from "path";
import multer from "multer";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../types/types";
const uploadProductImages = multer({ dest: 'uploads/' });
// Hash password using bcrypt

export const getUsers = async (req: Request, res: Response) => {
  const users = await User.find();
  res.json(users);
};

export const getCommunityPosts = async (req: Request, res: Response) => {
  const posts = await Post.find().sort({ likes: -1 });
  res.json(posts);
};

export const getOrders = async (req: Request, res: Response) => {
  const orders = await Order.find().populate("userId").populate("products.productId");
  res.json(orders);
};



// export const createCategory = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { name } = req.body;

//     if (!name) {
//       res.status(400).json({ error: "Category name is required" });
//       return; // Stop further execution
//     }

//     const existingCategory = await Category.findOne({ name });

//     if (existingCategory) {
//       res.status(400).json({ error: "Category already exists" });
//       return;
//     }

//     const category = new Category({ name });
//     await category.save();

//     res.status(201).json({ message: "Category created successfully", category });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ensure the user is authenticated
    const { name } = req.body;
    if (!name) {
       res.status(400).json({ error: "Category name is required" });
       return
    }

    // Check if the category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
       res.status(400).json({ error: "Category already exists" });
       return
    }

    // Create the new category and save it
    const category = new Category({ name });
    await category.save();

    res.status(201).json({ message: "Category created successfully", category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Server error" });
  }
};



export const addProductHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, description, price } = req.body;
    const images = req.files as Express.Multer.File[];

    if (!name || !category || !description || !price || !images || images.length === 0) {
       res.status(400).json({ error: "All fields are required" });
       return
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
       res.status(400).json({ error: "Price must be a valid number" });
       return
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrls = images.map(image => `${baseUrl}/uploads/PostImage/${image.filename}`);

    const product = new Product({
      name,
      category,
      description,
      price: parsedPrice,
      images: imageUrls,
    });

    await product.save();

    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Server error while adding product", details: error });
  }
};

// export const addProductHandler = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { name, category, description, price } = req.body;
//     const images = req.files as Express.Multer.File[];

//     // Validation checks
//     if (!name || !category || !description || !price) {
//       res.status(400).json({ error: "All fields are required" });
//       return;
//     }

//     if (!images || images.length === 0) {
//       res.status(400).json({ error: "At least one image is required" });
//       return;
//     }

//     // Price validation
//     const parsedPrice = parseFloat(price);
//     if (isNaN(parsedPrice) || parsedPrice < 0) {
//       res.status(400).json({ error: "Price must be a valid positive number" });
//       return;
//     }

//     // Generate image URLs
//     const baseUrl = `${req.protocol}://${req.get('host')}`;
//     const imageUrls = images.map(image => 
//       `${baseUrl}/uploads/${image.filename}`.replace(/\\/g, '/')
//     );

//     // Create and save product
//     const product = new Product({
//       name,
//       category,
//       description,
//       price: parsedPrice,
//       images: imageUrls,
//     });

//     await product.save();

//     // Respond with success
//     res.status(201).json({ 
//       message: "Product added successfully", 
//       product 
//     });
//   } catch (error) {
//     console.error("Error adding product:", error);
//     res.status(500).json({ 
//       error: "Server error while adding product", 
//       details: error instanceof Error ? error.message : String(error)
//     });
//   }
// };


export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  
  const productId = req.params.id;  // Get the product ID from the request parameters

  try {
    const product = await Product.findByIdAndDelete(productId);  // Find and delete the product

    if (!product) {
       res.status(404).json({ error: "Product not found" });
       return
    }

    res.status(200).json({ message: "Product removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: (error as Error).message });
  }
};

// export const createAdmin = async (req: Request, res: Response): Promise<void> => {
//   try {
//       const { name, email, password } = req.body;

//       if (!name || !email || !password) {
//            res.status(400).json({ error: "All fields are required" });
//            return
//       }

//       // Check if admin already exists
//       const existingAdmin = await Admin.findOne({ email });
//       if (existingAdmin) {
//            res.status(400).json({ error: "Admin already exists" });
//            return
//       }

//       // Hash password
//       const hashedPassword = await bcrypt.hash(password, 10);

//       const newAdmin = new Admin({ name, email, password: hashedPassword });
//       await newAdmin.save();

//       // Create JWT token
//       const token = jwt.sign({ id: newAdmin._id, role: "admin" }, process.env.JWT_SECRET as string, {
//           expiresIn: "7d",
//       });

//       res.status(201).json({ message: "Admin created successfully", token });
//   } catch (error) {
//       res.status(500).json({ error: "Server error" });
//   }
// };

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      res.status(400).json({ error: "Admin already exists" });
      return;
    }

    const newAdmin = new Admin({ name, email, password, role: "admin" }); // 👈 No manual hashing
    await newAdmin.save();

    const token = jwt.sign(
      { id: newAdmin._id, role: "admin" },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(201).json({ message: "Admin created successfully", token });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
      // Get the token from the Authorization header
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
          res.status(401).json({ error: "No token provided" });
          return;
      }

      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };

      // Check if the decoded token has a valid role
      if (decoded.role !== 'admin') {
          res.status(403).json({ error: "Unauthorized access" });
          return;
      }

      // Find the admin using the decoded ID
      const admin = await Admin.findById(decoded.id);

      if (!admin) {
          res.status(404).json({ error: "Admin not found" });
          return;
      }

      // Return the admin's data (excluding password)
      const { password, ...adminData } = admin.toObject();
      res.status(200).json(adminData);

  } catch (error) {
      res.status(500).json({ error: "Server error" });
  }
};

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log("No admin found with email:", email);
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    console.log("Login attempt:");
    console.log("Entered password:", password);
    console.log("Stored password hash:", admin.password);

    const isMatch = await bcrypt.compare(password, admin.password);

    console.log("Password match result:", isMatch);

    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password } = req.body;

//     console.log("Login attempt received");
//     console.log(`Email: ${email}, Password: ${password}`);

//     // Validate email and password
//     if (!email || !password) {
//       res.status(400).json({ error: "Email and password are required" });
//       return;
//     }

//     // Check if the admin exists
//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       console.log("Admin not found");
//       res.status(401).json({ error: "Invalid credentials" });
//       return;
//     }

//     console.log("Admin found, checking password...");

//     // Compare the password with the hashed password
//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       console.log("Password does not match");
//       res.status(401).json({ error: "Invalid credentials" });
//       return;
//     }
    

//     console.log("Password match successful. Generating token...");

//     // Generate a JWT token for the admin
//     const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET as string, {
//       expiresIn: "7d",
//     });

//     console.log("Token generated, sending response...");
//     res.json({ token });
//   } catch (err) {
//     console.error("Error in login:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

export const changeAdminPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: "New password and confirm password do not match" });
      return;
    }

    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!isMatch) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }

    admin.password = newPassword; // ✅ Let Mongoose pre-save hook handle hashing
    await admin.save();           // ✅ This will trigger the hook

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};



// export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const categories = await Category.find();
//     res.status(200).json({ categories });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// Controller for getting all categories
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch categories from the database
    const categories = await Category.find(); 
    res.status(200).json({ categories });  // Respond with the categories
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.status(200).json({ category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const removeCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params; // Get the category ID from the URL parameters

    if (!categoryId) {
       res.status(400).json({ error: "Category ID is required" });
       return
    }

    // Check if the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
       res.status(404).json({ error: "Category not found" });
       return
    }

    // Delete the category
    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({ message: "Category removed successfully" });
  } catch (error) {
    console.error("Error removing category:", error);
    res.status(500).json({ error: "Server error", details: error });
  }
};


export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find().populate("category"); // Populate category details
    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category");

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


//get all order

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
      // ✅ Fetch all orders with user and product details
      const orders = await Order.find()
          .populate("userId", "name email phone bkashNumber nagadNumber transactionId note") // Get user details
          .populate("products.productId", "name price "); // Get product details

      if (!orders || orders.length === 0) {
          res.status(404).json({ error: "No orders found" });
          return;
      }

      res.status(200).json({ message: "Orders retrieved successfully", orders });
  } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Server error", details: error});
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Find the order by its ID and remove it
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Server error" });
  }
};

