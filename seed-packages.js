import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TokenPackages...');

  // Limpa pacotes existentes para evitar duplicação (opcional, dependendo do caso de uso)
  await prisma.tokenPackage.deleteMany({});

  const packages = [
    { tokens: 5, price: 25.0, popular: false },
    { tokens: 10, price: 45.0, popular: true },
    { tokens: 20, price: 80.0, popular: false },
  ];

  for (const pkg of packages) {
    await prisma.tokenPackage.create({
      data: pkg,
    });
    console.log(`Created package: ${pkg.tokens} fichas for R$ ${pkg.price}`);
  }

  console.log('TokenPackages seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
