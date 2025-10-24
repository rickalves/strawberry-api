// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Patch,
  UseGuards,
  HttpException,
  UnauthorizedException,
  Res,
} from '@nestjs/common';

import type { Response } from 'express';
import type { User } from '@supabase/supabase-js';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RecoverDto as RecoverPasswordDto } from './dto/recover.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

import { AccessTokenGuard } from './guards/access-token.guard';
import { CurrentUser as UserDecorator } from './decorators/user.decorator';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { SetRoleDto } from './dto/set-role.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registro de usuário — público
   */
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<unknown> {
    try {
      return await this.authService.register(dto);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro no registro de usuário';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Login — público. Define headers com tokens e retorna apenas o usuário
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    // res é opcionalmente injetado pelo Nest; com passthrough não precisamos retornar Response
    // e ainda conseguimos setar headers customizados
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: User | null }> {
    try {
      const { user, session } = await this.authService.login(dto);

      // Cabeçalhos para o cliente armazenar
      res.setHeader('Authorization', `Bearer ${session!.access_token}`);
      res.setHeader('x-refresh-token', session!.refresh_token);

      return { user };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Falha ao fazer login';
      throw new HttpException(message, HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Login com Google — público. Retorna URL de redirecionamento
   */
  @HttpCode(HttpStatus.OK)
  @Get('login/google')
  async loginGoogle(): Promise<{ url: string }> {
    try {
      const data = await this.authService.loginWithGoogle();
      if (!data?.url) {
        throw new HttpException(
          'Erro ao obter URL de login com Google',
          HttpStatus.BAD_REQUEST,
        );
      }
      return { url: data.url };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro no login com Google';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Retorna dados do usuário autenticado — protegido (Bearer)
   */
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  getProfile(@UserDecorator() user: User): User {
    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }
    return user;
  }

  /**
   * Solicita recuperação de senha — público
   */
  @HttpCode(HttpStatus.OK)
  @Post('recover-password')
  async recoverPassword(
    @Body() dto: RecoverPasswordDto,
  ): Promise<{ message: string }> {
    try {
      return await this.authService.recoverPassword(dto.email);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao recuperar senha';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Atualiza senha do usuário autenticado — protegido (Bearer)
   */
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('update-password')
  async updatePassword(
    @Body() dto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    try {
      return await this.authService.updatePassword(dto);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao atualizar senha';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Logout do usuário autenticado — protegido (Bearer)
   */
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(): Promise<{ message: string }> {
    try {
      return await this.authService.logout();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao fazer logout';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Rota protegida para "user" (ou "admin")
   */
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('user', 'admin')
  @Get('test/user')
  testUser(@UserDecorator() user: User) {
    return {
      ok: true,
      uid: user.id,
      role: user.app_metadata.role as string,
    };
  }
  /**
   * ADMIN: cria usuário já com role segura em app_metadata
   */
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @Post('admin/create-user')
  async adminCreateUser(@Body() dto: AdminCreateUserDto) {
    try {
      const user = await this.authService.adminCreateUser({
        email: dto.email,
        password: dto.password,
        fullName: dto.fullName,
        role: dto.role ?? 'user',
        emailConfirm: dto.emailConfirm ?? false,
      });

      const appMetadata = (user.app_metadata ?? {}) as Record<string, unknown>;
      const role =
        typeof appMetadata['role'] === 'string' ? appMetadata['role'] : 'user';

      return {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          role,
        },
      };
    } catch (err: unknown) {
      const defaultMessage = 'Erro ao criar usuário (admin)';
      let message = defaultMessage;
      let status = HttpStatus.BAD_REQUEST;
      if (err instanceof HttpException) {
        message = err.message;
        status = err.getStatus();
      }
      throw new HttpException(message, status);
    }
  }
  /**
   * ADMIN: altera a role de um usuário (app_metadata.role)
   */
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Patch('admin/set-role')
  async setRole(@Body() dto: SetRoleDto) {
    try {
      const user = await this.authService.setRole(dto.userId, dto.role);
      const appMetadata = (user.app_metadata ?? {}) as Record<string, unknown>;
      const role =
        typeof appMetadata['role'] === 'string' ? appMetadata['role'] : 'user';
      return {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          role,
        },
      };
    } catch (err: any) {
      const defaultMessage = 'Erro ao criar usuário (admin)';
      let message = defaultMessage;
      let status = HttpStatus.BAD_REQUEST;
      if (err instanceof HttpException) {
        message = err.message;
        status = err.getStatus();
      }
      throw new HttpException(message, status);
    }
  }
}
