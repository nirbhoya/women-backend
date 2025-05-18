import { Response } from "express";
import { AuthenticatedRequest } from "../types/types"; // Import the extended Request type
import Order from "../models/Order"; // Ensure Order model is imported

export const placeOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { products, totalAmount, paymentMethod, transactionId, paymentDetails } = req.body;

        if (!req.user?.id || !Array.isArray(products) || products.length === 0 || !totalAmount || !paymentMethod || !transactionId) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }

        const order = new Order({
            userId: req.user.id, // Ensure userId is set from req.user
            products,
            totalAmount,
            paymentMethod,
            transactionId,
            paymentDetails,
        });

        await order.save();
        res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
