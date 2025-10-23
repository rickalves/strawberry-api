// src/auth/dto/set-role.dto.ts
import { IsIn, IsString } from 'class-validator';

export class SetRoleDto {
  @IsString()
  userId!: string;

  @IsIn(['user', 'admin', 'manager'])
  role!: 'user' | 'admin' | 'manager';
}
