import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

const PRODUCT_SERVICE_URL = 'http://localhost:3002';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  private async fetchProduct(productId: number) {
    const res = await fetch(`${PRODUCT_SERVICE_URL}/products/${productId}`);
    if (!res.ok) throw new NotFoundException(`Product ${productId} not found`);
    return res.json();
  }

  private async getOrCreateCart(userId: number) {
    let cart = await this.prisma.cart.findFirst({ where: { user_id: userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { user_id: userId } });
    }
    return cart;
  }

  async getCart(userId: number) {
    const cart = await this.prisma.cart.findFirst({
      where: { user_id: userId },
      include: { items: true },
    });
    if (!cart || cart.items.length === 0) return { items: [] };

    const items = await Promise.all(
      cart.items.map(async (item) => {
        const product = await this.fetchProduct(item.product_id);
        return {
          product_id: item.product_id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        };
      }),
    );
    return { items };
  }

  async addToCart(userId: number, dto: AddToCartDto) {
    const product = await this.fetchProduct(dto.product_id);
    if (dto.quantity > product.stock)
      throw new BadRequestException('Quantity exceeds available stock');

    const cart = await this.getOrCreateCart(userId);

    const existing = await this.prisma.cartItem.findFirst({
      where: { cart_id: cart.id, product_id: dto.product_id },
    });
    if (existing) throw new BadRequestException('Product already in cart');

    await this.prisma.cartItem.create({
      data: { cart_id: cart.id, product_id: dto.product_id, quantity: dto.quantity },
    });
    return { message: 'Item added to cart' };
  }

  async updateCartItem(userId: number, productId: number, dto: UpdateCartDto) {
    const cart = await this.prisma.cart.findFirst({ where: { user_id: userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findFirst({
      where: { cart_id: cart.id, product_id: productId },
    });
    if (!item) throw new NotFoundException('Item not in cart');

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: dto.quantity },
    });
    return { message: 'Cart item updated' };
  }

  async deleteCartItem(userId: number, productId: number) {
    const cart = await this.prisma.cart.findFirst({ where: { user_id: userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findFirst({
      where: { cart_id: cart.id, product_id: productId },
    });
    if (!item) throw new NotFoundException('Item not in cart');

    await this.prisma.cartItem.delete({ where: { id: item.id } });
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: number) {
    const cart = await this.prisma.cart.findFirst({ where: { user_id: userId } });
    if (!cart) return { message: 'Cart is already empty' };

    await this.prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });
    return { message: 'Cart cleared' };
  }

  async getOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async getOrderDetails(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
      include: { details: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const details = await Promise.all(
      order.details.map(async (d) => {
        const product = await this.fetchProduct(d.product_id);
        return {
          product_id: d.product_id,
          name: product.name,
          quantity: d.quantity,
          price: d.price,
        };
      }),
    );
    return { order_id: order.id, created_at: order.created_at, details };
  }

  async checkout(userId: number) {
    const cart = await this.prisma.cart.findFirst({
      where: { user_id: userId },
      include: { items: true },
    });
    if (!cart || cart.items.length === 0)
      throw new BadRequestException('Cart is empty');

    const products = await Promise.all(
      cart.items.map((item) => this.fetchProduct(item.product_id)),
    );

    const order = await this.prisma.order.create({ data: { user_id: userId } });

    await this.prisma.orderDetail.createMany({
      data: cart.items.map((item, i) => ({
        order_id: order.id,
        product_id: item.product_id,
        price: products[i].price,
        quantity: item.quantity,
      })),
    });

    await Promise.all(
      cart.items.map((item) =>
        fetch(`${PRODUCT_SERVICE_URL}/products/${item.product_id}/reduce-internal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: item.quantity }),
        }),
      ),
    );

    await this.prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });

    return { message: 'Order placed successfully', order_id: order.id };
  }
}
