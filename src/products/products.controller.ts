import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';

import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) { }

  @Get()
  getProducts() {
    return this.productsService.getProducts();
  }

  @Post()
  createProduct(@Body() body: any) {
    return this.productsService.createProduct(body);
  }

  // @Get(':id')
  // getProduct(@Param('id') id: string) {
  //   return this.productsService.getProduct(Number(id));
  // }

  // @Post()
  // createProduct(@Body() body: any) {
  //   return this.productsService.createProduct(body);
  // }

  // @Patch(':id')
  // updateProduct(
  //   @Param('id') id: string,

  //   @Body() body: any,
  // ) {
  //   return this.productsService.updateProduct(
  //     Number(id),

  //     body,
  //   );
  // }

  // @Delete(':id')
  // deleteProduct(@Param('id') id: string) {
  //   return this.productsService.deleteProduct(Number(id));
  // }
}
