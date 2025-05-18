// import mongoose, { Schema, Document } from "mongoose";

// interface INotification extends Document {
//   userId: string;
//   message: string;
//   createdAt: Date;
//   read: boolean;
// }

// const NotificationSchema: Schema = new Schema(
//   {
//     userId: { type: String, required: true },
//     message: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
//     read: { type: Boolean, default: false },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
// export default Notification;


import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>("Notification", NotificationSchema);
