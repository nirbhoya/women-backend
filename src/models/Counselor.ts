import mongoose, { Schema, Document } from "mongoose";

export interface ICounselor extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  specialty: string;
  experience: number;
  education: string;
  location: string;
  time: Date;
  bio: string;
  image: any;
  availability: string[];
  ratings: number;
}

const CounselorSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    phone: { type: String, required: false },
    specialty: { type: String, required: false },
    experience: { type: Number, required: false },
    education: { type: String, required: false },
    location: {type: String, required: false},
    time: {type: Date, required:false},
    bio: { type: String, required: false },
    image: { type: Array }, // Store image URL
    availability: { type: [String], default: [] }, // Available days
    ratings: { type: Number, default: 0 }, // Default rating 0
  },
  { timestamps: true }
);

export default mongoose.model<ICounselor>("Counselor", CounselorSchema);
