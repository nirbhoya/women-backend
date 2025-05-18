import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  category: string;
  description: string;
  price: number;
  images: string[];
}
const ProductSchema: Schema = new Schema(
  {
      name: { type: String, required: true },
      category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
      description: { type: String, required: true },
      price: { type: Number, required: true },
      images: { type: [String], required: true },
  },
  { timestamps: true }
);


export default mongoose.model<IProduct>("Product", ProductSchema);

