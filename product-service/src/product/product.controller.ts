import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ReduceStockDto } from './dto/reduce-stock.dto';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Products')
@Controller()
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('products')
  @ApiOperation({ summary: 'Get all products' })
  getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product by ID' })
  getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductById(id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  getAllCategories() {
    return this.productService.getAllCategories();
  }

  @Get('categories/:categoryId/products')
  @ApiOperation({ summary: 'Get products by category' })
  getProductsByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.productService.getProductsByCategory(categoryId);
  }

  @Post('admin/products')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product (Admin)' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Post('admin/products/:id/update')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (Admin)' })
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateProductDto) {
    return this.productService.updateProduct(id, dto);
  }

  @Post('admin/products/:id/reduce')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reduce product stock (Admin)' })
  reduceStock(@Param('id', ParseIntPipe) id: number, @Body() dto: ReduceStockDto) {
    return this.productService.reduceStock(id, dto);
  }

  @Post('admin/products/:id/delete')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (Admin)' })
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.deleteProduct(id);
  }

  @Post('products/:id/reduce-internal')
  @ApiOperation({ summary: 'Reduce stock (internal inter-service call)' })
  reduceStockInternal(@Param('id', ParseIntPipe) id: number, @Body() dto: ReduceStockDto) {
    return this.productService.reduceStock(id, dto);
  }
}
