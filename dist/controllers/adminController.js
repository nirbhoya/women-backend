"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.getAllOrders = exports.getProductById = exports.getAllProducts = exports.removeCategory = exports.getCategoryById = exports.getAllCategories = exports.changeAdminPassword = exports.loginAdmin = exports.getAdmin = exports.createAdmin = exports.deleteProduct = exports.addProductHandler = exports.createCategory = exports.getOrders = exports.getCommunityPosts = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Post_1 = __importDefault(require("../models/Post"));
const Order_1 = __importDefault(require("../models/Order"));
const category_model_1 = __importDefault(require("../models/category.model"));
const Product_1 = __importDefault(require("../models/Product"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
const bcrypt = require('bcryptjs');
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = __importDefault(require("multer"));
const uploadProductImages = (0, multer_1.default)({ dest: 'uploads/' });
// Hash password using bcrypt
const getUsers = async (req, res) => {
    const users = await User_1.default.find();
    res.json(users);
};
exports.getUsers = getUsers;
const getCommunityPosts = async (req, res) => {
    const posts = await Post_1.default.find().sort({ likes: -1 });
    res.json(posts);
};
exports.getCommunityPosts = getCommunityPosts;
const getOrders = async (req, res) => {
    const orders = await Order_1.default.find().populate("userId").populate("products.productId");
    res.json(orders);
};
exports.getOrders = getOrders;
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
const createCategory = async (req, res) => {
    try {
        // Ensure the user is authenticated
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ error: "Category name is required" });
            return;
        }
        // Check if the category already exists
        const existingCategory = await category_model_1.default.findOne({ name });
        if (existingCategory) {
            res.status(400).json({ error: "Category already exists" });
            return;
        }
        // Create the new category and save it
        const category = new category_model_1.default({ name });
        await category.save();
        res.status(201).json({ message: "Category created successfully", category });
    }
    catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ error: "Server error" });
    }
};
exports.createCategory = createCategory;
const addProductHandler = async (req, res) => {
    try {
        const { name, category, description, price } = req.body;
        const images = req.files;
        if (!name || !category || !description || !price || !images || images.length === 0) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) {
            res.status(400).json({ error: "Price must be a valid number" });
            return;
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrls = images.map(image => `${baseUrl}/uploads/PostImage/${image.filename}`);
        const product = new Product_1.default({
            name,
            category,
            description,
            price: parsedPrice,
            images: imageUrls,
        });
        await product.save();
        res.status(201).json({ message: "Product added successfully", product });
    }
    catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: "Server error while adding product", details: error });
    }
};
exports.addProductHandler = addProductHandler;
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
const deleteProduct = async (req, res) => {
    const productId = req.params.id; // Get the product ID from the request parameters
    try {
        const product = await Product_1.default.findByIdAndDelete(productId); // Find and delete the product
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        res.status(200).json({ message: "Product removed successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};
exports.deleteProduct = deleteProduct;
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
const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }
        const existingAdmin = await admin_model_1.default.findOne({ email });
        if (existingAdmin) {
            res.status(400).json({ error: "Admin already exists" });
            return;
        }
        const newAdmin = new admin_model_1.default({ name, email, password, role: "admin" }); // 👈 No manual hashing
        await newAdmin.save();
        const token = jsonwebtoken_1.default.sign({ id: newAdmin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({ message: "Admin created successfully", token });
    }
    catch (error) {
        console.error("Create admin error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
exports.createAdmin = createAdmin;
const getAdmin = async (req, res) => {
    try {
        // Get the token from the Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: "No token provided" });
            return;
        }
        // Verify the JWT token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Check if the decoded token has a valid role
        if (decoded.role !== 'admin') {
            res.status(403).json({ error: "Unauthorized access" });
            return;
        }
        // Find the admin using the decoded ID
        const admin = await admin_model_1.default.findById(decoded.id);
        if (!admin) {
            res.status(404).json({ error: "Admin not found" });
            return;
        }
        // Return the admin's data (excluding password)
        const { password, ...adminData } = admin.toObject();
        res.status(200).json(adminData);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.getAdmin = getAdmin;
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }
        const admin = await admin_model_1.default.findOne({ email });
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
        const token = jsonwebtoken_1.default.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.loginAdmin = loginAdmin;
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
const changeAdminPassword = async (req, res) => {
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
        const admin = await admin_model_1.default.findById(req.user.id);
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
        await admin.save(); // ✅ This will trigger the hook
        res.status(200).json({ message: "Password changed successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
exports.changeAdminPassword = changeAdminPassword;
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
const getAllCategories = async (req, res) => {
    try {
        // Fetch categories from the database
        const categories = await category_model_1.default.find();
        res.status(200).json({ categories }); // Respond with the categories
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await category_model_1.default.findById(id);
        if (!category) {
            res.status(404).json({ error: "Category not found" });
            return;
        }
        res.status(200).json({ category });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getCategoryById = getCategoryById;
const removeCategory = async (req, res) => {
    try {
        const { categoryId } = req.params; // Get the category ID from the URL parameters
        if (!categoryId) {
            res.status(400).json({ error: "Category ID is required" });
            return;
        }
        // Check if the category exists
        const category = await category_model_1.default.findById(categoryId);
        if (!category) {
            res.status(404).json({ error: "Category not found" });
            return;
        }
        // Delete the category
        await category_model_1.default.findByIdAndDelete(categoryId);
        res.status(200).json({ message: "Category removed successfully" });
    }
    catch (error) {
        console.error("Error removing category:", error);
        res.status(500).json({ error: "Server error", details: error });
    }
};
exports.removeCategory = removeCategory;
const getAllProducts = async (req, res) => {
    try {
        const products = await Product_1.default.find().populate("category"); // Populate category details
        res.status(200).json({ products });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findById(id).populate("category");
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        res.status(200).json({ product });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getProductById = getProductById;
//get all order
const getAllOrders = async (req, res) => {
    try {
        // ✅ Fetch all orders with user and product details
        const orders = await Order_1.default.find()
            .populate("userId", "name email phone bkashNumber nagadNumber transactionId note") // Get user details
            .populate("products.productId", "name price "); // Get product details
        if (!orders || orders.length === 0) {
            res.status(404).json({ error: "No orders found" });
            return;
        }
        res.status(200).json({ message: "Orders retrieved successfully", orders });
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Server error", details: error });
    }
};
exports.getAllOrders = getAllOrders;
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        // Find the order by its ID and remove it
        const order = await Order_1.default.findByIdAndDelete(id);
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.status(200).json({ message: "Order deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ error: "Server error" });
    }
};
exports.deleteOrder = deleteOrder;
