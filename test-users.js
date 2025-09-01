const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createUsers() {
  try {
    console.log("Kullanıcılar oluşturuluyor...");

    // 1. Admin User - TEK YÖNETİCİ
    const adminPassword = await bcrypt.hash("123456", 10);
    const admin = await prisma.user.upsert({
      where: { email: "admin@dergi.local" },
      update: {},
      create: {
        name: "Admin User",
        email: "admin@dergi.local",
        password: adminPassword,
        bio: "Dergi Rastgele sistem yöneticisi"
      }
    });
    console.log("✅ Admin oluşturuldu:", admin.email);

    // 2. Test User - NORMAL ÜYE (YÖNETİCİ DEĞİL!)
    const testUserPassword = await bcrypt.hash("123456", 10);
    const testUser = await prisma.user.upsert({
      where: { email: "test@dergi.local" },
      update: {},
      create: {
        name: "Test User",
        email: "test@dergi.local",
        password: testUserPassword,
        bio: "Test üye hesabı"
      }
    });
    console.log("✅ Test User oluşturuldu:", testUser.email);

    // 3. Normal User - NORMAL ÜYE
    const userPassword = await bcrypt.hash("123456", 10);
    const user = await prisma.user.upsert({
      where: { email: "user@dergi.local" },
      update: {},
      create: {
        name: "Normal User",
        email: "user@dergi.local",
        password: userPassword,
        bio: "Normal üye hesabı"
      }
    });
    console.log("✅ Normal User oluşturuldu:", user.email);

    // Rolleri oluştur
    const adminRole = await prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: {
        name: "admin",
        description: "Yönetici - Tüm yayınlara erişim",
        permissions: JSON.stringify(["manage_users", "manage_publications", "access_all", "manage_roles"]),
        color: "#D62828",
        icon: "shield"
      }
    });

    const memberRole = await prisma.role.upsert({
      where: { name: "member" },
      update: {},
      create: {
        name: "member",
        description: "Üye - Temel erişim",
        permissions: JSON.stringify(["access_public"]),
        color: "#6B7280",
        icon: "user"
      }
    });

    // SADECE Admin User'a admin rolü ver
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
      update: {},
      create: { userId: admin.id, roleId: adminRole.id }
    });
    console.log("✅ Admin User'a yönetici rolü verildi");

    // Test User ve Normal User'a SADECE member rolü ver
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: testUser.id, roleId: memberRole.id } },
      update: {},
      create: { userId: testUser.id, roleId: memberRole.id }
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: memberRole.id } },
      update: {},
      create: { userId: user.id, roleId: memberRole.id }
    });
    console.log("✅ Test User ve Normal User'a üye rolü verildi");

    // Eski admin rollerini temizle (eğer varsa)
    try {
      await prisma.userRole.deleteMany({
        where: {
          userId: { in: [testUser.id, user.id] },
          role: { name: "admin" }
        }
      });
      console.log("✅ Eski admin roller temizlendi");
    } catch (e) {
      // Hata yoksa devam et
    }

    console.log("\n🎯 Kullanıcılar ve yetkiler hazır!");
    console.log("🔴 Admin User:", admin.email, "Şifre: 123456 (TEK YÖNETİCİ)");
    console.log("⚪ Test User:", testUser.email, "Şifre: 123456 (ÜYE - YÖNETİCİ DEĞİL)");
    console.log("⚪ Normal User:", user.email, "Şifre: 123456 (ÜYE)");
    console.log("\n💡 SADECE Admin User dergi flipbook'larına erişebilir!");
    console.log("💡 Test User ve Normal User sadece public yayınları görebilir!");

  } catch (error) {
    console.error("❌ Hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers(); 