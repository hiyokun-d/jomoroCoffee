import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ReduceStockDto } from './dto/reduce-stock.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  getAllProducts() {
    return this.prisma.product.findMany({ include: { category: true } });
  }

  async getProductById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  getAllCategories() {
    return this.prisma.category.findMany();
  }

  async getProductsByCategory(categoryId: number) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Category not found');
    return this.prisma.product.findMany({ where: { category_id: categoryId } });
  }

  async createProduct(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({ where: { id: dto.category_id } });
    if (!category) throw new BadRequestException('Category not found');

    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        image_url: dto.image_url ?? null,
        category_id: dto.category_id,
      },
    });
  }

  async updateProduct(id: number, dto: CreateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const category = await this.prisma.category.findUnique({ where: { id: dto.category_id } });
    if (!category) throw new BadRequestException('Category not found');

    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        image_url: dto.image_url ?? null,
        category_id: dto.category_id,
      },
    });
  }

  async reduceStock(id: number, dto: ReduceStockDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    if (dto.quantity > product.stock)
      throw new BadRequestException('Quantity exceeds available stock');

    return this.prisma.product.update({
      where: { id },
      data: { stock: product.stock - dto.quantity },
    });
  }

  async deleteProduct(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Product deleted' };
  }
}
