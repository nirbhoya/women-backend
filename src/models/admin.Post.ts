
import mongoose, { Schema, Document, Types } from "mongoose";
import { ICategory } from "./category.model";


interface Iadmin extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  category: ICategory; // Category should now be typed as ICategory
  description: string;
  image?: any;
  likes: Types.ObjectId[];
  comments: { userId: Types.ObjectId; commentText: string }[];
  followers: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const AdminPostSchema = new Schema<Iadmin>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },
    image: { type: Array },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        commentText: { type: String, required: true },
      },
    ],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model<Iadmin>("Apost", AdminPostSchema);
