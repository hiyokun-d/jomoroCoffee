import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  Max,
  MinLength,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'minThreeWords', async: false })
class MinThreeWords implements ValidatorConstraintInterface {
  validate(value: string) {
    if (!value) return false;
    return value.trim().split(' ').filter((w) => w.length > 0).length >= 3;
  }
  defaultMessage() {
    return 'Name must contain at least 3 words';
  }
}

export class CreateProductDto {
  @ApiProperty({ example: 'Iced Caramel Latte' })
  @IsString()
  @Validate(MinThreeWords)
  name: string;

  @ApiProperty({ example: 'A rich and creamy caramel latte served over ice' })
  @IsString()
  @MinLength(20)
  description: string;

  @ApiProperty({ example: 35000 })
  @IsInt()
  @Min(1)
  price: number;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  @Max(999)
  stock: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  category_id: number;
}
