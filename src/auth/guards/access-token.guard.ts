// src/auth/guards/access-token.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

/**
 * Guarda que valida o token de acesso (Bearer) e anexa o usuário decodificado na request.
 * Uso: @UseGuards(AccessTokenGuard)
 */

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx
      .switchToHttp()
      .getRequest<Request & { user?: unknown; accessToken?: string }>();
    const authHeader: string | undefined = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    const token = authHeader.substring('Bearer '.length).trim();
    const user = await this.authService.validateToken(token);

    // anexa o usuário decodificado na request
    req.user = user;
    req.accessToken = token;
    return true;
  }
}
