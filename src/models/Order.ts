import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: string;
  products: { productId: string; quantity: number }[];
  note:string,
  paymentDetails:[],
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
}



const OrderSchema: Schema = new Schema(
  {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      products: [
          {
              productId: { type: Schema.Types.ObjectId, ref: "Product" },
              quantity: { type: Number, required: true },
          },
      ],
      note: {type: String, required: false },
      totalAmount: { type: Number, required: true },
      paymentMethod: { type: String, enum: ["bkash", "nagad"], required: true },
      transactionId: { type: String, required: true },
      paymentDetails: {
          name: { type: String, required: true },
          address: { type: String, required: true },
          phone: { type: String, required: true },
          bkashNumber: { type: String },
          nagadNumber: { type: String },
      },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);

// export default mongoose.model<IOrder>("Order", OrderSchema);
