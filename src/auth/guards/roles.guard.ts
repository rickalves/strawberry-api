// src/auth/guards/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guarda de papéis (roles) — verifica se o usuário tem um dos papéis necessários
 * para acessar o recurso.
 * Uso: @UseGuards(RolesGuard)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest<
      Request & {
        user?: {
          app_metadata?: { role?: string };
          role?: string;
          user_metadata?: { role?: string };
        };
      }
    >();

    const role =
      req?.user?.app_metadata?.role ??
      req?.user?.role ??
      req?.user?.user_metadata?.role ??
      'user';

    if (!required.includes(role)) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
