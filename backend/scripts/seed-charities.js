require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const charities = [
  {
    name: "First Tee Future Fund",
    description: "Supports youth golf education, coaching, and local tournament access.",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5",
    contributionPercentage: 10,
  },
  {
    name: "Green Fairways Climate Trust",
    description: "Funds sustainability and water restoration projects for community courses.",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
    contributionPercentage: 12,
  },
  {
    name: "Women in Golf Collective",
    description: "Promotes women-led golf programs, mentorship, and scholarship support.",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    contributionPercentage: 15,
  },
  {
    name: "Junior Caddie Scholarship Board",
    description: "Provides financial aid and training resources for aspiring student caddies.",
    image: "https://images.unsplash.com/photo-1543353071-10c8ba85a904",
    contributionPercentage: 10,
  },
  {
    name: "Inclusive Sports Access Foundation",
    description: "Builds adaptive golf accessibility programs and inclusive sports facilities.",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136",
    contributionPercentage: 14,
  },
  {
    name: "Community Wellness Swing Initiative",
    description: "Combines golf and wellness events for underserved neighborhoods.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211",
    contributionPercentage: 11,
  },
  {
    name: "Rural Golf Outreach Mission",
    description: "Expands golf training and equipment libraries in remote communities.",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8",
    contributionPercentage: 13,
  },
  {
    name: "Healthcare Heroes Charity Cup",
    description: "Raises funds for frontline healthcare workers through charity golf drives.",
    image: "https://images.unsplash.com/photo-1581595219315-a187dd40c322",
    contributionPercentage: 10,
  },
  {
    name: "Education Through Sport Alliance",
    description: "Connects school students to life-skills education via golf development camps.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
    contributionPercentage: 12,
  },
  {
    name: "City Greens Youth League",
    description: "Runs after-school golf leagues and character-building sessions for teens.",
    image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d",
    contributionPercentage: 10,
  },
];

async function run() {
  for (const charity of charities) {
    const existing = await prisma.charity.findFirst({
      where: { name: charity.name },
      select: { id: true },
    });

    if (existing) {
      await prisma.charity.update({
        where: { id: existing.id },
        data: {
          description: charity.description,
          image: charity.image,
          contributionPercentage: charity.contributionPercentage,
        },
      });
    } else {
      await prisma.charity.create({ data: charity });
    }
  }
}

run()
  .then(async () => {
    // eslint-disable-next-line no-console
    console.log(`Seeded ${charities.length} charities successfully.`);
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to seed charities:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  });
