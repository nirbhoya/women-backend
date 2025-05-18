"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCart = exports.addToCart = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Order_1 = __importDefault(require("../models/Order"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// export const addToCart = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { userId, products, totalAmount, paymentMethod, transactionId, paymentDetails } = req.body;
//         // ✅ Validate input fields
//         if (!userId || !Array.isArray(products) || products.length === 0 || !totalAmount || !paymentMethod || !transactionId) {
//             res.status(400).json({ error: "All fields are required" });
//             return;
//         }
//         // ✅ Convert `userId` and `productId` to MongoDB ObjectId
//         const userObjectId = new mongoose.Types.ObjectId(userId);
//         const productsWithObjectId = products.map(product => ({
//             productId: new mongoose.Types.ObjectId(product.productId),
//             quantity: product.quantity
//         }));
//         // ✅ Ensure `paymentMethod` matches allowed values
//         const allowedMethods = ["bkash", "nagad"];
//         if (!allowedMethods.includes(paymentMethod.toLowerCase())) {
//             res.status(400).json({ error: "Invalid payment method. Allowed: bkash, nagad" });
//             return;
//         }
//         // ✅ Ensure at least one payment detail is provided
//         if (!paymentDetails.bkashNumber && !paymentDetails.nagadNumber) {
//             res.status(400).json({ error: "Provide at least one payment number (bkashNumber or nagadNumber)" });
//             return;
//         }
//         // ✅ Create new Order instance
//         const order = new Order({
//             userId: userObjectId,
//             products: productsWithObjectId,
//             totalAmount,
//             paymentMethod: paymentMethod.toLowerCase(),
//             transactionId,
//             paymentDetails,
//         });
//         // ✅ Save the order to the database
//         await order.save();
//         // ✅ Populate product details
//         const populatedOrder = await Order.findById(order._id).populate('products.productId', 'name category price'); // Populating 'productId' with fields like name, category, and price.
//         // ✅ Respond with the populated order
//         res.status(201).json({
//             message: "Order placed successfully",
//             order: populatedOrder,
//         });
//     } catch (error) {
//         console.error("Server Error:", error); // Debugging log for server-side issues
//         res.status(500).json({ error: "Server error", details: error });
//     }
// };
//individual user
const addToCart = async (req, res) => {
    try {
        const { userId, products, totalAmount, paymentMethod, transactionId, paymentDetails, note } = req.body;
        // ✅ Validate input fields
        if (!userId || !Array.isArray(products) || products.length === 0 || !totalAmount || !paymentMethod || !transactionId) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }
        // ✅ Convert `userId` and `productId` to MongoDB ObjectId
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const productsWithObjectId = products.map(product => ({
            productId: new mongoose_1.default.Types.ObjectId(product.productId),
            quantity: product.quantity
        }));
        // ✅ Ensure `paymentMethod` matches allowed values
        const allowedMethods = ["bkash", "nagad"];
        if (!allowedMethods.includes(paymentMethod.toLowerCase())) {
            res.status(400).json({ error: "Invalid payment method. Allowed: bkash, nagad" });
            return;
        }
        // ✅ Ensure at least one payment detail is provided
        if (!paymentDetails.bkashNumber && !paymentDetails.nagadNumber) {
            res.status(400).json({ error: "Provide at least one payment number (bkashNumber or nagadNumber)" });
            return;
        }
        // ✅ Create new Order instance
        const order = new Order_1.default({
            userId: userObjectId,
            products: productsWithObjectId,
            totalAmount,
            paymentMethod: paymentMethod.toLowerCase(),
            transactionId,
            paymentDetails,
            note, // Include the note
        });
        // ✅ Save the order to the database
        await order.save();
        // ✅ Populate product details
        const populatedOrder = await Order_1.default.findById(order._id).populate('products.productId', 'name category price');
        // ✅ Respond with the populated order including the note
        res.status(201).json({
            message: "Order placed successfully",
            order: populatedOrder,
        });
    }
    catch (error) {
        console.error("Server Error:", error); // Debugging log
        res.status(500).json({ error: "Server error", details: error });
    }
};
exports.addToCart = addToCart;
const getCart = async (req, res) => {
    try {
        // ✅ Extract the Bearer Token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized: No token provided" });
            return;
        }
        // ✅ Decode the token to get `userId`
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            res.status(401).json({ error: "Unauthorized: Invalid token" });
            return;
        }
        // ✅ Fetch the latest cart/order for the authenticated user
        const cart = await Order_1.default.findOne({ userId: new mongoose_1.default.Types.ObjectId(decoded.id) })
            .populate("products.productId", "name price image") // Populate product details
            .sort({ createdAt: -1 }); // Get the latest order
        if (!cart) {
            res.status(404).json({ error: "Cart is empty or no order found" });
            return;
        }
        res.status(200).json({ message: "Cart details retrieved", cart });
    }
    catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ error: "Server error", details: error instanceof Error ? error.message : error });
    }
};
exports.getCart = getCart;
