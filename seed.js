const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'dwarkeshrm707@gmail.com' },
    update: {},
    create: { name: 'Admin User', email: 'dwarkeshrm707@gmail.com', password: adminPassword, role: 'ADMIN' }
  });

  const sellerPassword = await bcrypt.hash('seller123', 10);
  await prisma.user.upsert({
    where: { email: 'seller@lapmart.com' },
    update: {},
    create: { name: 'Seller User', email: 'seller@lapmart.com', password: sellerPassword, role: 'SELLER' }
  });

  const buyerPassword = await bcrypt.hash('buyer123', 10);
  await prisma.user.upsert({
    where: { email: 'buyer@lapmart.com' },
    update: {},
    create: { name: 'Buyer User', email: 'buyer@lapmart.com', password: buyerPassword, role: 'BUYER' }
  });

  console.log("Seeded database successfully.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
