import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Memulai seeding database Buwuhan Platform...");

  // 1. Seed Templates Terlebih Dahulu (diperlukan untuk relasi undangan)
  const templates = [
    {
      name: "Royal Floral",
      slug: "royal-floral",
      tier: "FREE" as const,
      eventCategory: "WEDDING" as const,
      previewImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
      isActive: true,
    },
    {
      name: "Modern Minimalist",
      slug: "modern-minimalist",
      tier: "FREE" as const,
      eventCategory: "WEDDING" as const,
      previewImageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
      isActive: true,
    },
    {
      name: "Javanese Classic",
      slug: "javanese-classic",
      tier: "FREE" as const,
      eventCategory: "WEDDING" as const,
      previewImageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=800",
      isActive: true,
    },
    {
      name: "Khitanan Ceria Blue",
      slug: "khitanan-ceria-blue",
      tier: "FREE" as const,
      eventCategory: "KHITANAN" as const,
      previewImageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=800",
      isActive: true,
    },
    {
      name: "Rasulan Syukuran Gold",
      slug: "rasulan-syukuran-gold",
      tier: "FREE" as const,
      eventCategory: "RASULAN" as const,
      previewImageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800",
      isActive: true,
    },
  ];

  const seededTemplates: Record<string, string> = {};
  for (const tpl of templates) {
    const createdTemplate = await prisma.template.upsert({
      where: { slug: tpl.slug },
      update: {
        name: tpl.name,
        tier: tpl.tier,
        eventCategory: tpl.eventCategory,
        previewImageUrl: tpl.previewImageUrl,
        isActive: tpl.isActive,
      },
      create: tpl,
    });
    seededTemplates[tpl.slug] = createdTemplate.id;
    console.log(`✅ Template: ${createdTemplate.name} (${createdTemplate.eventCategory})`);
  }

  // 2. Seed Akun Pengguna
  // A. Super Admin
  const adminPasswordHash = await bcrypt.hash("Admin123#", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@buwuhan.com" },
    update: {
      fullName: "Super Admin Buwuhan",
      role: "ADMIN",
      planTier: "MAX",
    },
    create: {
      fullName: "Super Admin Buwuhan",
      email: "admin@buwuhan.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      planTier: "MAX",
    },
  });
  console.log(`✅ Admin siap: ${admin.email} (Password: Admin123# | Role: ADMIN | Tier: MAX)`);

  // B. User Reguler (FREE Tier)
  const userPasswordHash = await bcrypt.hash("User123#", 10);
  const regularUser = await prisma.user.upsert({
    where: { email: "user@buwuhan.com" },
    update: {
      fullName: "Budi Santoso",
      role: "USER",
      planTier: "FREE",
    },
    create: {
      fullName: "Budi Santoso",
      email: "user@buwuhan.com",
      passwordHash: userPasswordHash,
      role: "USER",
      planTier: "FREE",
    },
  });
  console.log(`✅ Regular User: ${regularUser.email} (Password: User123# | Role: USER | Tier: FREE)`);

  // C. Premium User (PRO Tier)
  const proUserPasswordHash = await bcrypt.hash("Premium123#", 10);
  const premiumUser = await prisma.user.upsert({
    where: { email: "premium@buwuhan.com" },
    update: {
      fullName: "Siti Rahmawati",
      role: "USER",
      planTier: "PRO",
    },
    create: {
      fullName: "Siti Rahmawati",
      email: "premium@buwuhan.com",
      passwordHash: proUserPasswordHash,
      role: "USER",
      planTier: "PRO",
    },
  });
  console.log(`✅ Premium User: ${premiumUser.email} (Password: Premium123# | Role: USER | Tier: PRO)`);

  // 3. Seed Sample Undangan, Tamu, & RSVP untuk Demo Dashboard & Moderasi
  // A. Undangan 1: Wedding Aktif (Milik Budi Santoso)
  const weddingInvitation = await prisma.invitation.upsert({
    where: { slug: "pernikahan-budi-dan-siti" },
    update: {
      title: "The Wedding of Budi & Siti",
      status: "ACTIVE",
      eventCategory: "WEDDING",
      templateId: seededTemplates["royal-floral"],
      publishedAt: new Date(),
      eventDate: new Date("2026-10-18T09:00:00.000Z"),
      eventTime: "09:00 - 14:00 WIB",
      venue: "Grand Ballroom Hotel Indonesia",
      address: "Jl. M.H. Thamrin No. 1, Jakarta Pusat",
      additionalInfo: { dresscode: "Batik / Formal Pastel" },
    },
    create: {
      title: "The Wedding of Budi & Siti",
      slug: "pernikahan-budi-dan-siti",
      status: "ACTIVE",
      eventCategory: "WEDDING",
      templateId: seededTemplates["royal-floral"],
      ownerId: regularUser.id,
      publishedAt: new Date(),
      eventDate: new Date("2026-10-18T09:00:00.000Z"),
      eventTime: "09:00 - 14:00 WIB",
      venue: "Grand Ballroom Hotel Indonesia",
      address: "Jl. M.H. Thamrin No. 1, Jakarta Pusat",
      additionalInfo: { dresscode: "Batik / Formal Pastel" },
    },
  });

  // Seed Calon Mempelai
  await prisma.couple.deleteMany({ where: { invitationId: weddingInvitation.id } });
  await prisma.couple.createMany({
    data: [
      {
        invitationId: weddingInvitation.id,
        name: "Siti Rahmawati, S.Kom",
        type: "BRIDE",
        fatherName: "H. Ahmad Fauzi",
        motherName: "Hj. Siti Mariam",
      },
      {
        invitationId: weddingInvitation.id,
        name: "Budi Santoso, S.T",
        type: "GROOM",
        fatherName: "H. Bambang Hermanto",
        motherName: "Hj. Sri Wahyuni",
      },
    ],
  });

  // Seed Tamu & RSVP
  const guest1 = await prisma.guest.upsert({
    where: { qrCode: "QR-BUDI-GUEST-001" },
    update: {
      name: "Ahmad Dahlan",
      category: "VIP",
      isAttended: true,
      checkedInAt: new Date(),
      paxCount: 2,
      paxActual: 2,
    },
    create: {
      invitationId: weddingInvitation.id,
      name: "Ahmad Dahlan",
      category: "VIP",
      qrCode: "QR-BUDI-GUEST-001",
      phone: "081234567890",
      paxCount: 2,
      paxActual: 2,
      isAttended: true,
      checkedInAt: new Date(),
    },
  });

  await prisma.rsvp.upsert({
    where: {
      invitationId_guestId: {
        invitationId: weddingInvitation.id,
        guestId: guest1.id,
      },
    },
    update: {
      status: "CONFIRMED",
      reservation: 2,
      message: "Selamat Budi & Siti! Semoga menjadi keluarga yang sakinah mawaddah warahmah.",
    },
    create: {
      invitationId: weddingInvitation.id,
      guestId: guest1.id,
      status: "CONFIRMED",
      reservation: 2,
      message: "Selamat Budi & Siti! Semoga menjadi keluarga yang sakinah mawaddah warahmah.",
    },
  });

  const guest2 = await prisma.guest.upsert({
    where: { qrCode: "QR-BUDI-GUEST-002" },
    update: {
      name: "Dewi Lestari",
      category: "Sahabat",
      isAttended: false,
      paxCount: 1,
    },
    create: {
      invitationId: weddingInvitation.id,
      name: "Dewi Lestari",
      category: "Sahabat",
      qrCode: "QR-BUDI-GUEST-002",
      phone: "081298765432",
      paxCount: 1,
      isAttended: false,
    },
  });

  await prisma.rsvp.upsert({
    where: {
      invitationId_guestId: {
        invitationId: weddingInvitation.id,
        guestId: guest2.id,
      },
    },
    update: {
      status: "DECLINED",
      reservation: 1,
      message: "Selamat menempuh hidup baru! Maaf belum bisa hadir langsung karena dinas luar kota.",
    },
    create: {
      invitationId: weddingInvitation.id,
      guestId: guest2.id,
      status: "DECLINED",
      reservation: 1,
      message: "Selamat menempuh hidup baru! Maaf belum bisa hadir langsung karena dinas luar kota.",
    },
  });
  console.log(`✅ Sample Undangan Aktif: ${weddingInvitation.title} (${weddingInvitation.slug}) dengan tamu & RSVP`);

  // B. Undangan 2: Khitanan Draft (Milik Siti Rahmawati)
  const khitanInvitation = await prisma.invitation.upsert({
    where: { slug: "khitanan-rayyan-al-fatih" },
    update: {
      title: "Syukuran Walimatul Khitan Rayyan",
      status: "DRAFT",
      eventCategory: "KHITANAN",
      templateId: seededTemplates["khitanan-ceria-blue"],
      eventDate: new Date("2026-11-22T10:00:00.000Z"),
      eventTime: "10:00 - 13:00 WIB",
      venue: "Kediaman Keluarga Bapak Hendra",
      address: "Jl. Anggrek No. 25, Bandung",
      additionalInfo: {},
    },
    create: {
      title: "Syukuran Walimatul Khitan Rayyan",
      slug: "khitanan-rayyan-al-fatih",
      status: "DRAFT",
      eventCategory: "KHITANAN",
      templateId: seededTemplates["khitanan-ceria-blue"],
      ownerId: premiumUser.id,
      eventDate: new Date("2026-11-22T10:00:00.000Z"),
      eventTime: "10:00 - 13:00 WIB",
      venue: "Kediaman Keluarga Bapak Hendra",
      address: "Jl. Anggrek No. 25, Bandung",
      additionalInfo: {},
    },
  });
  console.log(`✅ Sample Undangan Draft: ${khitanInvitation.title} (${khitanInvitation.slug})`);

  console.log("\n🎉 Seeding database selesai dengan sukses!");
  console.log("──────────────────────────────────────────────────────────────────");
  console.log("Akun Uji Coba:");
  console.log("1. Superadmin   : admin@buwuhan.com   | Admin123#    (Role: ADMIN, Tier: MAX)");
  console.log("2. Regular User : user@buwuhan.com    | User123#     (Role: USER,  Tier: FREE)");
  console.log("3. Premium User : premium@buwuhan.com | Premium123#  (Role: USER,  Tier: PRO)");
  console.log("──────────────────────────────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
