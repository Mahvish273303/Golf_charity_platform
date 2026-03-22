require("dotenv").config();
const mongoose = require("mongoose");
const Charity = require("../src/models/Charity");

const charities = [
  {
    name: "First Tee Future Fund",
    description: "Supports youth golf education and mentorship programs.",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5",
    contributionPercentage: 10,
  },
  {
    name: "Green Fairways Climate Trust",
    description: "Funds water restoration and sustainable course initiatives.",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
    contributionPercentage: 12,
  },
  {
    name: "Women in Golf Collective",
    description: "Expands women-led coaching and scholarship pathways.",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    contributionPercentage: 15,
  },
  {
    name: "Junior Caddie Scholarship Board",
    description: "Provides educational grants for student caddies.",
    image: "https://images.unsplash.com/photo-1543353071-10c8ba85a904",
    contributionPercentage: 10,
  },
  {
    name: "Inclusive Sports Access Foundation",
    description: "Builds accessible golf pathways for disabled athletes.",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136",
    contributionPercentage: 14,
  },
  {
    name: "Community Wellness Swing Initiative",
    description: "Combines golf events with local wellness outreach.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211",
    contributionPercentage: 11,
  },
  {
    name: "Rural Golf Outreach Mission",
    description: "Brings equipment and training to rural communities.",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8",
    contributionPercentage: 13,
  },
  {
    name: "Healthcare Heroes Charity Cup",
    description: "Raises support for frontline healthcare teams.",
    image: "https://images.unsplash.com/photo-1581595219315-a187dd40c322",
    contributionPercentage: 10,
  },
  {
    name: "Education Through Sport Alliance",
    description: "Uses golf to improve school engagement and life skills.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
    contributionPercentage: 12,
  },
  {
    name: "City Greens Youth League",
    description: "Runs after-school leagues and youth leadership training.",
    image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d",
    contributionPercentage: 10,
  },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  let inserted = 0;
  let updated = 0;

  for (const charity of charities) {
    const existing = await Charity.findOne({ name: charity.name }).lean();
    if (existing) {
      await Charity.updateOne({ _id: existing._id }, charity);
      updated += 1;
    } else {
      await Charity.create(charity);
      inserted += 1;
    }
  }

  console.log(`Done: ${inserted} inserted, ${updated} updated.`);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Failed to seed charities:", error.message);
  process.exit(1);
});
