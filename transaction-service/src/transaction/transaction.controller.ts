import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../guards/jwt.guard';

@ApiTags('Transactions')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('cart')
  @ApiOperation({ summary: 'Get cart with product details' })
  getCart(@Request() req: any) {
    return this.transactionService.getCart(req.user.id);
  }

  @Post('cart')
  @ApiOperation({ summary: 'Add item to cart' })
  addToCart(@Request() req: any, @Body() dto: AddToCartDto) {
    return this.transactionService.addToCart(req.user.id, dto);
  }

  @Post('cart/:product_id/update')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateCartItem(
    @Request() req: any,
    @Param('product_id', ParseIntPipe) productId: number,
    @Body() dto: UpdateCartDto,
  ) {
    return this.transactionService.updateCartItem(req.user.id, productId, dto);
  }

  @Post('cart/:product_id/delete')
  @ApiOperation({ summary: 'Remove item from cart' })
  deleteCartItem(
    @Request() req: any,
    @Param('product_id', ParseIntPipe) productId: number,
  ) {
    return this.transactionService.deleteCartItem(req.user.id, productId);
  }

  @Post('cart/clear')
  @ApiOperation({ summary: 'Clear all cart items' })
  clearCart(@Request() req: any) {
    return this.transactionService.clearCart(req.user.id);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders for authenticated user' })
  getOrders(@Request() req: any) {
    return this.transactionService.getOrders(req.user.id);
  }

  @Post('orders/:id')
  @ApiOperation({ summary: 'Get order details' })
  getOrderDetails(
    @Request() req: any,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    return this.transactionService.getOrderDetails(req.user.id, orderId);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Checkout — place order from cart' })
  checkout(@Request() req: any) {
    return this.transactionService.checkout(req.user.id);
  }
}
