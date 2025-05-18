"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartnerProfile = exports.getUserByPartnerId = void 0;
const User_1 = __importDefault(require("../models/User"));
const MenstrualHealth_1 = __importDefault(require("../models/MenstrualHealth")); // Adjust the import path as needed
const formatDate = (date) => {
    const options = {
        weekday: 'long', // Day of the week (e.g., "Monday")
        year: 'numeric',
        month: 'long', // Month name (e.g., "March")
        day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
};
// Utility function to calculate the next period (next cycle)
const calculateNextPeriod = (lastPeriodDate, cycleLength = 28) => {
    const nextPeriod = new Date(lastPeriodDate);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
    return nextPeriod;
};
const getUserByPartnerId = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const user = await User_1.default.findOne({ partnerId }).select("-password");
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Fetch menstrual health data for the user
        const menstrualHealth = await MenstrualHealth_1.default.findOne({ userId: user._id });
        if (!menstrualHealth) {
            res.status(404).json({ error: "Menstrual health data not found" });
            return;
        }
        // Calculate the next expected period based on last period date and the typical cycle length
        const nextPeriodDate = calculateNextPeriod(menstrualHealth.lastPeriod);
        const formattedMenstrualLastDay = formatDate(menstrualHealth.lastPeriod);
        const formattedNextPeriodDate = formatDate(nextPeriodDate);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            partnerId: user.partnerId,
            menstrualLastDay: formattedMenstrualLastDay, // Last menstrual date with day name and month
            expectedNextDate: formattedNextPeriodDate, // Next expected menstrual start date with day name and month
            commonSymptoms: menstrualHealth.commonSymptoms, // Common symptoms
            tryingToConceive: menstrualHealth.tryingToConceive, // Trying to conceive
            lastPeriod: menstrualHealth.lastPeriod, // Last period date
            periodDuration: menstrualHealth.periodDuration, // Period duration in days
            wantsHealthTips: menstrualHealth.wantsHealthTips, // Wants health tips
            cycleRegularity: menstrualHealth.cycleRegularity, // Cycle regularity (e.g., Regular, Irregular)
            medicalConditions: menstrualHealth.medicalConditions, // Medical conditions
            painLevel: menstrualHealth.painLevel, // Pain level (1 to 10)
            onMedication: menstrualHealth.onMedication, // On medication
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }
    catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.getUserByPartnerId = getUserByPartnerId;
// ✅ Get Partner's Profile using Partner ID
const getPartnerProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User_1.default.findById(userId).select("partnerId");
        if (!user || !user.partnerId) {
            res.status(404).json({ error: "User or partner not found" });
            return;
        }
        const partner = await User_1.default.findOne({ partnerId: user.partnerId }).select("-password");
        if (!partner) {
            res.status(404).json({ error: "Partner not found" });
            return;
        }
        res.json(partner);
    }
    catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.getPartnerProfile = getPartnerProfile;
