// auth/supabase-client.provider.ts
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

// Provider do Supabase Client padrão (anon key)
export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

export const supabaseClientProvider = {
  provide: SUPABASE_CLIENT,
  inject: [ConfigService],
  // Use the exact return type of createClient to avoid generic mismatches
  useFactory: (
    configService: ConfigService,
  ): ReturnType<typeof createClient> => {
    const supabaseUrl = configService.get<string>('SUPABASE_URL') as string;
    const supabaseKey = configService.get<string>(
      'SUPABASE_ANON_KEY',
    ) as string;
    return createClient(supabaseUrl, supabaseKey);
  },
};
