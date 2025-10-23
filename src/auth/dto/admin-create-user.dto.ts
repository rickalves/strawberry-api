// src/auth/dto/admin-create-user.dto.ts
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsIn,
} from 'class-validator';

export class AdminCreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsIn(['admin', 'manager', 'a'])
  role?: 'admin' | 'manager' | 'user';

  @IsOptional()
  @IsBoolean()
  emailConfirm?: boolean;
}
