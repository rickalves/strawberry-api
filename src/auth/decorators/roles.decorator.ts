import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para especificar os papéis (roles) necessários para acessar um endpoint.
 * Uso: @Roles('admin', 'manager')
 */
export type Role = 'admin' | 'manager' | 'user';
export const ROLES_KEY = 'roles';
// exportando a função Roles que usa SetMetadata para associar os papéis ao manipulador de rota
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
