"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeOrder = void 0;
const Order_1 = __importDefault(require("../models/Order")); // Ensure Order model is imported
const placeOrder = async (req, res) => {
    try {
        const { products, totalAmount, paymentMethod, transactionId, paymentDetails } = req.body;
        if (!req.user?.id || !Array.isArray(products) || products.length === 0 || !totalAmount || !paymentMethod || !transactionId) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }
        const order = new Order_1.default({
            userId: req.user.id, // Ensure userId is set from req.user
            products,
            totalAmount,
            paymentMethod,
            transactionId,
            paymentDetails,
        });
        await order.save();
        res.status(201).json({ message: "Order placed successfully", order });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.placeOrder = placeOrder;
