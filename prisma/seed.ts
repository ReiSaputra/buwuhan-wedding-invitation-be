import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Memulai seeding database...");

  // 1. Seed Superadmin
  const adminPasswordHash = await bcrypt.hash("Admin123#", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@buwuhan.com" },
    update: {
      role: "ADMIN",
      planTier: "MAX",
    },
    create: {
      fullName: "Super Admin",
      email: "admin@buwuhan.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      planTier: "MAX",
    },
  });
  console.log(`✅ Admin siap: ${admin.email} (Password: Admin123#)`);

  // 2. Seed Default Templates (sesuai Mockup UI)
  const templates = [
    {
      name: "Royal Floral",
      slug: "royal-floral",
      tier: "FREE" as const,
      previewImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
      isActive: true,
    },
    {
      name: "Modern Minimalist",
      slug: "modern-minimalist",
      tier: "FREE" as const,
      previewImageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
      isActive: true,
    },
    {
      name: "Javanese Classic",
      slug: "javanese-classic",
      tier: "FREE" as const,
      previewImageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=800",
      isActive: true,
    },
  ];

  for (const tpl of templates) {
    const createdTemplate = await prisma.template.upsert({
      where: { slug: tpl.slug },
      update: {
        name: tpl.name,
        tier: tpl.tier,
        previewImageUrl: tpl.previewImageUrl,
        isActive: tpl.isActive,
      },
      create: tpl,
    });
    console.log(`✅ Template siap: ${createdTemplate.name} [ID: ${createdTemplate.id}]`);
  }

  console.log("🎉 Seeding selesai dengan sukses!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
