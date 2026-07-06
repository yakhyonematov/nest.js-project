import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  private products = [
    {
      id: 1,
      title: 'Iphone 17',
      price: 5000,
    },
    {
      id: 2,
      title: 'Iphone 16',
      price: 4000,
    },
    {
      id: 3,
      title: 'Iphone 15',
      price: 3000,
    },
  ];

  // @getProducts() {
    // return this.products;
  // }

  // @getProduct(product: any) {
    // this.products.push(product);
    // return {
      // message: 'Product created!',
      // product,
    // };
  // }
// }

