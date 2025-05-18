// import mongoose, { Schema } from "mongoose";

// export interface ICategory extends Document {
//     name: string;
//   }

// const CategorySchema: Schema = new Schema(
//     {
//         name: { type: String, required: true, unique: true },
//     },
//     { timestamps: true }
// );

// export default mongoose.model("Category", CategorySchema);
import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  // Mongoose adds `_id` automatically to each document, 
  // so it will be available without explicitly defining it
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>("Category", CategorySchema);
