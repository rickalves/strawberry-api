// dto/recover-password.dto.ts
import { IsEmail } from 'class-validator';

export class RecoverDto {
  @IsEmail()
  email: string;
}
