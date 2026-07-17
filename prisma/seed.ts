import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing products to ensure clean state
  await prisma.product.deleteMany({});

  const productsData = [
    { title: 'Apple iPhone 15', price: 999.99 },
    { title: 'Apple iPhone 15 Pro', price: 1199.99 },
    { title: 'Apple iPad Pro', price: 799.99 },
    { title: 'Apple MacBook Pro', price: 1999.99 },
    { title: 'Samsung Galaxy S24', price: 899.99 },
    { title: 'Samsung Galaxy Ultra', price: 1299.99 },
    { title: 'Google Pixel 8', price: 699.99 },
    { title: 'Xiaomi 14 Pro', price: 599.99 },
    { title: 'Sony WH-1000XM5', price: 349.99 },
    { title: 'Dell XPS 15', price: 1499.99 },
    { title: 'Asus ROG Zephyrus', price: 1799.99 },
    { title: 'Nintendo Switch', price: 299.99 },
    { title: 'Sony PlayStation 5', price: 499.99 },
    { title: 'Microsoft Xbox Series X', price: 499.99 },
    { title: 'Bose QuietComfort Ultra', price: 429.99 },
  ];

  console.log('Seeding products...');
  for (const product of productsData) {
    await prisma.product.create({
      data: product,
    });
  }
  console.log('Successfully seeded 15 products!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
