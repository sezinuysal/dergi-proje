const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickTest() {
  try {
    console.log('🔍 Veritabanı kontrol ediliyor...');
    
    const userCount = await prisma.user.count();
    console.log(`👥 Toplam kullanıcı: ${userCount}`);
    
    if (userCount === 0) {
      console.log('➕ Test kullanıcısı ekleniyor...');
      
      const newUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      });
      
      console.log('✅ Kullanıcı eklendi:', newUser);
    }
    
    const allUsers = await prisma.user.findMany();
    console.log('📋 Tüm kullanıcılar:', allUsers);
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickTest();