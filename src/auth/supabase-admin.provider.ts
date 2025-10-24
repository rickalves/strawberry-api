// src/auth/supabase-admin.provider.ts
import { FactoryProvider } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

// Provider do Supabase Client com privilégios de administrador (service role key)
export const SUPABASE_ADMIN_CLIENT = 'SUPABASE_ADMIN_CLIENT';

export const SupabaseAdminClientProvider: FactoryProvider<SupabaseClient> = {
  provide: SUPABASE_ADMIN_CLIENT,
  inject: [ConfigService],

  // Criação do cliente Supabase com privilégios de administrador
  useFactory: (configService: ConfigService) => {
    const url = configService.get<string>('SUPABASE_URL') as string;
    const serviceRoleKey = configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    ) as string;

    if (!url || !serviceRoleKey) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars',
      );
    }

    // Client com privilégios de servidor (NUNCA expor essa key no frontend)
    return createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  },
};
