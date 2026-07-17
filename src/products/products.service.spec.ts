import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;

  const mockProducts = [
    { id: 1, title: 'iPhone 15', price: 999.99, img: null },
    { id: 2, title: 'iPhone 15 Pro', price: 1199.99, img: null },
    { id: 3, title: 'Samsung S24', price: 899.99, img: null },
    { id: 4, title: 'MacBook Air', price: 1299.99, img: null },
    { id: 5, title: 'iPad Pro', price: 799.99, img: null },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              findMany: jest.fn().mockResolvedValue(mockProducts.slice(0, 3)),
              count: jest.fn().mockResolvedValue(mockProducts.length),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProducts', () => {
    it('should return paginated products with default pagination (limit 3, page 1)', async () => {
      const result = await service.getProducts({});

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: undefined,
        skip: 0,
        take: 3,
      });
      expect(prismaService.product.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({
        items: mockProducts.slice(0, 3),
        meta: {
          total: 5,
          page: 1,
          limit: 3,
          totalPages: 2,
        },
      });
    });

    it('should filter by contains (case-insensitive search)', async () => {
      await service.getProducts({ contains: 'iphone' });

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ title: { contains: 'iphone', mode: 'insensitive' } }],
        },
        orderBy: undefined,
        skip: 0,
        take: 3,
      });
    });

    it('should filter by minPrice and maxPrice', async () => {
      await service.getProducts({ minPrice: 800, maxPrice: 1200 });

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          price: { gte: 800, lte: 1200 },
        },
        orderBy: undefined,
        skip: 0,
        take: 3,
      });
    });

    it('should sort by field ascending', async () => {
      await service.getProducts({ sort: 'price' });

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { price: 'asc' },
        skip: 0,
        take: 3,
      });
    });

    it('should default sort to price asc if sort query is passed but invalid field', async () => {
      await service.getProducts({ sort: 'invalid_field' });

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { price: 'asc' },
        skip: 0,
        take: 3,
      });
    });

    it('should paginate correctly on page 2', async () => {
      await service.getProducts({ page: 2, limit: 3 });

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: undefined,
        skip: 3,
        take: 3,
      });
    });
  });
});
