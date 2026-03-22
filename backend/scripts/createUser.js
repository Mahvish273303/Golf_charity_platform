require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");

async function createUser() {
  const email = process.argv[2] || "manualuser@example.com";
  const password = process.argv[3] || "123456";
  const name = process.argv[4] || "Manual User";
  await mongoose.connect(process.env.MONGO_URI);
  const passwordHash = await bcrypt.hash(String(password), 10);

  const user = await User.findOneAndUpdate(
    { email: String(email).toLowerCase().trim() },
    {
      name,
      email: String(email).toLowerCase().trim(),
      password: passwordHash,
      role: "USER",
      isActive: true,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  console.log("User ready:", { id: String(user._id), email: user.email, role: user.role });
  await mongoose.disconnect();
}

createUser().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
