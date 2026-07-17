import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async getProducts(query: GetProductsQueryDto = {}) {
    const { contains, minPrice, maxPrice, sort, page = 1, limit = 3 } = query;

    const where: any = {};

    if (contains) {
      where.OR = [
        { title: { contains, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined) {
      where.price = { ...where.price, gte: minPrice };
    }

    if (maxPrice !== undefined) {
      where.price = { ...where.price, lte: maxPrice };
    }

    const orderBy: any = {};
    if (sort) {
      const allowedSortFields = ['price', 'title', 'id'];
      if (allowedSortFields.includes(sort)) {
        orderBy[sort] = 'asc';
      } else {
        orderBy['price'] = 'asc';
      }
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: Object.keys(orderBy).length ? orderBy : undefined,
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createProduct(body: CreateProductDto) {
    return this.prisma.product.create({
      data: body,
    });
  }

  async getProduct(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async updateProduct(id: number, body: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: body,
    });
  }

  async deleteProduct(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
