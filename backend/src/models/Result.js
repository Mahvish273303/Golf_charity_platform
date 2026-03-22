const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    drawId: { type: mongoose.Schema.Types.ObjectId, ref: "Draw", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    charityId: { type: mongoose.Schema.Types.ObjectId, ref: "Charity", default: null },
    scoreId: { type: mongoose.Schema.Types.ObjectId, ref: "Score", default: null },
    matchedCount: { type: Number, default: 0 },
    matchTier: { type: String, default: "NO_WIN" },
    isWinner: { type: Boolean, default: false },
    prizeAmount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Result", resultSchema);
