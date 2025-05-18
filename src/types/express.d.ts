// types/express.d.ts
import  { IUser }  from "../models/User"; // Import your User model if needed

declare global {
    namespace Express {
        interface Request {
            user?: IUser | null; // You can use the User model here or `any` if you're not specific
        }
    }
}
