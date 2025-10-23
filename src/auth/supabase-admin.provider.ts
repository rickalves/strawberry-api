// src/auth/supabase-admin.provider.ts
import { FactoryProvider } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_ADMIN_CLIENT = 'SUPABASE_ADMIN_CLIENT';

export const SupabaseAdminClientProvider: FactoryProvider<SupabaseClient> = {
  provide: SUPABASE_ADMIN_CLIENT,
  useFactory: () => {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
