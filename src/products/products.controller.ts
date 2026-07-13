import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { RolesGuard } from '../user/roles.guard';
import { Roles } from '../user/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  getProducts() {
    return this.productsService.getProducts();
  }

  @Get(':id')
  getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getProduct(id);
  }

  @Post()
  createProduct(@Body() body: CreateProductDto) {
    return this.productsService.createProduct(body);
  }

  @Patch(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, body);
  }

  @Delete(':id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }
}
