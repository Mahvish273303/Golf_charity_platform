const mongoose = require("mongoose");

const drawSchema = new mongoose.Schema(
  {
    numbers: [{ type: Number, required: true }],
    monthKey: { type: String, required: true, unique: true },
    isPublished: { type: Boolean, default: false },
    totalPool: { type: Number, default: 0 },
    jackpotRollover: { type: Number, default: 0 },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Draw", drawSchema);
