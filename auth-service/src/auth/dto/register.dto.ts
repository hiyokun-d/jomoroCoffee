import {
  IsString,
  IsEmail,
  IsAlpha,
  MinLength,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
  ValidationArguments,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'isValidEmailTld', async: false })
class IsValidEmailTld implements ValidatorConstraintInterface {
  validate(email: string) {
    if (!email) return false;
    const lower = email.toLowerCase();
    return (
      lower.endsWith('.com') ||
      lower.endsWith('.net') ||
      lower.endsWith('.org') ||
      lower.endsWith('.id')
    );
  }
  defaultMessage() {
    return 'Email must end with .com, .net, .org, or .id';
  }
}

@ValidatorConstraint({ name: 'isValidPassword', async: false })
class IsValidPassword implements ValidatorConstraintInterface {
  validate(password: string) {
    if (!password || password.includes(' ')) return false;
    let digits = 0;
    for (const c of password) {
      if (c >= '0' && c <= '9') digits++;
    }
    return digits >= 2;
  }
  defaultMessage(args: ValidationArguments) {
    const val = args.value as string;
    if (!val) return 'Password is required';
    if (val.includes(' ')) return 'Password must not contain spaces';
    return 'Password must contain at least 2 numeric digits';
  }
}

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsAlpha()
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsAlpha()
  last_name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @Validate(IsValidEmailTld)
  email: string;

  @ApiProperty({ example: 'pass12word34' })
  @IsString()
  @MinLength(8)
  @Validate(IsValidPassword)
  password: string;
}
