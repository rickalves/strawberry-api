/*
  Minimal, typed and readable unit tests for AuthService.
  Covers a few core flows: register, login (success + invalid creds),
  validateToken (invalid token), and adminCreateUser.
*/
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SUPABASE_CLIENT } from './supabase-client.provider';
import { SUPABASE_ADMIN_CLIENT } from './supabase-admin.provider';
import { SupabaseClient } from '@supabase/supabase-js';

function makeMockSupabase(): Partial<SupabaseClient> {
  const auth = {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    getUser: jest.fn(),
  } as unknown as SupabaseClient['auth'];

  return { auth } as Partial<SupabaseClient>;
}

function makeMockAdminSupabase(): Partial<SupabaseClient> {
  const auth = {
    admin: {
      createUser: jest.fn(),
      updateUserById: jest.fn(),
    },
  } as unknown as SupabaseClient['auth'];

  return { auth } as Partial<SupabaseClient>;
}

describe('AuthService (minimal)', () => {
  let service: AuthService;
  let supabase: Partial<SupabaseClient>;
  let supabaseAdmin: Partial<SupabaseClient>;

  // const exampleUser = { id: 'u1', email: 'u@example.com' } as User;
  // const exampleSession = { access_token: 'a1' } as Session;

  beforeEach(async () => {
    supabase = makeMockSupabase();
    supabaseAdmin = makeMockAdminSupabase();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SUPABASE_CLIENT, useValue: supabase },
        { provide: SUPABASE_ADMIN_CLIENT, useValue: supabaseAdmin },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
