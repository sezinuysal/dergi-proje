// prisma/seed.cjs
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // 1) Roller - Detaylı yetki sistemi
  const roles = [
    {
      name: "owner",
      description: "Dergi sahibi - Tam yetki",
      permissions: JSON.stringify(["all"]),
      color: "#FF6B35",
      icon: "crown"
    },
    {
      name: "admin",
      description: "Yönetici - Tüm yayınlara erişim",
      permissions: JSON.stringify(["manage_users", "manage_publications", "access_all", "manage_roles"]),
      color: "#D62828",
      icon: "shield"
    },
    {
      name: "editor",
      description: "Editör - İçerik yönetimi",
      permissions: JSON.stringify(["edit_content", "publish_content", "access_assigned"]),
      color: "#003049",
      icon: "edit"
    },
    {
      name: "moderator",
      description: "Moderatör - İçerik moderasyonu",
      permissions: JSON.stringify(["moderate_content", "access_public"]),
      color: "#F77F00",
      icon: "moderator"
    },
    {
      name: "author",
      description: "Yazar - İçerik oluşturma",
      permissions: JSON.stringify(["create_content", "access_own"]),
      color: "#2A9D8F",
      icon: "pen"
    },
    {
      name: "subscriber",
      description: "Abone - Premium içerik erişimi",
      permissions: JSON.stringify(["access_subscribed"]),
      color: "#264653",
      icon: "star"
    },
    {
      name: "member",
      description: "Üye - Temel erişim",
      permissions: JSON.stringify(["access_public"]),
      color: "#6B7280",
      icon: "user"
    }
  ];

  const createdRoles = {};
  for (const roleData of roles) {
    createdRoles[roleData.name] = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: {
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        color: roleData.color,
        icon: roleData.icon
      },
    });
  }

  // 2) Rozetler - YouTube tarzı rozet sistemi
  const badges = [
    // Rol Rozetleri
    {
      name: "Dergi Sahibi",
      description: "Dergi Rastgele'nin kurucusu",
      icon: "crown",
      color: "#FF6B35",
      category: "role",
      rarity: "legendary"
    },
    {
      name: "Yönetici",
      description: "Sistem yöneticisi",
      icon: "shield",
      color: "#D62828",
      category: "role",
      rarity: "epic"
    },
    {
      name: "Editör",
      description: "İçerik editörü",
      icon: "edit",
      color: "#003049",
      category: "role",
      rarity: "rare"
    },
    {
      name: "Moderatör",
      description: "İçerik moderatörü",
      icon: "moderator",
      color: "#F77F00",
      category: "role",
      rarity: "rare"
    },
    {
      name: "Yazar",
      description: "İçerik yazarı",
      icon: "pen",
      color: "#2A9D8F",
      category: "role",
      rarity: "common"
    },
    // Başarım Rozetleri
    {
      name: "İlk Dergi",
      description: "İlk dergiyi okudun",
      icon: "book-open",
      color: "#10B981",
      category: "achievement",
      rarity: "common"
    },
    {
      name: "Düzenli Okuyucu",
      description: "10 dergi okudun",
      icon: "bookmark",
      color: "#3B82F6",
      category: "achievement",
      rarity: "rare"
    },
    {
      name: "Dergi Tutkunu",
      description: "50 dergi okudun",
      icon: "library",
      color: "#8B5CF6",
      category: "achievement",
      rarity: "epic"
    },
    {
      name: "Mini Seri Ustası",
      description: "5 mini seri tamamladın",
      icon: "award",
      color: "#F59E0B",
      category: "achievement",
      rarity: "epic"
    }
  ];

  const createdBadges = {};
  for (const badgeData of badges) {
    createdBadges[badgeData.name] = await prisma.badge.upsert({
      where: { name: badgeData.name },
      update: {},
      create: badgeData,
    });
  }

  // 3) Admin kullanıcı
  const email = "admin@dergi.local";
  const passwordHash = await bcrypt.hash("123456", 10); // Daha basit şifre

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
      name: "Admin User",
      bio: "Dergi Rastgele sistem yöneticisi"
    },
    create: {
      name: "Admin User",
      email,
      password: passwordHash,
      bio: "Dergi Rastgele sistem yöneticisi"
    },
  });

  // 4) Admin rolünü ve rozetlerini bağla
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: createdRoles.admin.id } },
    update: {},
    create: { userId: admin.id, roleId: createdRoles.admin.id },
  });

  // Admin'e tüm rozetleri ver
  for (const badge of Object.values(createdBadges)) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: admin.id, badgeId: badge.id } },
      update: {},
      create: { userId: admin.id, badgeId: badge.id },
    });
  }

  // 5) Yeni Test Admin Hesabı
  const testAdminEmail = "test@dergi.local";
  const testAdminPasswordHash = await bcrypt.hash("123456", 10); // Aynı basit şifre

  const testAdmin = await prisma.user.upsert({
    where: { email: testAdminEmail },
    update: {
      password: testAdminPasswordHash,
      name: "Test Admin",
      bio: "Test yönetici hesabı"
    },
    create: {
      name: "Test Admin",
      email: testAdminEmail,
      password: testAdminPasswordHash,
      bio: "Test yönetici hesabı"
    },
  });

  // Test Admin'e admin rolü ver
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: testAdmin.id, roleId: createdRoles.admin.id } },
    update: {},
    create: { userId: testAdmin.id, roleId: createdRoles.admin.id },
  });

  // Test Admin'e temel rozetleri ver
  const basicBadges = [createdBadges["Yönetici"], createdBadges["İlk Dergi"]];
  for (const badge of basicBadges) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: testAdmin.id, badgeId: badge.id } },
      update: {},
      create: { userId: testAdmin.id, badgeId: badge.id },
    });
  }

  // 6) Ek Test Hesabı - Normal Üye
  const normalUserEmail = "user@dergi.local";
  const normalUserPasswordHash = await bcrypt.hash("123456", 10);

  const normalUser = await prisma.user.upsert({
    where: { email: normalUserEmail },
    update: {
      password: normalUserPasswordHash,
      name: "Normal User",
      bio: "Normal üye hesabı"
    },
    create: {
      name: "Normal User",
      email: normalUserEmail,
      password: normalUserPasswordHash,
      bio: "Normal üye hesabı"
    },
  });

  // Normal üyeye member rolü ver
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: normalUser.id, roleId: createdRoles.member.id } },
    update: {},
    create: { userId: normalUser.id, roleId: createdRoles.member.id },
  });

  // Normal üyeye ilk rozet ver
  await prisma.userBadge.upsert({
    where: { userId_badgeId: { userId: normalUser.id, badgeId: createdBadges["İlk Dergi"].id } },
    update: {},
    create: { userId: normalUser.id, badgeId: createdBadges["İlk Dergi"].id },
  });

  // 5) Flipbook Template oluştur
  const template = await prisma.flipbookTemplate.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Standart Dergi Template",
      description: "60-80 sayfalık dergiler için temel template",
      baseFile: "/templates/standard-magazine.flipbook",
      config: JSON.stringify({
        pageWidth: 800,
        pageHeight: 600,
        autoPlay: false,
        showControls: true
      })
    }
  });

  // 6) Örnek Dergi oluştur
  const magazine = await prisma.publication.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Dijital Dergi Sayı 1",
      description: "İlk dijital dergi sayımız. Teknoloji, bilim ve kültür dünyasından en güncel haberler.",
      type: "magazine",
      issue: "Sayı 1",
      pageCount: 64,
      fileKey: "/publications/magazine-1.flipbook",
      coverImage: "/covers/magazine-1.jpg",
      isPublic: true,
      publishedAt: new Date(),
      templateId: template.id
    }
  });

  // 7) Mini Seri oluştur
  const miniSeries = await prisma.publication.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: "Teknoloji Serisi: Yapay Zeka",
      description: "Yapay zeka dünyasına kapsamlı bir bakış. 410 sayfalık detaylı inceleme.",
      type: "mini_series",
      issue: "Seri A",
      pageCount: 410,
      fileKey: "/publications/ai-series.flipbook",
      coverImage: "/covers/ai-series.jpg",
      isPublic: true,
      publishedAt: new Date(),
      templateId: template.id
    }
  });

  // 8) Admin'e tüm yayınlara erişim ver
  await prisma.publicationAccess.upsert({
    where: { userId_publicationId: { userId: admin.id, publicationId: magazine.id } },
    update: {},
    create: {
      userId: admin.id,
      publicationId: magazine.id,
      accessType: "admin"
    }
  });

  await prisma.publicationAccess.upsert({
    where: { userId_publicationId: { userId: admin.id, publicationId: miniSeries.id } },
    update: {},
    create: {
      userId: admin.id,
      publicationId: miniSeries.id,
      accessType: "admin"
    }
  });

  // 9) Admin için token oluştur
  const adminToken = await prisma.accessToken.upsert({
    where: { userId_publicationId: { userId: admin.id, publicationId: magazine.id } },
    update: {},
    create: {
      userId: admin.id,
      publicationId: magazine.id,
      token: "admin_magazine_1_token", // Gerçek JWT token olacak
      permissions: JSON.stringify(["read", "download", "admin"]),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 yıl
    }
  });

  console.log("Seed OK ✅", {
    admin: email,
    testAdmin: testAdminEmail,
    normalUser: normalUserEmail,
    password: "123456", // Tüm hesaplar için aynı şifre
    roles: Object.keys(createdRoles),
    badges: Object.keys(createdBadges),
    template: template.name,
    publications: [magazine.title, miniSeries.title],
    adminToken: adminToken.token
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
