import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { JwtStrategy } from '../guards/jwt.strategy';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'jomoro_koffee_secret_2025',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, JwtStrategy],
})
export class TransactionModule {}
