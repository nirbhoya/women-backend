
// import mongoose, { Schema, Document } from "mongoose";

// export interface IAdmin extends Document {
    
//     name: string;
//     email: string;
//     password: string;
//     role: "admin";
// }

// const AdminSchema: Schema = new Schema(
//     {
//         name: { type: String, required: true },
//         email: { type: String, required: true, unique: true },
//         password: { type: String, required: true },
//         role: { type: String, default: "admin" },
//     },
//     { timestamps: true }
// );

// export default mongoose.model<IAdmin>("Admin", AdminSchema);


import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Admin Interface
export interface IAdmin extends Document {
    name: string;
    email: string;
    password: string;
    role: "admin";
}

// Admin Schema
const AdminSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: "admin" },
    },
    { timestamps: true }
);

// Pre-save middleware to hash the password before saving
AdminSchema.pre<IAdmin>("save", async function(next) {
    if (this.isModified("password")) {
      console.log("Hashing password via pre-save hook...");
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  });
  
  

// Create Admin model
export default mongoose.model<IAdmin>("Admin", AdminSchema);
