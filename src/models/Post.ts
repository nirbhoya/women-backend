
// // import mongoose, { Schema, Document } from "mongoose";

// // export interface IPost extends Document {
// //   userId: string;
// //   title: string;
// //   category: string;
// //   description: string;
// //   image: string;
// //   likes: number;
// //   comments: number;
// // }

// // const PostSchema: Schema = new Schema(
// //   {
// //     userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
// //     title: { type: String, required: true },
// //     category: { type: String, required: true },
// //     description: { type: String, required: true },
// //     image: { type: String },
// //     likes: { type: Number, default: 0 },
// //     comments: { type: Number, default: 0 },
// //   },
// //   { timestamps: true }
// // );

// // export default mongoose.model<IPost>("Post", PostSchema);



// import mongoose, { Schema, Document, Types } from "mongoose";

// export interface IPost extends Document {
//   userId: string;
//   title: string;
//   category: string;
//   description: string;
//   image: string;
//   likes: mongoose.Types.ObjectId[];// ✅ Array of user IDs
//   comments: { userId: mongoose.Types.ObjectId; commentText: string }[];
  
// }

// const PostSchema: Schema = new Schema(
//   {
//     userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     title: { type: String, required: true },
//     category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
//     description: { type: String, required: true },
//     image: { type: String },
//     likes: [{ type: Schema.Types.ObjectId, ref: "User" }], // ✅ Changed to an array
//     comments: [
//       {
//           userId: { type: Types.ObjectId, required: true, ref: 'User' },
//           commentText: { type: String, required: true },
//       }
//   ],
//   },
//   { timestamps: true }
// );

// export default mongoose.model<IPost>("Post", PostSchema);

import mongoose, { Schema, Document, Types } from "mongoose";
import { ICategory } from "./category.model";


interface IPost extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  category: ICategory; 
  description: string;
  images?: any;
  likes: Types.ObjectId[];
  comments: { userId: Types.ObjectId; commentText: string }[];
  followers: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },
    images: [{ type: String }],

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

export default mongoose.model<IPost>("Post", PostSchema);