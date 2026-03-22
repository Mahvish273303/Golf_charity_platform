const mongoose = require("mongoose");

const winnerVerificationSchema = new mongoose.Schema(
  {
    resultId: { type: mongoose.Schema.Types.ObjectId, ref: "Result", required: true, unique: true },
    drawId: { type: mongoose.Schema.Types.ObjectId, ref: "Draw", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    proofImage: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    paymentStatus: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("WinnerVerification", winnerVerificationSchema);
