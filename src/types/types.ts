import { Request } from "express";

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role?: string }; // Adjust this based on your user structure
}
