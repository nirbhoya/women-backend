"use strict";
// // import mongoose, { Schema, Document } from "mongoose";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
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
const mongoose_1 = __importStar(require("mongoose"));
const PostSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    comments: [
        {
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
            commentText: { type: String, required: true },
        },
    ],
    followers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
exports.default = mongoose_1.default.model("Post", PostSchema);
