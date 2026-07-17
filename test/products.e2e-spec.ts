import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';

describe('Products Pagination & Filtering (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  const adminEmail = `admin-${Date.now()}@test.com`;
  const adminPassword = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Register admin user
    await request(app.getHttpServer())
      .post('/users/register')
      .send({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: Role.ADMIN,
      })
      .expect(201);

    // Login to get access token
    const loginRes = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: adminEmail,
        password: adminPassword,
      })
      .expect(201);

    adminToken = loginRes.body.access_token;

    // Seed test products
    await prisma.product.deleteMany({});
    await prisma.product.createMany({
      data: [
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
      ],
    });
  });

  afterAll(async () => {
    // Clean up created admin
    await prisma.user.delete({ where: { email: adminEmail } });
    await prisma.product.deleteMany({});
    await app.close();
  });

  describe('GET /products', () => {
    it('should return default paginated list (page 1, limit 3)', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.items).toHaveLength(3);
      expect(response.body.meta).toEqual({
        total: 15,
        page: 1,
        limit: 3,
        totalPages: 5,
      });
    });

    it('should navigate to page 5 with 3 items', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?page=5&limit=3')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.items).toHaveLength(3);
      expect(response.body.meta.page).toBe(5);
      expect(response.body.meta.totalPages).toBe(5);
    });

    it('should filter by title using contains (case-insensitive)', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?contains=iphone')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // We have 'Apple iPhone 15' and 'Apple iPhone 15 Pro'
      expect(response.body.items).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
      expect(response.body.items[0].title).toContain('iPhone');
      expect(response.body.items[1].title).toContain('iPhone');
    });

    it('should filter by minPrice and maxPrice', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?minPrice=500&maxPrice=800&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // iPad Pro (799.99), Pixel 8 (699.99), Xiaomi 14 Pro (599.99)
      expect(response.body.items).toHaveLength(3);
      response.body.items.forEach((item: any) => {
        expect(item.price).toBeGreaterThanOrEqual(500);
        expect(item.price).toBeLessThanOrEqual(800);
      });
    });

    it('should sort products by price in ascending order', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?sort=price&limit=15')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const prices = response.body.items.map((item: any) => item.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });

    it('should block unauthorized requests', async () => {
      await request(app.getHttpServer())
        .get('/products')
        .expect(401);
    });
  });
});
