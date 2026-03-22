require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = "mahvishpathan354@gmail.com";
  const existing = await User.findOne({ email });
  const passwordHash = await bcrypt.hash("123456", 10);

  if (existing) {
    existing.name = "Mahvish Pathan";
    existing.role = "ADMIN";
    existing.isActive = true;
    existing.password = passwordHash;
    await existing.save();
    console.log("Admin updated:", { id: String(existing._id), email: existing.email, role: existing.role });
    await mongoose.disconnect();
    return;
  }

  const admin = await User.create({
    name: "Mahvish Pathan",
    email,
    password: passwordHash,
    role: "ADMIN",
    isActive: true,
  });

  console.log("Admin created:", { id: String(admin._id), email: admin.email, role: admin.role });
  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
