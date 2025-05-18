"use strict";
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
const mongoose_1 = __importStar(require("mongoose"));
// Define the MenstrualHealth schema
const MenstrualHealthSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
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
}, { timestamps: true });
// Virtual for next menstrual start date
MenstrualHealthSchema.virtual('nextMenstrualStartDate').get(function () {
    const lastPeriod = new Date(this.lastPeriod);
    const nextStartDate = new Date(lastPeriod);
    nextStartDate.setDate(lastPeriod.getDate() + this.periodDuration); // Add the period duration to get the next cycle start date
    return nextStartDate;
});
// Register the model with the virtual field
exports.default = mongoose_1.default.model("MenstrualHealth", MenstrualHealthSchema);
