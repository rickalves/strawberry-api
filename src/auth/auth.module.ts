// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { supabaseClientProvider } from './supabase-client.provider';
import { SupabaseAdminClientProvider } from './supabase-admin.provider'; // admin

@Module({
  imports: [
    // Se já é global no AppModule, você pode remover aqui.
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    supabaseClientProvider, // instancia o SupabaseClient (anon key) para o serviço
    SupabaseAdminClientProvider, // cliente ADMIN (service role)
  ],
  exports: [
    supabaseClientProvider, // permite injetar o SupabaseClient em outros módulos caso necessário
    SupabaseAdminClientProvider, // cliente ADMIN (service role)
    AuthService,
  ],
})
export class AuthModule {}
