import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const db = new PrismaClient({ adapter });

const categories = [
  { name: "Shirts", slug: "shirts", order: 1 },
  { name: "Pants", slug: "pants", order: 2 },
  { name: "Shorts", slug: "shorts", order: 3 },
  { name: "Dresses", slug: "dresses", order: 4 },
  { name: "Skirts", slug: "skirts", order: 5 },
  { name: "Jackets", slug: "jackets", order: 6 },
  { name: "Sweaters", slug: "sweaters", order: 7 },
  { name: "Shoes", slug: "shoes", order: 8 },
  { name: "Boots", slug: "boots", order: 9 },
  { name: "Accessories", slug: "accessories", order: 10 },
  { name: "Underwear", slug: "underwear", order: 11 },
  { name: "Socks", slug: "socks", order: 12 },
];

async function main() {
  console.log("seeding categories...");
  for (const cat of categories) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("seed completed");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
