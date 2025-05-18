import mongoose, { Schema, Document } from "mongoose";

export interface IMenstrualHealth extends Document {
  userId: mongoose.Types.ObjectId;
  ageGroup: string;
  commonSymptoms: string[];
  tryingToConceive: boolean;
  lastPeriod: Date;
  periodDuration: number;
  wantsHealthTips: boolean;
  cycleRegularity: string;
  medicalConditions?: string[];
  painLevel: number; // 1 to 10 scale
  onMedication: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  nextMenstrualStartDate?: Date; // Add this field
}

// Define the MenstrualHealth schema
const MenstrualHealthSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    ageGroup: { type: String, required: true },
    commonSymptoms: [{ type: String }],
    tryingToConceive: { type: Boolean, required: true },
    lastPeriod: { type: Date, required: true },
    periodDuration: { type: Number, required: true },
    wantsHealthTips: { type: Boolean, required: true },
    cycleRegularity: { type: String, required: true },
    medicalConditions: [{ type: String }],
    painLevel: { type: Number, min: 1, max: 10, required: true },
    onMedication: { type: Boolean, required: true },
  },
  { timestamps: true }
);

// Virtual for next menstrual start date
MenstrualHealthSchema.virtual('nextMenstrualStartDate').get(function(this: IMenstrualHealth) {
  const lastPeriod = new Date(this.lastPeriod);
  const nextStartDate = new Date(lastPeriod);
  nextStartDate.setDate(lastPeriod.getDate() + this.periodDuration); // Add the period duration to get the next cycle start date
  return nextStartDate;
});

// Register the model with the virtual field
export default mongoose.model<IMenstrualHealth>("MenstrualHealth", MenstrualHealthSchema);
